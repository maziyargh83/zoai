// rollup.config.js
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    }
  ],
  plugins: [
    typescript({
      tsconfig: "tsconfig.json",
      sourceMap: true,
      declaration: true,
      declarationDir: "dist",
    })
  ],
  external: []
};