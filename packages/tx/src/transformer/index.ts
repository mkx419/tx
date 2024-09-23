import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/typescript-estree";

import { RecursiveTransformer } from "./recursive";
import { simplifyTemplateLiteral } from "./template-literal";
import type { Operation } from "./types";

const TRANSFORM = ["tx", "tm"] as const;
const NO_TRANSFORM = ["tv"] as const;

type Func = Omit<TSESTree.CallExpression, "callee"> & { callee: TSESTree.Identifier };
type FuncName = (typeof TRANSFORM)[number];
type FuncNameMap = Record<string, FuncName>;

export type Options = Partial<{ fileName: string; moduleName: string }>;

export class Transformer extends RecursiveTransformer<Func> {
  private moduleName: string;
  private funcNameMap: FuncNameMap = {};

  constructor(source: string, { fileName, moduleName = "@mkx419/tx" }: Options) {
    super(source, fileName);
    this.moduleName = moduleName;
  }

  protected override enter(node: TSESTree.Node): void {
    super.enter(node);

    if (
      this.isFirst() &&
      node.type === AST_NODE_TYPES.ImportDeclaration &&
      node.source.value === this.moduleName
    ) {
      this.apply(this.transformImport(node));
    }
  }

  protected override isTarget(node: TSESTree.Node): node is Func {
    return (
      node.type === AST_NODE_TYPES.CallExpression &&
      node.callee.type === AST_NODE_TYPES.Identifier &&
      TRANSFORM.includes(this.funcNameMap[node.callee.name])
    );
  }

  protected override transform(node: Func): Required<Operation> {
    switch (this.funcNameMap[node.callee.name]) {
      case "tx":
        return this.transformTx(node);

      case "tm":
        return this.transformTm(node);
    }
  }

  private transformTx(node: Func): Required<Operation> {
    const code =
      "`" +
      node.arguments.map((argument) => "${" + this.substring(argument.range) + "}").join(" ") +
      "`";

    return {
      range: node.range,
      content: simplifyTemplateLiteral(code),
    };
  }

  private transformTm(node: Func): Required<Operation> {
    if (node.arguments.length !== 2) {
      throw new Error("The number of arguments of 'tm' must be 2.");
    }

    const modifierNode = node.arguments[0];

    if (!isStringLiteral(modifierNode) && !isStaticTemplateLiteral(modifierNode)) {
      throw new Error("The first argument to 'tm' must be string literal.");
    }

    const valueNode = node.arguments[1];

    if (!isStringLiteral(valueNode) && !isStaticTemplateLiteral(valueNode)) {
      throw new Error("The second argument of 'tm' must be string literal, 'tm' or static 'tx'.");
    }

    const modifier = getValue(modifierNode);
    const value = getValue(valueNode);

    return {
      range: node.range,
      content:
        '"' +
        value
          .split(" ")
          .map((element) => modifier + element)
          .join(" ") +
        '"',
    };
  }

  private transformImport(node: TSESTree.ImportDeclaration): Operation {
    const values: string[] = [];

    for (const specifier of node.specifiers) {
      if (specifier.type === AST_NODE_TYPES.ImportSpecifier && specifier.importKind === "value") {
        if ((NO_TRANSFORM as readonly string[]).includes(specifier.imported.name)) {
          values.push(
            specifier.local.name === specifier.imported.name
              ? specifier.imported.name
              : `${specifier.imported.name} as ${specifier.local.name}`,
          );
        } else {
          this.funcNameMap[specifier.local.name] = specifier.imported.name as FuncName;
        }
      }
    }

    return values.length
      ? { range: node.range, content: `import { ${values.join(", ")} } from "${this.moduleName}";` }
      : { range: node.range };
  }
}

function isStringLiteral(node: TSESTree.Node): node is TSESTree.StringLiteral {
  return node.type === AST_NODE_TYPES.Literal && typeof node.value === "string";
}

function isStaticTemplateLiteral(node: TSESTree.Node): node is TSESTree.TemplateLiteral {
  return node.type === AST_NODE_TYPES.TemplateLiteral && !node.expressions.length;
}

function getValue(node: TSESTree.StringLiteral | TSESTree.TemplateLiteral) {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
      return node.value;

    case AST_NODE_TYPES.TemplateLiteral:
      return node.quasis[0].value.cooked;
  }
}
