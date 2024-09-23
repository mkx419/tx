import { Transformer } from "./transformer";

export function transform(source: string, filename?: string) {
  return new Transformer(source, filename).start();
}
