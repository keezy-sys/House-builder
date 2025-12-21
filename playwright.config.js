import { defineConfig } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname);
const baseURL = process.env.BASE_URL || "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "tests:",
  use: {
    headless: true,
    browserName: "chromium",
    baseURL,
    launchOptions: {
      args: ["--disable-crash-reporter", "--disable-crashpad", "--no-sandbox"],
    },
  },
});
