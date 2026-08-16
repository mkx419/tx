/**
 * Concatenates class names
 * @param values An array of class names to concatenate
 * @returns The concatenated class name
 */
export function tc(...values: string[]): string;

export function tc(): string {
  throw new Error(
    "Each `tc()` call is expected to be replaced with a string literal at build time.\n" +
      "This error indicates that the replacement did not occur correctly.\n" +
      "Check your code and the build settings.",
  );
}

type Props = Record<string, string | boolean | number>;

type Config<T extends Props> = {
  base?: string;
  variants: (Partial<T> & { class: string })[];
  defaults?: Partial<T>;
};

/**
 * Creates a class variant function based on the provided configuration
 * @param config The configuration object containing base class, variants, and defaults
 * @returns A function that takes props and returns the corresponding class name
 */
// oxlint-disable-next-line no-unused-vars
export function tx<T extends Props>(config: Config<T>): (props?: Partial<T>) => string {
  throw new Error(
    "Each `tx()` call is expected to be replaced with a string literal at build time.\n" +
      "This error indicates that the replacement did not occur correctly.\n" +
      "Check your code and the build settings.",
  );
}
