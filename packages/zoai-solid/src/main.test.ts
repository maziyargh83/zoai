import { describe, it, expect } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createLocalize } from "@zoai/core";
import { createZoai } from "./main";

const langs = {
  en: {
    title: "Score {{points}}",
    tiles: { one: "{{count}} tile", other: "{{count}} tiles" },
  },
  fa: { title: "امتیاز {{points}}", tiles: { other: "{{count}} کاشی" } },
} as const;

const flush = () =>
  new Promise((resolve) => queueMicrotask(() => resolve(null)));

describe("createZoai", () => {
  it("re-runs effects when the locale changes", async () => {
    const i18n = createZoai(langs, { formatNumbers: true });
    const seen: string[] = [];

    const dispose = createRoot((dispose) => {
      createEffect(() => seen.push(i18n.t("title", { points: 12 })));
      return dispose;
    });
    await flush();

    i18n.setLocale("fa");
    await flush();

    expect(seen).toEqual(["Score 12", "امتیاز ۱۲"]);
    expect(i18n.locale()).toBe("fa");
    expect(i18n.dir()).toBe("rtl");
    expect(i18n.t("tiles", { count: 2 })).toBe("۲ کاشی");
    dispose();
  });

  it("follows an existing localizer", () => {
    const localize = createLocalize(langs, { defaultLocale: "fa" });
    const i18n = createZoai(localize);
    expect(i18n.locale()).toBe("fa");
    localize.setLocale("en");
    expect(i18n.locale()).toBe("en");
    // @ts-expect-error unknown key
    expect(() => i18n.t("nope")).toThrow();
  });

  it("restores and persists the locale", () => {
    const store = new Map<string, string>();
    globalThis.localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    } as Storage;

    store.set("lang", "fa");
    const i18n = createZoai(langs, { storageKey: "lang" });
    expect(i18n.locale()).toBe("fa");
    i18n.setLocale("en");
    expect(store.get("lang")).toBe("en");
  });

  it("unsubscribes with its owner", () => {
    const localize = createLocalize(langs);
    const locale = createRoot((dispose) => {
      const i18n = createZoai(localize);
      dispose();
      return i18n.locale;
    });
    localize.setLocale("fa");
    expect(locale()).toBe("en");
  });
});
