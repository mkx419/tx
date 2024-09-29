import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/transform.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
});
