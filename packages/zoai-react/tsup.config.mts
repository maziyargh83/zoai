import { defineConfig } from "tsup";

export default defineConfig({
  clean: false,
  entry: ["src/index.ts"],
  format: "esm",
  dts: { only: true }
});
