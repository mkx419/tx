import { walk } from "zimmerframe";
import { parse, ParseResult, parseSync } from "oxc-parser";
import type { Node, Program } from "estree";
import { print } from "esrap";
import ts from "esrap/languages/ts";

import transformTC from "./tc/index.ts";
import transformTX from "./tx/index.ts";

const PACKAGE_NAME = "@mkx419/tx";

export function transform(program: Program): Program {
  const state: { tx: Set<string>; tc: Set<string> } = { tx: new Set(), tc: new Set() };

  program.body = program.body.filter((node) => {
    if (node.type !== "ImportDeclaration" || node.source.value !== PACKAGE_NAME) {
      return true;
    }

    for (const specifier of node.specifiers) {
      if (specifier.type === "ImportDefaultSpecifier") {
        throw new Error(`Unexpected default import from ${JSON.stringify(PACKAGE_NAME)}`);
      }

      if (specifier.type === "ImportNamespaceSpecifier") {
        throw new Error(`Unexpected namespace import from ${JSON.stringify(PACKAGE_NAME)}`);
      }

      const name =
        specifier.imported.type === "Identifier"
          ? specifier.imported.name
          : specifier.imported.value;

      const local = specifier.local.name;

      if (name === "tx") {
        state.tx.add(local);
      }

      if (name === "tc") {
        state.tc.add(local);
      }
    }

    return false;
  });

  return walk(program as Node, state, {
    CallExpression(node, { next, state }) {
      switch (node.callee.type) {
        case "Identifier": {
          const calleeName = node.callee.name;

          if (state.tx.has(calleeName)) {
            return transformTX(next(state) ?? node);
          }

          if (state.tc.has(calleeName)) {
            return transformTC(node);
          }

          break;
        }
      }
    },
  }) as Program;
}

function _compile(filename: string, result: ParseResult) {
  const { program, errors } = result;

  if (errors.length > 0) {
    throw new Error(
      `Failed to parse ${filename}:\n${errors.map((error) => error.message).join("\n\n")}`,
    );
  }

  const transformed = transform(program as Program);

  const { code } = print(transformed, ts(), { indent: "  " });

  return code;
}

export async function compile(filename: string, source: string) {
  return _compile(filename, await parse(filename, source));
}

export function compileSync(filename: string, source: string) {
  return _compile(filename, parseSync(filename, source));
}
