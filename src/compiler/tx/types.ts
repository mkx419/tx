export type Prop = [key: string, value: string | boolean | number];
export type Variant = [props: Prop[], className: string];

export type IntermediateAST = {
  base: string;
  variants: Variant[];
  defaults: Prop[];
};
