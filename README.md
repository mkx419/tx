# tx

Simple and useful utility for [Tailwind CSS](https://tailwindcss.com/).

## Installation

### npm

```bash
npm i -D @mkx419/tx @mkx419/rollup-plugin-tx
```

### pnpm

```bash
pnpm add -D @mkx419/tx @mkx419/rollup-plugin-tx
```

## Setup

### Rollup

```js
// rollup.config.js
import { txPlugin } from "@mkx419/rollup-plugin-tx";

export default {
  plugins: [txPlugin()],
};
```

### Vite

```ts
// vite.config.ts
import { txPlugin } from "@mkx419/rollup-plugin-tx";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [txPlugin()],
});
```

### VSCode

```json
{
  "tailwindCSS.experimental.classRegex": [["t[xmv]\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]]
}
```

## Usage

### tx

```js
import { tx } from "@mkx419/tx";

tx("bg-black", "text-white", true && "font-bold");
```

to

```js
`bg-black text-white${true ? ` ${"font-bold"}` : ""}`;
```

### tm

```js
import { tx } from "@mkx419/tx";

tm("hover:", tx("bg-black", "text-white"));
```

to

```js
"hover:bg-black hover:text-white";
```

### tv

```js
import { tv } from "@mkx419/tx";

const size = tv({
  sm: "h-4",
  md: "h-6",
  lg: "h-8",
});

size("sm");
```

to

```js
import { tv } from "@mkx419/tx";

const size = tv({
  sm: "h-4",
  md: "h-6",
  lg: "h-8",
});

size("sm");
```
