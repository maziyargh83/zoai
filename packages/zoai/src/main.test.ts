import { describe, it, expect, beforeEach, vi } from "vitest";
import ZOAI, { TranslationError } from "./zoai";
import { createLocalize, getDirection, matchLocale } from "./i18n";

describe("ZOAI", () => {
  const translations = {
    greeting: "Hello {{name}}!",
    spaced: "Hi {{ name }}",
    nested: {
      message: "Welcome to {{place}}",
      deep: {
        value: "Nested {{key}} value",
      },
    },
    gems: { zero: "No gems", one: "{{count}} gem", other: "{{count}} gems" },
    score: "Score {{points}}",
    choice: { other: "Other", standard: "Standard" },
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
      "Welcome to Earth",
    );
  });

  it("should allow whitespace inside placeholders", () => {
    expect(zoai.t("spaced", { name: "Ace" })).toBe("Hi Ace");
  });

  it("should accept number placeholders", () => {
    expect(zoai.t("score", { points: 2048 })).toBe("Score 2048");
  });

  it("should throw error for invalid path", () => {
    // @ts-expect-error unknown key
    expect(() => zoai.t("invalid.path")).toThrow(TranslationError);
  });

  it("should not allow translating a nested object", () => {
    // @ts-expect-error not a leaf
    expect(() => zoai.t("nested")).toThrow(TranslationError);
  });

  it("should throw error for missing placeholder", () => {
    // @ts-expect-error missing name
    expect(() => zoai.t("greeting", {})).toThrow(TranslationError);
  });

  it("should select plural forms", () => {
    expect(zoai.t("gems", { count: 0 })).toBe("No gems");
    expect(zoai.t("gems", { count: 1 })).toBe("1 gem");
    expect(zoai.t("gems", { count: 5 })).toBe("5 gems");
    // @ts-expect-error count is required
    expect(() => zoai.t("gems")).toThrow(TranslationError);
  });

  it("should treat a section with an other key as a section", () => {
    expect(zoai.t("choice.other")).toBe("Other");
    // @ts-expect-error a section, not a plural
    expect(() => zoai.t("choice", { count: 1 })).toThrow(TranslationError);
  });

  it("should format numbers for its locale when asked", () => {
    const fa = new ZOAI({ score: "امتیاز {{points}}" } as const, {
      locale: "fa",
      formatNumbers: true,
    });
    expect(fa.t("score", { points: 1234 })).toBe("امتیاز ۱٬۲۳۴");
    expect(fa.formatNumber(2048)).toBe("۲٬۰۴۸");
  });
});

describe("createLocalize", () => {
  const langs = {
    en: {
      hello: "Hello",
      greeting: "Hello {{name}}",
      onlyEn: "English only",
      tiles: { one: "{{count}} tile", other: "{{count}} tiles" },
    },
    fa: {
      hello: "سلام",
      greeting: "سلام {{name}}",
      tiles: { other: "{{count}} کاشی" },
    },
  } as const;

  const create = () =>
    createLocalize(langs, { defaultLocale: "en", formatNumbers: true });

  it("should switch locales", () => {
    const i18n = create();
    expect(i18n.t("greeting", { name: "Ace" })).toBe("Hello Ace");
    i18n.setLocale("fa");
    expect(i18n.getLocale()).toBe("fa");
    expect(i18n.t("greeting", { name: "Ace" })).toBe("سلام Ace");
    expect(i18n.t("tiles", { count: 3 })).toBe("۳ کاشی");
  });

  it("should only type keys that exist in every locale", () => {
    const i18n = create();
    i18n.setLocale("fa");
    // @ts-expect-error missing from fa, but falls back to en at runtime
    expect(i18n.t("onlyEn")).toBe("English only");
    expect(i18n.has("onlyEn")).toBe(true);
    expect(i18n.has("missing")).toBe(false);
  });

  it("should throw on missing keys without a fallback", () => {
    const i18n = createLocalize(langs, {
      defaultLocale: "fa",
      fallbackLocale: false,
    });
    // @ts-expect-error missing from fa
    expect(() => i18n.t("onlyEn")).toThrow(TranslationError);
  });

  it("should notify subscribers on change only", () => {
    const i18n = create();
    const listener = vi.fn();
    const unsubscribe = i18n.subscribe(listener);
    i18n.setLocale("en");
    i18n.setLocale("fa");
    unsubscribe();
    i18n.setLocale("en");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith("fa");
  });

  it("should reject unknown locales", () => {
    const i18n = create();
    // @ts-expect-error unknown locale
    expect(() => i18n.setLocale("de")).toThrow(TranslationError);
  });

  it("should expose direction and locales", () => {
    const i18n = create();
    expect(i18n.locales).toEqual(["en", "fa"]);
    expect(i18n.dir()).toBe("ltr");
    expect(i18n.dir("fa")).toBe("rtl");
    expect(i18n.formatNumber(12)).toBe("12");
  });
});

describe("helpers", () => {
  it("should detect text direction", () => {
    expect(getDirection("fa-IR")).toBe("rtl");
    expect(getDirection("ar")).toBe("rtl");
    expect(getDirection("en-US")).toBe("ltr");
    expect(getDirection("ku-Arab")).toBe("rtl");
    expect(getDirection("az-Latn")).toBe("ltr");
  });

  it("should match requested locales", () => {
    expect(matchLocale(["fa-IR", "en"], ["en", "fa"] as const)).toBe("fa");
    expect(matchLocale(["de"], ["en", "fa"] as const)).toBeUndefined();
    expect(
      matchLocale([undefined as unknown as string, "fa"], [
        "en",
        "fa",
      ] as const),
    ).toBe("fa");
    expect(matchLocale(["pt_BR"], ["pt-BR", "pt"] as const)).toBe("pt-BR");
  });
});
