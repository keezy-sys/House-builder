import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { handleEvidenceApi } from "./evidence-store.mjs";
import { handleEmailApi } from "./email-store.mjs";
import { handleTasksApi } from "./tasks-store.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname);
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";
const imageModel =
  (process.env.OPENAI_IMAGE_MODEL || "dall-e-3").trim() || "dall-e-3";
const chatModel =
  (process.env.OPENAI_CHAT_MODEL || "gpt-4.1").trim() || "gpt-4.1";
const chatReasoningEffort =
  (process.env.OPENAI_REASONING_EFFORT || "auto").trim().toLowerCase() ||
  "auto";

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

const parseDataUrl = (value = "") => {
  const match = String(value).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, payload] = match;
  try {
    return { mime, buffer: Buffer.from(payload, "base64") };
  } catch {
    return null;
  }
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

const getChatConfig = () => ({
  model: chatModel,
  reasoningEffort: chatReasoningEffort || "auto",
});

const normalizeChatMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const role = String(message.role || "").trim();
      if (!["user", "assistant"].includes(role)) return null;
      const content = String(message.content || "").trim();
      if (!content) return null;
      return { role, content };
    })
    .filter(Boolean);
};

const extractChatResponseText = (payload) => {
  const outputText = String(payload?.output_text || "").trim();
  if (outputText) return outputText;
  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      const text = String(part?.text || part?.output_text || "").trim();
      if (text) return text;
    }
  }
  const choiceText = String(
    payload?.choices?.[0]?.message?.content || "",
  ).trim();
  if (choiceText) return choiceText;
  return "";
};

const handleChatRequest = async (req, res) => {
  const body = await readRequestBody(req);
  const messages = normalizeChatMessages(body?.messages);
  const context = typeof body?.context === "string" ? body.context.trim() : "";

  if (!messages.length) {
    sendJson(res, 400, {
      error: "Missing chat messages.",
      code: "missing_messages",
    });
    return;
  }

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    sendJson(res, 400, {
      error: "Missing OpenAI API key.",
      code: "missing_api_key",
    });
    return;
  }

  const input = [];
  if (context) {
    input.push({
      role: "system",
      content: `Kontext: ${context}`,
    });
  }
  input.push(...messages);

  const payload = {
    model: chatModel,
    input,
  };
  if (chatReasoningEffort && chatReasoningEffort !== "auto") {
    payload.reasoning = { effort: chatReasoningEffort };
  }

  let upstream;
  try {
    upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
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

  const responseText = extractChatResponseText(data);
  if (!responseText) {
    sendJson(res, 502, {
      error: "OpenAI response missing text output.",
      code: "missing_response",
    });
    return;
  }

  sendJson(res, 200, {
    message: responseText,
    ...getChatConfig(),
  });
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
  const { prompt, apiKey, image, mask } = await readRequestBody(req);
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
    if (image) {
      const imageData = parseDataUrl(image);
      if (!imageData) {
        sendJson(res, 400, {
          error: "Invalid image data.",
          code: "invalid_image_data",
        });
        return;
      }
      const form = new FormData();
      form.append("model", imageModel);
      form.append("prompt", prompt.trim());
      form.append("size", "1024x1024");
      form.append("response_format", "b64_json");
      form.append(
        "image",
        new Blob([imageData.buffer], { type: imageData.mime }),
        `image.${imageData.mime.split("/")[1] || "png"}`,
      );
      if (mask) {
        const maskData = parseDataUrl(mask);
        if (!maskData) {
          sendJson(res, 400, {
            error: "Invalid mask data.",
            code: "invalid_mask_data",
          });
          return;
        }
        form.append(
          "mask",
          new Blob([maskData.buffer], { type: maskData.mime }),
          `mask.${maskData.mime.split("/")[1] || "png"}`,
        );
      }
      upstream = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resolvedKey}`,
        },
        body: form,
      });
    } else {
      upstream = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resolvedKey}`,
        },
        body: JSON.stringify({
          model: imageModel,
          prompt: prompt.trim(),
          size: "1024x1024",
          response_format: "b64_json",
        }),
      });
    }
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
      const parsedUrl = new URL(req.url || "/", `http://${host}:${port}`);
      const urlPath = decodeURIComponent(parsedUrl.pathname);

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

      if (urlPath === "/api/chat-config") {
        if (req.method !== "GET") {
          sendJson(res, 405, {
            error: "Method not allowed.",
            code: "method_not_allowed",
          });
          return;
        }

        sendJson(res, 200, getChatConfig());
        return;
      }

      if (urlPath === "/api/chat") {
        if (req.method !== "POST") {
          sendJson(res, 405, {
            error: "Method not allowed.",
            code: "method_not_allowed",
          });
          return;
        }

        await handleChatRequest(req, res);
        return;
      }

      const method = String(req.method || "").toUpperCase();
      const needsBody = ["POST", "PATCH", "PUT", "DELETE"].includes(method);
      const body = needsBody ? await readRequestBody(req) : null;

      const tasksResponse = await handleTasksApi({
        method,
        urlPath,
        headers: req.headers,
        query: parsedUrl.searchParams,
        body,
      });

      if (tasksResponse) {
        sendJson(res, tasksResponse.statusCode, tasksResponse.payload);
        return;
      }

      const emailResponse = await handleEmailApi({
        method,
        urlPath,
        headers: req.headers,
        query: parsedUrl.searchParams,
        body,
      });

      if (emailResponse) {
        sendJson(res, emailResponse.statusCode, emailResponse.payload);
        return;
      }

      const evidenceResponse = await handleEvidenceApi({
        method,
        urlPath,
        headers: req.headers,
        body: method === "POST" ? body : null,
      });

      if (evidenceResponse) {
        sendJson(res, evidenceResponse.statusCode, evidenceResponse.payload);
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
