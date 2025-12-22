import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname);
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const sendJson = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
};

const readRequestBody = async (req) => {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};

const serveFile = async (filePath, res) => {
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  } catch (error) {
    res.writeHead(404);
    res.end("Not found");
  }
};

const handleImageGeneration = async (req, res) => {
  const { prompt, apiKey } = await readRequestBody(req);
  const resolvedKey =
    (process.env.OPENAI_API_KEY || "").trim() || (apiKey || "").trim();

  if (!prompt || !prompt.trim()) {
    sendJson(res, 400, {
      error: "Missing prompt.",
      code: "missing_prompt",
    });
    return;
  }

  if (!resolvedKey) {
    sendJson(res, 400, {
      error: "Missing OpenAI API key.",
      code: "missing_api_key",
    });
    return;
  }

  let upstream;
  try {
    upstream = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resolvedKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt.trim(),
        size: "1024x1024",
      }),
    });
  } catch (error) {
    sendJson(res, 502, {
      error: "Failed to reach OpenAI.",
      code: "openai_network_error",
    });
    return;
  }

  let data = {};
  try {
    data = await upstream.json();
  } catch {
    data = {};
  }

  if (!upstream.ok) {
    const message =
      data?.error?.message || `OpenAI request failed (${upstream.status}).`;
    sendJson(res, upstream.status, {
      error: message,
      code: "openai_error",
    });
    return;
  }

  const b64 = data?.data?.[0]?.b64_json;
  const url = data?.data?.[0]?.url;

  if (!b64 && !url) {
    sendJson(res, 502, {
      error: "OpenAI response missing image data.",
      code: "missing_image_data",
    });
    return;
  }

  const imageUrl = b64 ? `data:image/png;base64,${b64}` : url;
  sendJson(res, 200, { imageUrl });
};

const startServer = () =>
  new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

      if (urlPath === "/api/image") {
        if (req.method !== "POST") {
          sendJson(res, 405, {
            error: "Method not allowed.",
            code: "method_not_allowed",
          });
          return;
        }

        await handleImageGeneration(req, res);
        return;
      }

      const requested = urlPath === "/" ? "/index.html" : urlPath;
      const filePath = path.join(repoRoot, requested);

      try {
        const stats = await stat(filePath);
        if (stats.isDirectory()) {
          await serveFile(path.join(filePath, "index.html"), res);
        } else {
          await serveFile(filePath, res);
        }
      } catch {
        await serveFile(path.join(repoRoot, "index.html"), res);
      }
    });

    server.on("error", (err) => reject(err));
    server.listen(port, host, () => resolve(server));
  });

startServer()
  .then(() => {
    console.log(`Server running at http://${host}:${port}`);
  })
  .catch((error) => {
    console.error("Server failed to start:", error);
    process.exit(1);
  });
