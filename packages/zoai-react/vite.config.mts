import { defineConfig } from "vite";
import nodeExternals from "rollup-plugin-node-externals";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
  plugins: [
    tsconfigPaths(),
    nodeExternals({ deps: false, include: [/recharts/] }),
  ],
  build: {
    lib: { entry: "src/index.ts", formats: ["es", "cjs"] },
    sourcemap: true,
    rollupOptions: {
      treeshake: { preset: "smallest" },
      output: {
        banner: `"use client";`,
        preserveModules: true,
        preserveModulesRoot: "src",
        exports: "named",
        interop: "auto",
      },
    },
  },
});

export default config;
