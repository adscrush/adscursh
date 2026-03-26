import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    clean: true,
  },
  {
    entry: ["src/index.ts"],
    format: ["iife"],
    globalName: "AdscrushSDK",
    outDir: "dist",
    minify: true,
    outExtension: () => ({ js: ".iife.min.js" }),
  },
])
