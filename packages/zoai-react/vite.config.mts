import { defineConfig } from "vite";

const config = defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: (format) => {
        if (format === "cjs") return "cjs/[name].cjs";
        return "esm/[name].js";
      },
    },
    sourcemap: true,
    rollupOptions: {
      treeshake: { preset: "safest" },
      output: {
        banner: `"use client";`,
        preserveModules: true,
        preserveModulesRoot: "src",
        exports: "named",
        interop: "auto",
      },
      external: ["react", "react-dom"],
    },
  },
});

export default config;
