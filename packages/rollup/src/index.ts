import { join, relative } from "path";
import { type Plugin } from "rollup";

import { transform } from "@mkx419/tx/transform";

export function txPlugin(): Plugin<never> {
  return {
    name: "tx",
    transform: {
      order: "post",
      async handler(code, id) {
        if (/\.[cm]?[jt]sx?|vue|svelte$/.test(id)) {
          const resolution = await this.resolve("@mkx419/tx", undefined, {});

          if (resolution?.id) {
            return transform(code, {
              fileName: id,
              moduleName: join("/", relative(__dirname, resolution.id)).replace(/\\/g, "/"),
            });
          }
        }
      },
    },
  };
}
