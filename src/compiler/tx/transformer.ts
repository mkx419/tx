import type {
  ArrowFunctionExpression,
  BinaryExpression,
  Identifier,
  IfStatement,
  LogicalExpression,
  Node,
  Property,
  VariableDeclaration,
} from "estree";

import parse from "./parser.ts";
import type { Prop, Variant } from "./types.ts";

const PROPS_IDENTIFIER: Identifier = { type: "Identifier", name: "props" };
const CLASS_NAME_IDENTIFIER: Identifier = { type: "Identifier", name: "className" };
const MERGED_PROPS_IDENTIFIER: Identifier = { type: "Identifier", name: "_props" };

function transformDefaults(defaults: Prop[]): VariableDeclaration {
  return {
    // ex. let _props = { size: "md", color: "primary", ...props };
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: MERGED_PROPS_IDENTIFIER,
        init: {
          // ex. { size: "md", color: "primary", ...props }
          type: "ObjectExpression",
          properties: [
            ...defaults.map(([key, value]): Property => ({
              type: "Property",
              method: false,
              shorthand: false,
              computed: false,
              key: { type: "Literal", value: key },
              value: { type: "Literal", value: value },
              kind: "init",
            })),
            { type: "SpreadElement", argument: PROPS_IDENTIFIER },
          ],
        },
      },
    ],
    kind: "const",
  };
}

function transformBase(base: string): VariableDeclaration {
  return {
    // ex. let className = "base-class";
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: CLASS_NAME_IDENTIFIER,
        init: { type: "Literal", value: base },
      },
    ],
    kind: "let",
  };
}

function transformVariant(variant: Variant): IfStatement {
  const [props, className] = variant;

  return {
    // if (_props.size === "md" && _props.color === "primary") { className += (className && " ") + "btn-primary"; }
    type: "IfStatement",
    test: props
      .map(([key, value]): BinaryExpression =>
        // ex. _props.size === "md"
        ({
          type: "BinaryExpression",
          left: {
            type: "MemberExpression",
            object: MERGED_PROPS_IDENTIFIER,
            property: { type: "Literal", value: key },
            computed: true,
            optional: false,
          },
          operator: "===",
          right: { type: "Literal", value: value },
        }),
      )
      .reduce(
        // @ts-expect-error
        (
          previous: BinaryExpression | LogicalExpression,
          current: BinaryExpression,
        ): LogicalExpression => ({
          // ex. _props.size === "md" && _props.color === "primary"
          type: "LogicalExpression",
          left: previous,
          operator: "&&",
          right: current,
        }),
      ),
    consequent: {
      type: "BlockStatement",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            // ex. className += (className && " ") + "btn-primary";
            type: "AssignmentExpression",
            left: CLASS_NAME_IDENTIFIER,
            operator: "+=",
            right: {
              // ex. (className && " ") + "btn-primary"
              type: "BinaryExpression",
              left: {
                // className && " "
                type: "LogicalExpression",
                left: CLASS_NAME_IDENTIFIER,
                operator: "&&",
                right: { type: "Literal", value: " " },
              },
              operator: "+",
              right: { type: "Literal", value: className },
            },
          },
        },
      ],
    },
  };
}

export default function transform(node: Node): ArrowFunctionExpression {
  const { base, variants, defaults } = parse(node);

  return {
    // (props) => { ... }
    type: "ArrowFunctionExpression",
    expression: false,
    generator: false,
    async: false,
    params: [PROPS_IDENTIFIER],
    body: {
      type: "BlockStatement",
      body: [
        transformDefaults(defaults),
        transformBase(base),
        ...variants.map((variant) => transformVariant(variant)),
        {
          // return className;
          type: "ReturnStatement",
          argument: CLASS_NAME_IDENTIFIER,
        },
      ],
    },
  };
}
