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
