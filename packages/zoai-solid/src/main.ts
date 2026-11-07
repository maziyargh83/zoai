import {
  createContext,
  createSignal,
  getOwner,
  onCleanup,
  useContext,
  type Accessor,
} from "solid-js";
import {
  createLocalize,
  getDirection,
  matchLocale,
  type Localize,
  type LocalizeOptions,
  type TextDirection,
} from "@zoai/core";

export interface ZoaiOptions<K extends string> extends LocalizeOptions<K> {
  /**
   * Keep `<html lang dir>` in sync with the active locale. Pass an element to
   * sync something other than `document.documentElement`.
   */
  syncDocument?: boolean | HTMLElement;
  /**
   * Persist the chosen locale in `localStorage` under this key and restore it
   * on start.
   */
  storageKey?: string;
  /** Pick the initial locale from `navigator.languages` when nothing is stored. */
  detect?: boolean;
}

export interface Zoai<K extends string, T> {
  /** Reactive translate: re-runs in effects and JSX when the locale changes. */
  t: Localize<K, T>["t"];
  /** Reactive `has`. */
  has: (path: string) => boolean;
  /** Active locale. */
  locale: Accessor<K>;
  setLocale: (locale: K) => void;
  /** Text direction of the active locale. */
  dir: Accessor<TextDirection>;
  /** Every available locale. */
  locales: readonly K[];
  /** Reactive number formatting for the active locale. */
  formatNumber: Localize<K, T>["formatNumber"];
  /** The underlying framework-agnostic localizer. */
  localize: Localize<K, T>;
}

const readStorage = (key: string) => {
  try {
    return globalThis.localStorage?.getItem(key) ?? undefined;
  } catch {
    return undefined;
  }
};

const writeStorage = (key: string, value: string) => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
};

const isLocalize = <K extends string, T>(
  value: Localize<K, T> | Record<K, T>,
): value is Localize<K, T> =>
  typeof (value as Localize<K, T>).subscribe === "function" &&
  typeof (value as Localize<K, T>).t === "function";

/**
 * Create reactive translations from a dictionary of locales, or wrap an
 * existing `createLocalize()` instance.
 *
 * Call it at module level for an app-wide singleton, or inside a component
 * (its subscriptions are then disposed with the owner).
 *
 * @example
 * export const i18n = createZoai({ en, fa } as const, { storageKey: "lang", syncDocument: true });
 * <h1>{i18n.t("title")}</h1>
 */
export function createZoai<K extends string, T>(
  localize: Localize<K, T>,
  options?: Pick<ZoaiOptions<K>, "syncDocument" | "storageKey" | "detect">,
): Zoai<K, T>;
export function createZoai<K extends string, T, L extends K = K>(
  data: Record<K, T>,
  options?: ZoaiOptions<L>,
): Zoai<K, T>;
export function createZoai<K extends string, T>(
  source: Localize<K, T> | Record<K, T>,
  options: ZoaiOptions<K> = {},
): Zoai<K, T> {
  const { syncDocument, storageKey, detect, ...localizeOptions } = options;
  const localize = isLocalize(source)
    ? source
    : createLocalize(source, localizeOptions);

  const stored = storageKey ? readStorage(storageKey) : undefined;
  const initial =
    (stored && matchLocale([stored], localize.locales)) ||
    (detect && typeof navigator !== "undefined"
      ? matchLocale(
          navigator.languages ?? [navigator.language],
          localize.locales,
        )
      : undefined);
  if (initial) localize.setLocale(initial);

  const [locale, setLocaleSignal] = createSignal<K>(localize.getLocale());

  const target =
    syncDocument === true
      ? typeof document !== "undefined"
        ? document.documentElement
        : undefined
      : syncDocument || undefined;

  const apply = (next: K) => {
    setLocaleSignal(() => next);
    if (storageKey) writeStorage(storageKey, next);
    if (target) {
      target.lang = next;
      target.dir = getDirection(next);
    }
  };

  if (target) {
    target.lang = locale();
    target.dir = getDirection(locale());
  }

  // Follow changes made through the localizer directly, too.
  const unsubscribe = localize.subscribe(apply);
  if (getOwner()) onCleanup(unsubscribe);

  return {
    t: ((...args: Parameters<Localize<K, T>["t"]>) => {
      locale();
      return localize.t(...args);
    }) as Localize<K, T>["t"],
    has: (path) => {
      locale();
      return localize.has(path);
    },
    locale,
    setLocale: localize.setLocale,
    dir: () => getDirection(locale()),
    locales: localize.locales,
    formatNumber: (value, formatOptions) => {
      locale();
      return localize.formatNumber(value, formatOptions);
    },
    localize,
  };
}

const ZoaiContext = createContext<Zoai<string, unknown>>();

/** Provide a `createZoai()` instance to a component tree. */
export const ZoaiProvider = ZoaiContext.Provider;

/**
 * Read the nearest `ZoaiProvider`. Pass the instance's type for typed keys:
 * `useZoai<typeof i18n>()`.
 */
export const useZoai = <
  Z extends Zoai<string, unknown> = Zoai<string, unknown>,
>(): Z => {
  const zoai = useContext(ZoaiContext);
  if (!zoai) throw new Error("useZoai must be used inside <ZoaiProvider>");
  return zoai as Z;
};

export { getDirection, matchLocale };
export type { Localize, LocalizeOptions, TextDirection };
