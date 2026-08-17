import { expect, test } from "vite-plus/test";
import { compileSync } from "../src/compiler/index.ts";

const testCode = `\
import { tc } from "@mkx419/tx";

const className = tc(
  "bg-red-500 text-white p-4 rounded-lg",
  "hover:bg-red-600",
);\
`;

const expectedCode = `\
const className = 'bg-red-500 text-white p-4 rounded-lg hover:bg-red-600';\
`;

test("tc", () => {
  expect(compileSync("tc.ts", testCode)).toBe(expectedCode);
});

test("tc skips empty class names", () => {
  const code = `\
import { tc } from "@mkx419/tx";

const className = tc("", "base", "", "hover");\
`;

  expect(compileSync("empty-tc.ts", code)).toBe("const className = 'base hover';");
});

test("tc leaves unrelated calls untouched", () => {
  const code = `\
import { tc } from "@mkx419/tx";

const otherCall = other("base");
const untouched = other.tc("base");
const className = tc("compiled");\
`;

  const compiled = compileSync("unrelated-call.ts", code);

  expect(compiled).toContain("other.tc");
  expect(compiled).toContain("const className = 'compiled';");
});
