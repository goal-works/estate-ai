import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const runId = `${process.pid}-${Date.now()}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3002",
    colorScheme: "light",
    launchOptions: executablePath ? { executablePath } : {},
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command:
        "uv run uvicorn estateai_server.main:app --host 127.0.0.1 --port 8002 --app-dir backend",
      cwd: "..",
      url: "http://127.0.0.1:8002/api/health",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ESTATEAI_DATABASE_URL: `sqlite:////tmp/estateai-playwright-${runId}.db`,
        UV_CACHE_DIR: "/tmp/estate-ai-uv-cache",
      },
    },
    {
      command: "npm run start",
      url: "http://127.0.0.1:3002",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
