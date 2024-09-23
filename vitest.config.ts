import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ["packages/tx/src/**/*.ts"],
      exclude: ["packages/tx/src/index.ts", "packages/tx/src/**/*.test.ts"],
      reporter: "text",
    },
  },
});
