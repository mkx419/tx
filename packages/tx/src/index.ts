export type Prop<T> = T extends (value: infer V) => string ? V : unknown;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tx(...values: (string | boolean)[]): string {
  throw new Error(
    "'tx' should never be called at runtime. It should be compiled away by '@mkx419/rollup-plugin-tx'.",
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tm(modifier: `${string}:`, value: string): string {
  throw new Error(
    "'tm' should never be called at runtime. It should be compiled away by '@mkx419/rollup-plugin-tx'.",
  );
}

export function tv<Config extends { [variant: string]: string }>(config: Config) {
  return (variant: keyof Config) => config[variant];
}
