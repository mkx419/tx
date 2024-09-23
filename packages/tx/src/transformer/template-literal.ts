import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/typescript-estree";

import { RecursiveTransformer } from "./recursive";
import type { Operation } from "./types";

class TemplateLiteralTransformer extends RecursiveTransformer<TSESTree.TemplateLiteral> {
  protected override isTarget(node: TSESTree.Node): node is TSESTree.TemplateLiteral {
    return node.type === AST_NODE_TYPES.TemplateLiteral;
  }

  protected override transform(node: TSESTree.TemplateLiteral): Required<Operation> {
    let static_ = true;
    let code = "";
    let logical = false;

    const values = [
      ...node.quasis.filter((quasi) => quasi.value.cooked !== "" && quasi.value.cooked !== " "),
      ...node.expressions,
    ].sort((a, b) => a.range[0] - b.range[0]);

    for (let i = 0; i < values.length; i++) {
      const first = !i;
      const last = i === values.length - 1;
      const element = values[i];

      switch (element.type) {
        case AST_NODE_TYPES.TemplateElement:
          code += (first || logical ? "" : " ") + element.value.cooked.match(/^\s*(.*?)\s*$/)![1];
          logical = false;
          break;

        case AST_NODE_TYPES.Literal:
          code += (first || logical ? "" : " ") + element.value;
          logical = false;
          break;

        case AST_NODE_TYPES.TemplateLiteral:
          static_ = false;

          code +=
            (first || logical ? "" : " ") +
            this.substring([element.range[0] + 1, element.range[1] - 1]);

          logical = false;
          break;

        case AST_NODE_TYPES.LogicalExpression:
          static_ = false;
          code += this.createLogical(element.left, element.right, first, last);
          logical = true;
          break;

        case AST_NODE_TYPES.ConditionalExpression:
          static_ = false;

          if (
            element.alternate.type === AST_NODE_TYPES.Literal &&
            (element.alternate.value === "" || element.alternate.value === " ")
          ) {
            code += this.createLogical(element.test, element.consequent, first, last);
            logical = true;
          } else {
            code += (first || logical ? "" : " ") + "${" + this.substring(element.range) + "}";
            logical = false;
          }

          break;

        default:
          static_ = false;
          code += (first || logical ? "" : " ") + "${" + this.substring(element.range) + "}";
          logical = false;

          break;
      }
    }

    return {
      range: node.range,
      content: (static_ ? '"' : "`") + code + (static_ ? '"' : "`"),
    };
  }

  private createLogical(
    left: TSESTree.Expression,
    right: TSESTree.Expression,
    first: boolean,
    last: boolean,
  ) {
    const isLiteral = right.type === AST_NODE_TYPES.Literal;

    return (
      "${" +
      (this.substring(left.range) +
        " ? " +
        (isLiteral ? '"' : "`") +
        (first ? "" : " ") +
        (isLiteral
          ? typeof right.value === "string"
            ? right.value.match(/^\s*(.*?)\s*$/)![1]
            : right.value
          : this.substring(right.range)) +
        (last ? "" : " ") +
        (isLiteral ? '"' : "`") +
        " : " +
        (first || last ? '""' : '" "')) +
      "}"
    );
  }
}

export function simplifyTemplateLiteral(source: string) {
  return new TemplateLiteralTransformer(source).start().code;
}
