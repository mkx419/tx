import remapping from "@ampproject/remapping";
import { walk, WalkerBase } from "@mkx419/tsestree-walker";
import { parse, type TSESTree } from "@typescript-eslint/typescript-estree";
import MagicString, { DecodedSourceMap, SourceMap } from "magic-string";

import type { Operation } from "./types";

export abstract class RecursiveTransformer<T extends TSESTree.Node> extends WalkerBase {
  protected source: MagicString;
  protected filename: string | undefined;
  private maps: MagicString[] = [];

  constructor(source: string, filename?: string) {
    super();
    this.source = new MagicString(source);
    this.filename = filename;
  }

  protected override enter(node: TSESTree.Node): void {
    if (this.isTarget(node) && !this.hasTarget(node)) {
      const operation = this.transform(node);

      if (this.substring(node.range) !== operation.content) {
        this.apply(operation);
      }
    }
  }

  protected substring(range: [number, number]) {
    return this.source.original.substring(...range);
  }

  protected apply(operation: Operation) {
    if (operation.content) {
      this.source.update(...operation.range, operation.content);
    } else {
      this.source.remove(...operation.range);
    }
  }

  override start(): { code: string; map: SourceMap } {
    super.start(parse(this.source.original, { range: true }));
    this.maps.unshift(this.source);

    if (this.source.hasChanged()) {
      this.source = new MagicString(this.source.toString());
      return this.start();
    }

    return {
      code: this.source.toString(),
      map: new SourceMap({
        ...(remapping(
          this.maps.map((map, index) =>
            map
              .generateMap({
                file: `${index}.ts`,
                source: `${index + 1}.ts`,
              })
              .toString(),
          ),
          () => {},
          { decodedMappings: true },
        ) as DecodedSourceMap),
        file: this.filename as string,
        sources: this.filename ? [this.filename] : [""],
        sourcesContent: undefined,
      }),
    };
  }

  protected abstract isTarget(node: TSESTree.Node): node is T;

  private hasTarget(node: T) {
    const isTarget = (child: TSESTree.Node) => {
      return (
        (child.range[0] !== node.range[0] || child.range[1] !== node.range[1]) &&
        this.isTarget(child) &&
        this.substring(node.range).substring(...child.range) !== this.transform(child).content
      );
    };

    let flag = false;

    walk(node, {
      enter(child) {
        if (isTarget(child)) {
          flag = true;
        }

        if (flag) {
          this.skip();
          return;
        }
      },
    });

    return flag;
  }

  protected abstract transform(node: T): Required<Operation>;

  protected isFirst() {
    return !this.maps.length;
  }
}
