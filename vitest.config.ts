import path from "path";
import { defineConfig } from "vitest/config";

/**
 * Unit tests run without the TanStack Start / Cloudflare plugins so they stay
 * fast and node-friendly. `jsdom` gives us sessionStorage + window.location.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
