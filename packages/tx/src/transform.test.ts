import { describe } from "vitest";

import { transform } from "./transform";

describe.concurrent("import", (test) => {
  test("tv (basic)", async ({ expect }) => {
    const src = 'import { tv } from "@mkx419/tx";';
    const dist = 'import { tv } from "@mkx419/tx";';

    expect(transform(src).code).toBe(dist);
  });

  test("tv (local name)", async ({ expect }) => {
    const src = 'import { tv as v } from "@mkx419/tx";';
    const dist = 'import { tv as v } from "@mkx419/tx";';

    expect(transform(src).code).toBe(dist);
  });
});

describe.concurrent("tx", (test) => {
  test("basic", async ({ expect }) => {
    const src = 'import { tx } from "@mkx419/tx";\ntx("bg-blue-800", "text-white");';
    const dist = '\n"bg-blue-800 text-white";';

    expect(transform(src).code).toBe(dist);
  });

  test("local name", async ({ expect }) => {
    const src = 'import { tx as x } from "@mkx419/tx";\nx("bg-blue-800", "text-white");';
    const dist = '\n"bg-blue-800 text-white";';

    expect(transform(src).code).toBe(dist);
  });

  test("logical (basic)", async ({ expect }) => {
    const src =
      'import { tx } from "@mkx419/tx";\ntx("bg-blue-800", true && "font-bold", "text-white");';

    const dist = '\n`bg-blue-800${true ? " font-bold " : " "}text-white`;';

    expect(transform(src).code).toBe(dist);
  });

  test("logical (first)", async ({ expect }) => {
    const src =
      'import { tx } from "@mkx419/tx";\ntx(true && "font-bold", "bg-blue-800", "text-white");';

    const dist = '\n`${true ? "font-bold " : ""}bg-blue-800 text-white`;';

    expect(transform(src).code).toBe(dist);
  });

  test("logical (last)", async ({ expect }) => {
    const src =
      'import { tx } from "@mkx419/tx";\ntx("bg-blue-800", "text-white", true && "font-bold");';

    const dist = '\n`bg-blue-800 text-white${true ? " font-bold" : ""}`;';

    expect(transform(src).code).toBe(dist);
  });

  test("logical (first & last)", async ({ expect }) => {
    const src = 'import { tx } from "@mkx419/tx";\ntx(true && "font-bold");';
    const dist = '\n`${true ? "font-bold" : ""}`;';

    expect(transform(src).code).toBe(dist);
  });
});

describe.concurrent("tm", (test) => {
  test("basic", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm("hover:", "bg-blue-800");';
    const dist = '\n"hover:bg-blue-800";';

    expect(transform(src).code).toBe(dist);
  });

  test("multiple values", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm("hover:", "bg-blue-800 text-white");';
    const dist = '\n"hover:bg-blue-800 hover:text-white";';

    expect(transform(src).code).toBe(dist);
  });

  test("template literal", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm(`hover:`, `bg-blue-800 text-white`);';
    const dist = '\n"hover:bg-blue-800 hover:text-white";';

    expect(transform(src).code).toBe(dist);
  });

  test("too few arguments", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm("hover:");';

    expect(() => transform(src)).toThrow("The number of arguments of 'tm' must be 2.");
  });

  test("too many arguments", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm("hover:", "bg-blue-800", "text-white");';

    expect(() => transform(src)).toThrow("The number of arguments of 'tm' must be 2.");
  });

  test("first argument", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm(1, "bg-blue-800");';

    expect(() => transform(src)).toThrow("The first argument to 'tm' must be string literal.");
  });

  test("second argument", async ({ expect }) => {
    const src = 'import { tm } from "@mkx419/tx";\ntm("hover:", 2);';

    expect(() => transform(src)).toThrow(
      "The second argument of 'tm' must be string literal, 'tm' or static 'tx'.",
    );
  });
});

describe.concurrent("multiple", (test) => {
  test("tx & tx", async ({ expect }) => {
    const src =
      'import { tx, tm } from "@mkx419/tx";\ntx("bg-blue-800", "text-white", tx(true && "font-bold"));';

    const dist = '\n`bg-blue-800 text-white${true ? " font-bold" : ""}`;';

    expect(transform(src).code).toBe(dist);
  });

  test("tx & tm", async ({ expect }) => {
    const src =
      'import { tx, tm } from "@mkx419/tx";\ntx("bg-blue-800", true && "font-bold", tm("hover:", "text-white"));';

    const dist = '\n`bg-blue-800${true ? " font-bold " : " "}hover:text-white`;';

    expect(transform(src).code).toBe(dist);
  });

  test("tm & tx", async ({ expect }) => {
    const src =
      'import { tx, tm } from "@mkx419/tx";\ntm("hover:", tx("bg-blue-800", "text-white"));';

    const dist = '\n"hover:bg-blue-800 hover:text-white";';

    expect(transform(src).code).toBe(dist);
  });
});

describe.concurrent("filename", (test) => {
  test("basic", async ({ expect }) => {
    const src = 'import { tv } from "@mkx419/tx";';
    const result = transform(src);

    expect(result.map.file).toBe(undefined);
    expect(result.map.sources).toStrictEqual([""]);
  });

  test("filemame", async ({ expect }) => {
    const src = 'import { tv } from "@mkx419/tx";';
    const fileName = "tx.ts";
    const result = transform(src, { fileName });

    expect(result.map.file).toBe("tx.ts");
    expect(result.map.sources).toStrictEqual(["tx.ts"]);
  });
});
