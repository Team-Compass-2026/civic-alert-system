import path from "path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";
import { nitro } from "nitro/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { componentTagger } from "lovable-tagger";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  // Cloudflare Workers plugin only on build (produces the worker output);
  // the workerd runtime isn't available for the dev server.
  const useCloudflare = command === "build";
  // Vercel sets VERCEL=1 automatically during builds — skip the Cloudflare
  // plugin and use the Nitro adapter instead, which emits `.vercel/output`
  // (Build Output API) that Vercel auto-detects with zero settings changes.
  const isVercel = process.env.VERCEL === "1";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      tailwindcss(),
      mockupPreviewPlugin(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      // Cloudflare Workers plugin — only on build, skipped on Vercel.
      ...(useCloudflare && !isVercel
        ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
        : []),
      // Nitro adapter — Vercel auto-detects `.vercel/output` (Build Output API).
      ...(isVercel ? [nitro()] : []),
      tanstackStart(),
      viteReact(),
      ...(mode === "development" ? [componentTagger()] : []),
    ],
  };
});
