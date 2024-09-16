declare module "virtual:tx" {
  function tx(...values: (string | boolean)[]): string;
  function tm(modifier: `${string}:`, value: string): string;
  function tv<V extends { [value: string]: string }>(config: V): (value: keyof V) => string;
  type Prop<T> = T extends (value: infer V) => string ? V : unknown;
}
