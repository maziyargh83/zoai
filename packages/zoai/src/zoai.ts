/**
 * Custom error class for translation-related errors
 */
export class TranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslationError";
  }
}

/**
 * CLDR plural categories, as returned by `Intl.PluralRules`.
 */
export type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

/**
 * A plural translation leaf. `other` is required; the rest are optional.
 * `zero` is also used for an exact count of 0, even in languages
 * (like English or Persian) whose plural rules have no zero category.
 *
 * @example { one: "{{count}} gem", other: "{{count}} gems" }
 */
export type PluralForms = { readonly other: string } & {
  readonly [C in Exclude<PluralCategory, "other">]?: string;
};

/** Whether a dictionary value is plural forms (only plural-category keys). */
export type IsPlural<V> = V extends PluralForms
  ? [Exclude<keyof V, PluralCategory>] extends [never]
    ? true
    : false
  : false;

/**
 * Shape of a translation dictionary: nested objects whose leaves are strings
 * or plural forms.
 */
export interface Dictionary {
  readonly [key: string]: string | PluralForms | Dictionary;
}

/** Placeholder values may be strings or numbers. */
export type PlaceholderValue = string | number;

/**
 * Utility type for nested object keys. Only leaves (strings and plural forms)
 * are valid keys. When `T` is a union of locales, only keys present in every
 * locale are allowed, so a key missing from one language is a type error.
 */
export type NestedKeyOf<T> = {
  // `Extract<keyof T, …>` keeps this mapped type non-homomorphic, so a union of
  // locales is walked as one shape (common keys) instead of per member.
  [K in Extract<keyof T, string | number>]: T[K] extends string
    ? `${K}`
    : IsPlural<T[K]> extends true
      ? `${K}`
      : T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : never;
}[Extract<keyof T, string | number>];

/**
 * Utility type for nested object values
 */
export type NestedValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? T[K] extends object
        ? NestedValue<T[K], R>
        : never
      : never
    : never;

type Trim<S extends string> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer R} `
    ? Trim<R>
    : S;

/**
 * Utility type to extract placeholder keys from a string
 */
export type ExtractPlaceholders<T extends string> =
  T extends `${string}{{${infer P}}}${infer R}`
    ? Trim<P> | ExtractPlaceholders<R>
    : never;

/**
 * Utility type for placeholder values
 */
export type PlaceholderValues<T extends string> = {
  [K in ExtractPlaceholders<T>]: PlaceholderValue;
};

type LeafStrings<V> = V extends string
  ? V
  : IsPlural<V> extends true
    ? Extract<V[keyof V], string>
    : never;

/**
 * Arguments accepted by `t()` after the path, derived from the translation.
 */
export type TranslateArgs<V> =
  IsPlural<V> extends true
    ? [
        values: { count: number } & Omit<
          PlaceholderValues<LeafStrings<V>>,
          "count"
        >,
      ]
    : string extends LeafStrings<V>
      ? // Non-literal dictionaries (e.g. imported JSON) cannot be checked.
        [values?: Record<string, PlaceholderValue>]
      : [ExtractPlaceholders<LeafStrings<V>>] extends [never]
        ? [values?: undefined]
        : [values: PlaceholderValues<LeafStrings<V>>];

export interface ZOAIOptions {
  /** BCP 47 locale used for plural rules and number formatting. */
  locale?: string;
  /** Format number placeholders with `Intl.NumberFormat` (e.g. "۱٬۲۳۴" in fa). */
  formatNumbers?: boolean;
  /** Dictionary consulted when a key is missing from this one. */
  fallback?: Pick<ZOAI<unknown>, "resolve">;
}

const PLACEHOLDER = /\{\{\s*([\w.-]+)\s*\}\}/g;

const PLURAL_CATEGORIES = new Set<string>([
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
]);

// Only an object made solely of plural categories is a plural, so a
// dictionary section that merely has an "other" key stays a section.
const isPluralForms = (value: unknown): value is PluralForms =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as PluralForms).other === "string" &&
  Object.keys(value).every((key) => PLURAL_CATEGORIES.has(key));

export class ZOAI<T> {
  private pluralRules?: Intl.PluralRules;
  private numberFormat?: Intl.NumberFormat;

  constructor(
    private translations: T,
    private options: ZOAIOptions = {},
  ) {}

  /** The locale this dictionary formats for, if one was given. */
  get locale(): string | undefined {
    return this.options.locale;
  }

  t<P extends NestedKeyOf<T>>(
    path: P,
    ...args: TranslateArgs<NestedValue<T, P>>
  ): string {
    const [values] = args as [Record<string, PlaceholderValue> | undefined];

    if (!path) throw new TranslationError("Translation path is required");

    const value = this.resolve(path) ?? this.options.fallback?.resolve(path);

    if (value === undefined)
      throw new TranslationError(`Translation not found for path: ${path}`);

    const template = isPluralForms(value)
      ? this.selectPlural(value, values?.count, path)
      : value;

    if (values) return this.replacePlaceholders(template, values);

    return template;
  }

  /** Whether `path` resolves to a translation here or in the fallback. */
  has(path: string): boolean {
    return (
      (this.resolve(path) ?? this.options.fallback?.resolve(path)) !== undefined
    );
  }

  /** Format a number for this dictionary's locale. */
  formatNumber(
    value: number | bigint,
    options?: Intl.NumberFormatOptions,
  ): string {
    if (options)
      return new Intl.NumberFormat(this.locale, options).format(value);
    this.numberFormat ??= new Intl.NumberFormat(this.locale);
    return this.numberFormat.format(value);
  }

  /**
   * Look up a leaf without throwing. Returns undefined for missing keys and
   * for paths that stop at a nested object.
   * @internal
   */
  resolve(path: string): string | PluralForms | undefined {
    let current: unknown = this.translations;

    for (const key of path.split(".")) {
      if (typeof current !== "object" || current === null) return undefined;
      current = (current as Record<string, unknown>)[key];
    }

    if (typeof current === "string" || isPluralForms(current)) return current;
    return undefined;
  }

  private selectPlural(
    forms: PluralForms,
    count: PlaceholderValue | undefined,
    path: string,
  ): string {
    if (typeof count !== "number")
      throw new TranslationError(
        `Plural translation "${path}" requires a numeric "count" value`,
      );

    if (count === 0 && forms.zero !== undefined) return forms.zero;

    this.pluralRules ??= new Intl.PluralRules(this.locale);
    return forms[this.pluralRules.select(count)] ?? forms.other;
  }

  /**
   * Replace placeholders in translation string
   * @private
   */
  private replacePlaceholders(
    value: string,
    placeholders: Record<string, PlaceholderValue>,
  ): string {
    return value.replace(PLACEHOLDER, (_, key: string) => {
      if (!(key in placeholders))
        throw new TranslationError(`Missing placeholder value for: ${key}`);

      const replacement = placeholders[key];
      return typeof replacement === "number" && this.options.formatNumbers
        ? this.formatNumber(replacement)
        : String(replacement);
    });
  }
}

export default ZOAI;
