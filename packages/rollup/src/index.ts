import { transform } from "@mkx419/tx/transform";
import { type Plugin } from "rollup";

export function txPlugin(): Plugin<never> {
  return {
    name: "tx",
    transform: {
      order: "post",
      handler(code, id) {
        if (/\.[jt]sx?|vue|svelte$/.test(id)) {
          return transform(code, { fileName: id });
        }
      },
    },
  };
}
