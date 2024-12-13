import { describe, it, expect, beforeEach } from "vitest";
import ZOAI, { TranslationError } from "./main";

describe("ZOAI", () => {
  const translations = {
    greeting: "Hello {{name}}!",
    nested: {
      message: "Welcome to {{place}}",
      deep: {
        value: "Nested {{key}} value",
      },
    },
  } as const;

  let zoai: ZOAI<typeof translations>;

  beforeEach(() => {
    zoai = new ZOAI(translations);
  });

  it("should translate simple path", () => {
    expect(zoai.t("greeting", { name: "World" })).toBe("Hello World!");
  });

  it("should translate nested path", () => {
    expect(zoai.t("nested.message", { place: "Earth" })).toBe(
      "Welcome to Earth"
    );
  });

  it("should throw error for invalid path", () => {
    // @ts-expect-error
    expect(() => zoai.t("invalid.path")).toThrow(TranslationError);
  });

  it("should throw error for missing placeholder", () => {
    // @ts-expect-error
    expect(() => zoai.t("greeting", {})).toThrow(TranslationError);
  });
});
