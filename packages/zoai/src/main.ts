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
 * Utility type for nested object keys
 */
export type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];

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

/**
 * Utility type to extract placeholder keys from a string
 */
export type ExtractPlaceholders<T extends string> =
  T extends `${string}{{${infer P}}}${infer R}`
    ? P | ExtractPlaceholders<R>
    : never;

/**
 * Utility type for placeholder values
 */
export type PlaceholderValues<T extends string> = {
  [K in ExtractPlaceholders<T>]: string;
};

class ZOAI<T> {
  constructor(private translations: T) {}
  t<P extends NestedKeyOf<T>>(
    path: P,
    placeholders?: NestedValue<T, P> extends string
      ? PlaceholderValues<NestedValue<T, P>>
      : never
  ): string {
    if (!path) {
      throw new TranslationError("Translation path is required");
    }

    const value = path.split(".").reduce((current: any, key) => {
      if (!current || typeof current !== "object") {
        throw new TranslationError(`Invalid path: ${path}`);
      }
      return current && current[key];
    }, this.translations);
    if (value === undefined) {
      throw new TranslationError(`Translation not found for path: ${path}`);
    }
    if (typeof value !== "string") {
      throw new TranslationError(
        `Invalid translation value type for path: ${path}. Expected string, got ${typeof value}`
      );
    }

    if (placeholders) {
      return this.replacePlaceholders(value, placeholders);
    }

    return value;
  }
  /**
   * Replace placeholders in translation string
   * @private
   */
  private replacePlaceholders(
    value: string,
    placeholders: Record<string, string>
  ): string {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (!(key in placeholders)) {
        throw new TranslationError(`Missing placeholder value for: ${key}`);
      }
      return placeholders[key];
    });
  }
}
export default ZOAI;
