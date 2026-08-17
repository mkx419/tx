import type {
  ArrowFunctionExpression,
  BinaryExpression,
  Expression,
  Identifier,
  IfStatement,
  Literal,
  LogicalExpression,
  Node,
  Property,
  VariableDeclaration,
} from "estree";

import parse from "./parser.ts";
import type { Prop, Variant } from "./types.ts";

type LiteralValue = string | boolean | number;

const PROPS_NAME = "props";
const CLASS_NAME = "className";
const MERGED_PROPS_NAME = "_props";

function identifier(name: string): Identifier {
  return { type: "Identifier", name };
}

function literal(value: LiteralValue): Literal {
  return { type: "Literal", value };
}

function property(key: string, value: LiteralValue): Property {
  return {
    type: "Property",
    method: false,
    shorthand: false,
    computed: false,
    key: literal(key),
    value: literal(value),
    kind: "init",
  };
}

function transformDefaults(defaults: Prop[]): VariableDeclaration {
  const propsIdentifier = identifier(PROPS_NAME);

  return {
    // ex. let _props = { size: "md", color: "primary", ...props };
    type: "VariableDeclaration",
    declarations: [
      {
        type: "VariableDeclarator",
        id: identifier(MERGED_PROPS_NAME),
        init: {
          // ex. { size: "md", color: "primary", ...props }
          type: "ObjectExpression",
          properties: [
            ...defaults.map(([key, value]) => property(key, value)),
            { type: "SpreadElement", argument: propsIdentifier },
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
        id: identifier(CLASS_NAME),
        init: literal(base),
      },
    ],
    kind: "let",
  };
}

function transformCondition(props: Prop[]): Expression {
  const conditions = props.map(([key, value]): BinaryExpression => ({
    // ex. _props.size === "md"
    type: "BinaryExpression",
    left: {
      type: "MemberExpression",
      object: identifier(MERGED_PROPS_NAME),
      property: literal(key),
      computed: true,
      optional: false,
    },
    operator: "===",
    right: literal(value),
  }));

  return conditions.slice(1).reduce<Expression>(
    (previous, current): LogicalExpression => ({
      // ex. _props.size === "md" && _props.color === "primary"
      type: "LogicalExpression",
      left: previous,
      operator: "&&",
      right: current,
    }),
    conditions[0] ?? literal(true),
  );
}

function transformVariant(variant: Variant): IfStatement {
  const [props, className] = variant;

  return {
    // if (_props.size === "md" && _props.color === "primary") { className += (className && " ") + "btn-primary"; }
    type: "IfStatement",
    test: transformCondition(props),
    consequent: {
      type: "BlockStatement",
      body: [
        {
          type: "ExpressionStatement",
          expression: {
            // ex. className += (className && " ") + "btn-primary";
            type: "AssignmentExpression",
            left: identifier(CLASS_NAME),
            operator: "+=",
            right: {
              // ex. (className && " ") + "btn-primary"
              type: "BinaryExpression",
              left: {
                // className && " "
                type: "LogicalExpression",
                left: identifier(CLASS_NAME),
                operator: "&&",
                right: { type: "Literal", value: " " },
              },
              operator: "+",
              right: literal(className),
            },
          },
        },
      ],
    },
  };
}

export default function transform(node: Node): ArrowFunctionExpression {
  const { base, variants, defaults } = parse(node);
  const classNameIdentifier = identifier(CLASS_NAME);

  return {
    // (props) => { ... }
    type: "ArrowFunctionExpression",
    expression: false,
    generator: false,
    async: false,
    params: [identifier(PROPS_NAME)],
    body: {
      type: "BlockStatement",
      body: [
        transformDefaults(defaults),
        transformBase(base),
        ...variants
          .filter(([, className]) => className.length > 0)
          .map((variant) => transformVariant(variant)),
        {
          // return className;
          type: "ReturnStatement",
          argument: classNameIdentifier,
        },
      ],
    },
  };
}
