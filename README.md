# @mkx419/tx

## Installation

### npm

```bash
npm install -D @mkx419/tx
```

### yarn

```bash
yarn add -D @mkx419/tx
```

### pnpm

```bash
pnpm add -D @mkx419/tx
```

### vite+

```bash
vp add -D @mkx419/tx
```

## Usage

### tc

```ts
import { tc } from "@mkx419/tx";

const className = tc(
  "bg-red-500 text-white p-4 rounded-lg",
  "hover:bg-red-600",
);
```

<details>

<summary>Compiled</summary>

```ts
const className = "bg-red-500 text-white p-4 rounded-lg hover:bg-red-600";
```

</details>

### tx

```ts
import { tx, tc } from "@mkx419/tx";

type Props = {
  size: "sm" | "md" | "lg";
  color: "primary" | "secondary" | "tertiary";
  rounded: boolean;
};

const button = tx<Props>({
  base: tc(
    "inline-flex items-center justify-center font-bold",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
  ),
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
      color: "primary",
      class: tc("bg-primary text-on-primary", "hover:bg-primary/80"),
    },
    {
      color: "secondary",
      class: tc("bg-secondary text-on-secondary", "hover:bg-secondary/80"),
    },
    {
      color: "tertiary",
      class: tc("bg-tertiary text-on-tertiary", "hover:bg-tertiary/80"),
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
    color: "primary",
    rounded: false,
  },
});

console.log(button());
console.log(button({ size: "lg", color: "secondary", rounded: true }));
```

<details>

<summary>Compiled</summary>

```ts
type Props = {
  size: "sm" | "md" | "lg";
  color: "primary" | "secondary" | "tertiary";
  rounded: boolean;
};

const button = (props) => {
  const _props = { size: "md", color: "primary", rounded: false, ...props };
  let className =
    "inline-flex items-center justify-center font-bold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  if (_props["size"] === "sm") {
    className += (className && " ") + "text-sm h-6 px-2";
  }

  if (_props["size"] === "md") {
    className += (className && " ") + "text-md h-7 px-2.5";
  }

  if (_props["size"] === "lg") {
    className += (className && " ") + "text-lg h-8 px-3";
  }

  if (_props["color"] === "primary") {
    className +=
      (className && " ") + "bg-primary text-on-primary hover:bg-primary/80";
  }

  if (_props["color"] === "secondary") {
    className +=
      (className && " ") +
      "bg-secondary text-on-secondary hover:bg-secondary/80";
  }

  if (_props["color"] === "tertiary") {
    className +=
      (className && " ") + "bg-tertiary text-on-tertiary hover:bg-tertiary/80";
  }

  if (_props["rounded"] === true) {
    className += (className && " ") + "rounded-full";
  }

  if (_props["rounded"] === false && _props["size"] === "sm") {
    className += (className && " ") + "rounded-sm";
  }

  if (_props["rounded"] === false && _props["size"] === "md") {
    className += (className && " ") + "rounded-md";
  }

  if (_props["rounded"] === false && _props["size"] === "lg") {
    className += (className && " ") + "rounded-lg";
  }

  return className;
};

console.log(button());
console.log(button({ size: "lg", color: "secondary", rounded: true }));
```

</details>

## Build settings

<details>

<summary>Vite</summary>

```ts
// vite.config.ts
import txPlugin from "@mkx419/tx/vite";

export default defineConfig({
  plugins: [
    txPlugin({
      /* options */
    }),
  ],
});
```

</details>

<details>

<summary>Rollup</summary>

```ts
// rollup.config.js
import txPlugin from "@mkx419/tx/rollup";

export default {
  plugins: [
    txPlugin({
      /* options */
    }),
  ],
};
```

</details>

<details>

<summary>Rolldown</summary>

```ts
// rolldown.config.js
import txPlugin from "@mkx419/tx/rolldown";

export default {
  plugins: [
    txPlugin({
      /* options */
    }),
  ],
};
```

</details>

<details>

<summary>Webpack</summary>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require("@mkx419/tx/webpack")({
      /* options */
    }),
  ],
};
```

</details>

<details>

<summary>Rspack</summary>

```ts
// rspack.config.js
module.exports = {
  /* ... */
  plugins: [
    require("@mkx419/tx/rspack")({
      /* options */
    }),
  ],
};
```

</details>

<details>

<summary>Rsbuild</summary>

```ts
// rsbuild.config.ts
import { defineConfig } from "@rsbuild/core";
import txPlugin from "@mkx419/tx/rsbuild";

export default defineConfig({
  plugins: [
    txPlugin({
      /* options */
    }),
  ],
});
```

</details>

<details>

<summary>esbuild</summary>

```ts
// esbuild.config.js
import { build } from "esbuild";
import txPlugin from "@mkx419/tx/esbuild";

build({
  plugins: [txPlugin()],
});
```

</details>
