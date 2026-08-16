import { expect, test } from "vite-plus/test";
import { compileSync } from "../src/compiler/index.ts";

const testCode = `\
import { tx } from "@mkx419/tx";

type Props = {
  size: "sm" | "md" | "lg";
  rounded: boolean;
};

const button = tx<Props>({
  variants: [
    {
      size: "sm",
      class: "text-sm h-6 px-2",
    },
    {
      size: "md",
      class: "text-md h-7 px-2.5",
    },
    {
      size: "lg",
      class: "text-lg h-8 px-3",
    },
    {
      rounded: true,
      class: "rounded-full",
    },
    {
      rounded: false,
      size: "sm",
      class: "rounded-sm",
    },
    {
      rounded: false,
      size: "md",
      class: "rounded-md",
    },
    {
      rounded: false,
      size: "lg",
      class: "rounded-lg",
    },
  ],
  defaults: {
    size: "md",
    rounded: false,
  },
});
`;

const expectedCode = `\
type Props = { size: "sm" | "md" | "lg"; rounded: boolean };

const button = (props) => {
  const _props = { 'size': 'md', 'rounded': false, ...props };
  let className = '';

  if (_props['size'] === 'sm') {
    className += (className && ' ') + 'text-sm h-6 px-2';
  }

  if (_props['size'] === 'md') {
    className += (className && ' ') + 'text-md h-7 px-2.5';
  }

  if (_props['size'] === 'lg') {
    className += (className && ' ') + 'text-lg h-8 px-3';
  }

  if (_props['rounded'] === true) {
    className += (className && ' ') + 'rounded-full';
  }

  if (_props['rounded'] === false && _props['size'] === 'sm') {
    className += (className && ' ') + 'rounded-sm';
  }

  if (_props['rounded'] === false && _props['size'] === 'md') {
    className += (className && ' ') + 'rounded-md';
  }

  if (_props['rounded'] === false && _props['size'] === 'lg') {
    className += (className && ' ') + 'rounded-lg';
  }

  return className;
};\
`;

test("tx", () => {
  expect(compileSync("tx.ts", testCode)).toBe(expectedCode);
});
