import { Transformer, type Options } from "./transformer";

export function transform(source: string, options: Options = {}) {
  return new Transformer(source, options).start();
}
