import type { ArrayExpression, Node, Property } from "estree";

import type { Prop, Variant, IntermediateAST } from "./types.ts";

function parseKey(node: Property["key"]): string {
  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    if (typeof node.value !== "string") {
      throw new Error(`Unexpected literal type for key: ${typeof node.value}`);
    }

    return node.value;
  }

  throw new Error(`Unexpected node type for key: ${node.type}`);
}

function parseValue(node: Property["value"]): string | boolean | number {
  if (node.type !== "Literal") {
    throw new Error(`Unexpected value type for property: ${node.type}`);
  }

  if (
    typeof node.value === "string" ||
    typeof node.value === "boolean" ||
    typeof node.value === "number"
  ) {
    return node.value;
  }

  throw new Error(`Unexpected literal type for property: ${typeof node.value}`);
}

function parseProperty(node: Node) {
  if (node.type !== "Property") {
    throw new Error(`Unexpected node type: ${node.type}`);
  }

  return { key: parseKey(node.key), value: parseValue(node.value) };
}

function parseBase(node: Property["value"]): string {
  if (node.type !== "Literal") {
    throw new Error(`Unexpected value type for 'base' in tx() config: ${node.type}`);
  }

  if (typeof node.value !== "string") {
    throw new Error(`Unexpected literal type for 'base' in tx() config: ${typeof node.value}`);
  }

  return node.value;
}

function parseVariant(node: ArrayExpression["elements"][number]): Variant {
  if (!node) {
    throw new Error(`Unexpected null element in 'variants' array`);
  }

  if (node.type !== "ObjectExpression") {
    throw new Error(`Unexpected element type in 'variants' array: ${node.type}`);
  }

  const props: Prop[] = [];
  let className: string | undefined = undefined;

  for (const prop of node.properties) {
    const { key, value } = parseProperty(prop);

    if (key === "class") {
      if (typeof value !== "string") {
        throw new Error(`Unexpected literal type for 'class' in variant property: ${typeof value}`);
      }

      className = value;
      continue;
    }

    props.push([key, value]);
  }

  if (!className) {
    throw new Error(`Missing 'class' property in variant object`);
  }

  return [props, className];
}

function parseVariants(node: Property["value"]): Variant[] {
  if (node.type !== "ArrayExpression") {
    throw new Error(`Unexpected value type for 'variants' in tx() config: ${node.type}`);
  }

  const variants: Variant[] = [];

  for (let i = 0; i < node.elements.length; i++) {
    variants.push(parseVariant(node.elements[i]));
  }

  return variants;
}

function parseDefaults(node: Property["value"]): Prop[] {
  if (node.type !== "ObjectExpression") {
    throw new Error(`Unexpected value type for 'defaults' in tx() config: ${node.type}`);
  }

  const defaults: Prop[] = [];

  for (const prop of node.properties) {
    const { key, value } = parseProperty(prop);

    defaults.push([key, value]);
  }

  return defaults;
}

export default function parse(node: Node): IntermediateAST {
  if (node.type !== "CallExpression") {
    throw new Error(`Expected CallExpression, but got ${node.type}`);
  }

  const ast: IntermediateAST = { base: "", variants: [], defaults: [] };
  const obj = node.arguments.at(0);

  if (!obj || obj.type !== "ObjectExpression") {
    throw new Error(`Unexpected argument type in tx() call: ${obj?.type}`);
  }

  for (const prop of obj.properties) {
    if (prop.type !== "Property") {
      throw new Error(`Unexpected property type in tx() config: ${prop.type}`);
    }

    const key = parseKey(prop.key);

    switch (key) {
      case "base":
        ast.base = parseBase(prop.value);
        break;

      case "variants":
        ast.variants = parseVariants(prop.value);
        break;

      case "defaults":
        ast.defaults = parseDefaults(prop.value);
        break;

      default:
        throw new Error(`Unexpected property key in tx() config: ${key}`);
    }
  }

  return ast;
}
