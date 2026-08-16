import type { Node } from "estree";

import type { IntermediateAST } from "./types.ts";

export default function parse(node: Node): IntermediateAST {
  if (node.type !== "CallExpression") {
    throw new Error(`Expected CallExpression, but got ${node.type}`);
  }

  let className = "";

  for (let i = 0; i < node.arguments.length; i++) {
    const arg = node.arguments[i];

    if (arg.type !== "Literal") {
      throw new Error(`Unexpected argument type in tc() call: ${arg.type}`);
    }

    if (typeof arg.value !== "string") {
      throw new Error(`Unexpected literal type in tc() call: ${typeof arg.value}`);
    }

    const value = arg.value;

    if (value) {
      className += (className && " ") + value;
    }
  }

  return { className };
}
