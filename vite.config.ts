import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {},
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  pack: {
    entry: {
      index: "src/index.ts",
      compiler: "src/compiler/index.ts",
      "*": "src/plugin/*.ts",
    },
    deps: {
      neverBundle: ["estree"],
    },
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  staged: {
    "*": "vp check --fix",
  },
});
