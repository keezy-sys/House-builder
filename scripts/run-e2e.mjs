import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const requestedPort = Number(process.env.E2E_PORT || 4173);

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

const startServer = (port) =>
  new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent(req.url.split("?")[0]);
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
    server.listen(port, host, () => {
      const address = server.address();
      const resolvedPort =
        typeof address === "object" && address ? address.port : port;
      resolve({ server, port: resolvedPort });
    });
  });

const startServerWithFallback = async () => {
  if (process.env.E2E_PORT) {
    return startServer(requestedPort);
  }

  try {
    return await startServer(requestedPort);
  } catch (error) {
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }
    return startServer(0);
  }
};

const run = async () => {
  const { server, port } = await startServerWithFallback();
  const baseUrl = `http://${host}:${port}`;
  console.log(`Static server running at ${baseUrl}`);

  const env = {
    ...process.env,
    BASE_URL: baseUrl,
    PLAYWRIGHT_BROWSERS_PATH: path.join(repoRoot, ".pw-browsers"),
    PLAYWRIGHT_JSON_OUTPUT_NAME: pathToFileURL(
      path.join(repoRoot, "test-results", "results.json"),
    ).href,
  };

  const runner = spawn("npx", ["playwright", "test"], {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  runner.on("close", (code) => {
    server.close(() => {
      process.exit(code ?? 1);
    });
  });

  runner.on("error", (err) => {
    console.error("Playwright failed to start:", err);
    server.close(() => process.exit(1));
  });
};

run().catch((error) => {
  console.error("E2E setup failed:", error);
  process.exit(1);
});
