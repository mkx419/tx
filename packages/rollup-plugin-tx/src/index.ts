import { type Plugin } from "rollup";

import { transform } from "@mkx419/tx/transform";

export function txPlugin(): Plugin<never> {
  return {
    name: "tx",
    transform: {
      order: "post",
      handler(code, id) {
        if (/\.[jt]sx?|vue|svelte$/.test(id)) {
          return transform(code, id);
        }
      },
    },
  };
}
