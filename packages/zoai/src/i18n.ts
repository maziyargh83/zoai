import { TranslationError, ZOAI } from "./zoai";

export type TextDirection = "ltr" | "rtl";

const RTL_LANGUAGES = new Set([
  "ar",
  "arc",
  "ckb",
  "dv",
  "fa",
  "he",
  "iw",
  "ks",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);
const RTL_SCRIPTS = new Set([
  "arab",
  "hebr",
  "syrc",
  "thaa",
  "nkoo",
  "adlm",
  "rohg",
]);

/**
 * Text direction of a BCP 47 locale ("fa", "fa-IR", "ku-Arab" → "rtl").
 */
export const getDirection = (locale: string): TextDirection => {
  const [language = "", ...subtags] = locale.toLowerCase().split(/[-_]/);
  const script = subtags.find((subtag) => subtag.length === 4);
  if (script) return RTL_SCRIPTS.has(script) ? "rtl" : "ltr";
  return RTL_LANGUAGES.has(language) ? "rtl" : "ltr";
};

/**
 * Pick the best available locale for a list of requested ones, matching the
 * full tag first and then the base language ("fa-IR" → "fa").
 *
 * @example matchLocale(navigator.languages, ["en", "fa"])
 */
export const matchLocale = <K extends string>(
  requested: readonly string[],
  available: readonly K[],
): K | undefined => {
  const lower = available.map((locale) => locale.toLowerCase());

  for (const candidate of requested) {
    if (typeof candidate !== "string" || !candidate) continue;
    const tag = candidate.toLowerCase().replace("_", "-");
    const exact = lower.indexOf(tag);
    if (exact !== -1) return available[exact];

    const base = lower.indexOf(tag.split("-")[0]);
    if (base !== -1) return available[base];
  }

  return undefined;
};

export interface LocalizeOptions<K extends string> {
  /** Initial locale. Defaults to the first key of `data`. */
  defaultLocale?: K;
  /**
   * Locale used when a key is missing from the active one. Defaults to the
   * initial locale; pass `false` to throw on missing keys instead.
   */
  fallbackLocale?: K | false;
  /** Format number placeholders for the active locale (e.g. "۳" in fa). */
  formatNumbers?: boolean;
}

export interface Localize<K extends string, T> {
  /** Translate a key of the active locale. */
  t: ZOAI<T>["t"];
  /** Whether a key exists in the active locale or its fallback. */
  has: (path: string) => boolean;
  setLocale: (locale: K) => void;
  getLocale: () => K;
  /** Every locale passed to `createLocalize`. */
  locales: readonly K[];
  /** Text direction of a locale, the active one by default. */
  dir: (locale?: K) => TextDirection;
  /** Format a number for the active locale. */
  formatNumber: (
    value: number | bigint,
    options?: Intl.NumberFormatOptions,
  ) => string;
  /** Run `listener` after every locale change. Returns an unsubscribe function. */
  subscribe: (listener: (locale: K) => void) => () => void;
}

export const createLocalize = <K extends string, T, L extends K = K>(
  data: Record<K, T>,
  { defaultLocale, fallbackLocale, formatNumbers }: LocalizeOptions<L> = {},
): Localize<K, T> => {
  const locales = Object.keys(data) as K[];
  let currentLocale: K = defaultLocale ?? locales[0];

  if (!currentLocale) throw new Error("No locale set");

  const assertLocale = (locale: K) => {
    if (!Object.prototype.hasOwnProperty.call(data, locale))
      throw new TranslationError(`Unknown locale: ${locale}`);
  };
  assertLocale(currentLocale);

  const fallback =
    fallbackLocale === false ? undefined : (fallbackLocale ?? currentLocale);
  if (fallback) assertLocale(fallback);

  const instances = new Map<K, ZOAI<T>>();
  const instance = (locale: K): ZOAI<T> => {
    let zoai = instances.get(locale);
    if (!zoai) {
      zoai = new ZOAI<T>(data[locale], {
        locale,
        formatNumbers,
        fallback:
          fallback && fallback !== locale ? instance(fallback) : undefined,
      });
      instances.set(locale, zoai);
    }
    return zoai;
  };

  const listeners = new Set<(locale: K) => void>();

  return {
    t: ((...args: Parameters<ZOAI<T>["t"]>) =>
      instance(currentLocale).t(...args)) as ZOAI<T>["t"],
    has: (path) => instance(currentLocale).has(path),
    setLocale: (locale) => {
      assertLocale(locale);
      if (locale === currentLocale) return;
      currentLocale = locale;
      listeners.forEach((listener) => listener(locale));
    },
    getLocale: () => currentLocale,
    locales,
    dir: (locale = currentLocale) => getDirection(locale),
    formatNumber: (value, options) =>
      instance(currentLocale).formatNumber(value, options),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
