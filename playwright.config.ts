import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const systemChromium = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ??
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    launchOptions: { ...(systemChromium ? {executablePath:systemChromium} : {}), args: ["--no-sandbox"] },
  },
  webServer: {
    command: "npm run start --workspace @fro/web -- --port 3100",
    url: "http://127.0.0.1:3100/api/health",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
