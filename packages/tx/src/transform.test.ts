import { describe } from "vitest";
import { transform as _transform } from "./transform";

function clean(strings: TemplateStringsArray, ...values: unknown[]) {
  return String.raw(strings, ...values).replace(/\n\s+/g, "");
}

function transform(source: string) {
  return _transform(source).code;
}

describe.concurrent("tx", (test) => {
  test("normal", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", "text-white");
    `;

    const dist = `"bg-blue-800 text-white";`;

    expect(transform(src)).toBe(dist);
  });

  test("local name", async ({ expect }) => {
    const src = clean`
    import { tx as x } from "@mkx419/tx";
    x("bg-blue-800", "text-white");
    `;

    const dist = clean`
    "bg-blue-800 text-white";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("logical", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", true && "font-bold", "text-white");
    `;

    const dist = '`bg-blue-800${true ? ` ${"font-bold"} ` : " "}text-white`;';

    expect(transform(src)).toBe(dist);
  });

  test("logical (first)", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx(true && "font-bold", "bg-blue-800", "text-white");
    `;

    const dist = '`${true ? `${"font-bold"} ` : ""}bg-blue-800 text-white`;';

    expect(transform(src)).toBe(dist);
  });

  test("logical (last)", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", "text-white", true && "font-bold");
    `;

    const dist = '`bg-blue-800 text-white${true ? ` ${"font-bold"}` : ""}`;';

    expect(transform(src)).toBe(dist);
  });

  test("logical (function)", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", true && "font-bold", x());
    `;

    const dist = '`bg-blue-800${true ? ` ${"font-bold"} ` : " "}${x()}`;';

    expect(transform(src)).toBe(dist);
  });

  test("logical (variable)", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", true && "font-bold", x);
    `;

    const dist = '`bg-blue-800${true ? ` ${"font-bold"} ` : " "}${x}`;';

    expect(transform(src)).toBe(dist);
  });

  test("multiple tx (static)", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", "text-white", tx("font-bold", "text-3xl"));
    `;

    const dist = clean`
    "bg-blue-800 text-white font-bold text-3xl";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("multiple tx (not static)", async ({ expect }) => {
    const src = clean`
    import { tx } from "@mkx419/tx";
    tx("bg-blue-800", "text-white", tx(true ? "font-bold" : "text-3xl"));
    `;

    const dist = '`bg-blue-800 text-white ${true ? "font-bold" : "text-3xl"}`;';

    expect(transform(src)).toBe(dist);
  });

  test("tm", async ({ expect }) => {
    const src = clean`
    import { tx, tm } from "@mkx419/tx";
    tx(tm("hover:", "bg-blue-800"), "text-white");
    `;

    const dist = `"hover:bg-blue-800 text-white";`;

    expect(transform(src)).toBe(dist);
  });
});

describe.concurrent("tm", (test) => {
  test("normal", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm("hover:", "bg-blue-800");
    `;

    const dist = clean`
    "hover:bg-blue-800";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("multiple values", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm("hover:", "bg-blue-800 text-white");
    `;

    const dist = clean`
    "hover:bg-blue-800 hover:text-white";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("multiple tm", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm("lg:", tm("hover:", "bg-blue-800"));
    `;

    const dist = clean`
    "lg:hover:bg-blue-800";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("static tx", async ({ expect }) => {
    const src = clean`
    import { tx, tm } from "@mkx419/tx";
    tm("hover:", tx("bg-blue-800", "text-white"));
    `;

    const dist = clean`
    "hover:bg-blue-800 hover:text-white";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("local name", async ({ expect }) => {
    const src = clean`
    import { tm as m } from "@mkx419/tx";
    m("hover:", "bg-blue-800");
    `;

    const dist = clean`
    "hover:bg-blue-800";
    `;

    expect(transform(src)).toBe(dist);
  });

  test("too few arguments", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm("hover:");
    `;

    expect(() => transform(src)).toThrow("The number of arguments of 'tm' must be 2.");
  });

  test("too many arguments", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm("hover:", "bg-blue-800", "text-white");
    `;

    expect(() => transform(src)).toThrow("The number of arguments of 'tm' must be 2.");
  });

  test("first argument", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm(1, "bg-blue-800");
    `;

    expect(() => transform(src)).toThrow("The first argument to 'tm' must be string literal.");
  });

  test("second argument (not string literal)", async ({ expect }) => {
    const src = clean`
    import { tm } from "@mkx419/tx";
    tm("hover:", 2);
    `;

    expect(() => transform(src)).toThrow(
      "The second argument of 'tm' must be string literal, 'tm' or static 'tx'.",
    );
  });

  test("second argument (not static tx)", async ({ expect }) => {
    const src = clean`
    import { tx, tm } from "@mkx419/tx";
    tm("hover:", tx(true && "bg-blue-800"));
    `;

    expect(() => transform(src)).toThrow(
      "The second argument of 'tm' must be string literal, 'tm' or static 'tx'.",
    );
  });
});

describe.concurrent("tv", (test) => {
  test("import", async ({ expect }) => {
    const src = `import { tv } from "@mkx419/tx";`;
    const dist = `import { tv } from "@mkx419/tx";`;

    expect(transform(src)).toBe(dist);
  });

  test("import (local name)", async ({ expect }) => {
    const src = `import { tv as v } from "@mkx419/tx";`;
    const dist = `import { tv as v } from "@mkx419/tx";`;

    expect(transform(src)).toBe(dist);
  });
});
