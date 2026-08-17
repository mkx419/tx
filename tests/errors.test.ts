import { expect, test } from "vite-plus/test";
import { compileSync } from "../src/compiler/index.ts";
import parseTC from "../src/compiler/tc/parser.ts";
import parseTX from "../src/compiler/tx/parser.ts";

function txSource(config: string): string {
  return `\
import { tx } from "@mkx419/tx";

const className = tx(${config});\
`;
}

test("tx rejects variants without a class", () => {
  const code = `\
import { tx } from "@mkx419/tx";

const className = tx({
  variants: [{ size: "sm" }],
});\
`;

  expect(() => compileSync("missing-class.ts", code)).toThrow(
    "Missing 'class' property in variant object",
  );
});

test("tc rejects dynamic class names", () => {
  const code = `\
import { tc } from "@mkx419/tx";

const className = tc(dynamicClassName);\
`;

  expect(() => compileSync("dynamic-tc.ts", code)).toThrow(
    "Unexpected argument type in tc() call: Identifier",
  );
});

test("tc rejects non-string literal class names", () => {
  const code = `\
import { tc } from "@mkx419/tx";

const className = tc(true);\
`;

  expect(() => compileSync("boolean-tc.ts", code)).toThrow(
    "Unexpected literal type in tc() call: boolean",
  );
});

test("compile reports parser errors", () => {
  const code = `\
import { tc } from "@mkx419/tx";

const className = tc(\
`;

  expect(() => compileSync("invalid-syntax.ts", code)).toThrow(
    "Failed to parse invalid-syntax.ts:",
  );
});

test("compiler rejects default imports", () => {
  const code = `\
import tx from "@mkx419/tx";

const className = tx({ variants: [] });\
`;

  expect(() => compileSync("default-import.ts", code)).toThrow(
    'Unexpected default import from "@mkx419/tx"',
  );
});

test("compiler rejects namespace imports", () => {
  const code = `\
import * as tx from "@mkx419/tx";

const className = tx.tc("class");\
`;

  expect(() => compileSync("namespace-import.ts", code)).toThrow(
    'Unexpected namespace import from "@mkx419/tx"',
  );
});

test("tx rejects calls without a config object", () => {
  expect(() => compileSync("missing-config.ts", txSource(""))).toThrow(
    "Unexpected argument type in tx() call: undefined",
  );
});

test("tx rejects non-object config arguments", () => {
  expect(() => compileSync("invalid-config.ts", txSource('"config"'))).toThrow(
    "Unexpected argument type in tx() call: Literal",
  );
});

const invalidTxCases = [
  [
    "a non-literal base",
    `{ base: base, variants: [] }`,
    "Unexpected value type for 'base' in tx() config: Identifier",
  ],
  [
    "a non-string base",
    `{ base: true, variants: [] }`,
    "Unexpected literal type for 'base' in tx() config: boolean",
  ],
  [
    "a non-array variants value",
    `{ variants: "sm" }`,
    "Unexpected value type for 'variants' in tx() config: Literal",
  ],
  [
    "a non-object defaults value",
    `{ variants: [], defaults: "sm" }`,
    "Unexpected value type for 'defaults' in tx() config: Literal",
  ],
  [
    "a non-object variant",
    `{ variants: ["sm"] }`,
    "Unexpected element type in 'variants' array: Literal",
  ],
  ["a variant spread", `{ variants: [{ ...props }] }`, "Unexpected node type: SpreadElement"],
  [
    "a dynamic variant value",
    `{ variants: [{ size, class: "small" }] }`,
    "Unexpected value type for property: Identifier",
  ],
  [
    "a non-string variant class",
    `{ variants: [{ class: true }] }`,
    "Unexpected literal type for 'class' in variant property: boolean",
  ],
  ["a sparse variants array", `{ variants: [,] }`, "Unexpected null element in 'variants' array"],
  [
    "a non-string variant key",
    `{ variants: [{ 1: "sm", class: "small" }] }`,
    "Unexpected literal type for key: number",
  ],
  [
    "an unsupported variant literal",
    `{ variants: [{ size: /sm/, class: "small" }] }`,
    "Unexpected literal type for property: object",
  ],
  ["a config spread", `{ ...config }`, "Unexpected property type in tx() config: SpreadElement"],
  [
    "an unknown config property",
    `{ unknown: "value", variants: [] }`,
    "Unexpected property key in tx() config: unknown",
  ],
] as const;

for (const [name, config, message] of invalidTxCases) {
  test(`tx rejects ${name}`, () => {
    expect(() => compileSync(`${name}.ts`, txSource(config))).toThrow(message);
  });
}

test("tc parser rejects non-call nodes", () => {
  expect(() => parseTC({ type: "Identifier", name: "tc" })).toThrow(
    "Expected CallExpression, but got Identifier",
  );
});

test("tx parser rejects non-call nodes", () => {
  expect(() => parseTX({ type: "Identifier", name: "tx" })).toThrow(
    "Expected CallExpression, but got Identifier",
  );
});
