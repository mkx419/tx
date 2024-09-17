import { WalkerBase } from "@mkx419/tsestree-walker";
import { AST_NODE_TYPES, parse, TSESTree } from "@typescript-eslint/typescript-estree";
import MagicString from "magic-string";

type FuncName = "tx" | "tm";

const VIRTUAL_MODULE = "@mkx419/tx";

class Transformer extends WalkerBase {
  private source: MagicString;
  private filename: string | undefined;
  private program: TSESTree.Program;

  private funcNameMap: { [key: string]: FuncName } = {};

  constructor(source: string, filename?: string) {
    super();

    this.source = new MagicString(source);
    this.filename = filename;
    this.program = parse(source, { range: true });
  }

  private substring(range: [number, number]) {
    return this.source.original.substring(...range);
  }

  private parseImportDeclaration(node: TSESTree.ImportDeclaration) {
    let importDeclaration: string | undefined = undefined;

    if (node.source.value === VIRTUAL_MODULE) {
      for (const specifier of node.specifiers) {
        if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
          if (specifier.importKind === "value") {
            if (specifier.imported.name === "tv") {
              importDeclaration =
                specifier.local.name === "tv"
                  ? `import { tv } from "${VIRTUAL_MODULE}";`
                  : `import { tv as ${specifier.local.name} } from "${VIRTUAL_MODULE}";`;
            } else {
              this.funcNameMap[specifier.local.name] = specifier.imported.name as FuncName;
            }
          }
        }
      }

      if (importDeclaration) {
        this.source.update(...node.range, importDeclaration);
      } else {
        this.source.remove(...node.range);
      }
    }
  }

  private parseTx(node: TSESTree.CallExpression, skip: boolean = false) {
    let static_ = true;
    let logical = false;
    let code = "";

    if (skip) {
      this.skip();
    }

    for (let i = 0; i < node.arguments.length; i++) {
      const argument = node.arguments[i];

      switch (argument.type) {
        case AST_NODE_TYPES.Literal:
          code += (logical || !i ? "" : " ") + argument.value;

          if (logical) {
            logical = false;
          }

          break;

        case AST_NODE_TYPES.LogicalExpression:
          static_ = false;
          logical = true;

          code +=
            "${" +
            this.substring(argument.left.range) +
            " ? " +
            (i ? "` ${" : "`${") +
            this.substring(argument.right.range) +
            (i === node.arguments.length - 1 ? "}`" : "} `") +
            " : " +
            (!i || i === node.arguments.length - 1 ? '""' : '" "') +
            "}";

          break;

        case AST_NODE_TYPES.CallExpression:
          code += logical || !i ? "" : " ";

          if (logical) {
            logical = false;
          }

          if (argument.callee.type === AST_NODE_TYPES.Identifier) {
            switch (this.funcNameMap[argument.callee.name]) {
              case "tx": {
                const result = this.parseTx(argument, true);

                if (!result.static) {
                  static_ = false;
                }

                code += result.code;

                break;
              }

              case "tm":
                code += this.parseTm(argument, true);
                break;

              default:
                static_ = false;
                code += "${" + this.substring(argument.range) + "}";
                break;
            }
          } else {
            static_ = false;
            code += "${" + this.substring(argument.range) + "}";
          }

          break;

        default:
          static_ = false;
          code += (logical || !i ? "" : " ") + "${" + this.substring(argument.range) + "}";

          if (logical) {
            logical = false;
          }

          break;
      }
    }

    return { code, static: static_ };
  }

  private parseTm(node: TSESTree.CallExpression, skip: boolean = false): string {
    if (skip) {
      this.skip();
    }

    if (node.arguments.length !== 2) {
      throw new Error("The number of arguments of 'tm' must be 2.");
    }

    const modifier = node.arguments[0];

    if (modifier.type !== AST_NODE_TYPES.Literal || typeof modifier.value !== "string") {
      throw new Error("The first argument to 'tm' must be string literal.");
    }

    const value = node.arguments[1];

    switch (value.type) {
      case AST_NODE_TYPES.Literal:
        if (typeof value.value === "string") {
          return tm(modifier.value, value.value);
        }

        break;

      case AST_NODE_TYPES.CallExpression:
        if (value.callee.type === AST_NODE_TYPES.Identifier) {
          switch (this.funcNameMap[value.callee.name]) {
            case "tm":
              return tm(modifier.value, this.parseTm(value, true));

            case "tx": {
              const result = this.parseTx(value, true);

              if (result.static) {
                return tm(modifier.value, result.code);
              }
            }
          }
        }

        break;
    }

    throw new Error("The second argument of 'tm' must be string literal, 'tm' or static 'tx'.");
  }

  private parseCallExpression(node: TSESTree.CallExpression) {
    if (node.callee.type === AST_NODE_TYPES.Identifier) {
      switch (this.funcNameMap[node.callee.name]) {
        case "tx": {
          const result = this.parseTx(node, true);

          this.source.update(
            ...node.range,
            result.static ? `"${result.code}"` : "`" + result.code + "`",
          );

          break;
        }

        case "tm":
          this.source.update(...node.range, `"${this.parseTm(node, true)}"`);
          break;
      }
    }
  }

  protected override enter(node: TSESTree.Node): void {
    switch (node.type) {
      case AST_NODE_TYPES.ImportDeclaration:
        this.parseImportDeclaration(node);
        break;

      case AST_NODE_TYPES.CallExpression:
        this.parseCallExpression(node);
        break;
    }
  }

  transform() {
    this.start(this.program);

    return {
      code: this.source.toString(),
      map: this.source.generateMap({ source: this.filename }),
    };
  }
}

function tm(modifier: string, value: string) {
  return value
    .split(" ")
    .map((element) => modifier + element)
    .join(" ");
}

export function transform(source: string, filename?: string) {
  return new Transformer(source, filename).transform();
}
