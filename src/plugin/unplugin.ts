import { createUnplugin } from "unplugin";

import { compile } from "../compiler/index.ts";
import type { Options } from "./types.ts";

const unplugin = createUnplugin<Options, false>((options?: Options) => {
  const { include = /\.([cm]?[jt]sx?|vue|svelte|astro)$/, exclude = /node_modules/ } =
    options || {};

  return {
    name: "unplugin-tx",
    transform: {
      filter: {
        id: { include, exclude },
      },
      async handler(code, id) {
        return await compile(id, code);
      },
    },
  };
});

export default unplugin;
