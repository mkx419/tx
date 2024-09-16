import { type Plugin } from "rollup";

import { rawTransform, RESOLVED_VIRTUAL_MODULE_ID, VIRTUAL_MODULE_ID } from "@mkx419/tx";

export function txPlugin(): Plugin<never> {
  return {
    name: "tx",
    resolveId(source) {
      if (source === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return "export const tv = (config) => (value) => config[value];";
      }
    },
    transform: {
      order: "post",
      handler(code, id) {
        if (/\.[jt]s?|svelte$/.test(id)) {
          return rawTransform(id, code);
        }
      },
    },
  };
}
