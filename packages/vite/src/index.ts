import { transform } from "@mkx419/tx/transform";
import { join, relative } from "path";
import type { Plugin } from "vite";

export function txPlugin(): Plugin {
  let root: string | undefined = undefined;

  return {
    name: "tx",
    configureServer({ config }) {
      root = config.root;
    },
    transform: {
      order: "post",
      async handler(code, id) {
        if (/\.[cm]?[jt]sx?|vue|svelte$/.test(id)) {
          if (root) {
            const resolution = await this.resolve("@mkx419/tx");

            if (resolution?.id) {
              return transform(code, {
                fileName: id,
                moduleName: join("/", relative(root, resolution.id)).replace(/\\/g, "/"),
              });
            }
          } else {
            return transform(code, { fileName: id });
          }
        }
      },
    },
  };
}
