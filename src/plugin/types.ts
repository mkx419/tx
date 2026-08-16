import type { UnpluginInstance } from "unplugin";

type Arrayable<T> = T | T[];

export interface Options {
  /**
   * A list of file extensions or regular expressions to include in the transformation process.
   * @default /\.([cm]?[jt]sx?|vue|svelte|astro)$/
   */
  include?: Arrayable<string | RegExp>;

  /**
   * A list of file extensions or regular expressions to exclude from the transformation process.
   * @default /node_modules/
   */
  exclude?: Arrayable<string | RegExp>;
}

export type Instance = UnpluginInstance<Options>;
