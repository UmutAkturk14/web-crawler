import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 50000,
  use: {
    viewport: { width: 1920, height: 1080 },
    headless: true,
  },
});
