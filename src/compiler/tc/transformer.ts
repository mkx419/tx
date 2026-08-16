import type { Literal, Node } from "estree";
import parse from "./parser.ts";

export default function transform(node: Node): Literal {
  const { className } = parse(node);

  return {
    // ex. "btn btn-primary"
    type: "Literal",
    value: className,
  };
}
