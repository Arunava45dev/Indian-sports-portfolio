import react from "@vitejs/plugin-react";
import { defineConfig as defineVitestConfig } from "vitest/config";

export default defineVitestConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:5000" } },
  test: { environment: "jsdom", setupFiles: "./src/test-setup.js", clearMocks: true },
});
