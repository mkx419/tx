import { VIRTUAL_MODULE, VIRTUAL_MODULE_ID } from "./constants";
import { rawTransform } from "./transform";

export * from "./constants";
export * from "./transform";

export function transform(source: string, filename?: string) {
  return rawTransform(
    source.replace(
      new RegExp(`import\\s*(.*?)\\s*from\\s*["']${VIRTUAL_MODULE_ID}["']\\s*;`, "gs"),
      (_, arg) => `import ${arg} from "${VIRTUAL_MODULE}";`,
    ),
    filename,
  ).code;
}
