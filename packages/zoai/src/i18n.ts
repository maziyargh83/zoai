import { ZOAI } from "./zoai";

export const createLocalize = <K extends string, T, L extends K>(
  data: Record<K, T>,
  {
    defaultLocale,
  }: {
    defaultLocale?: L;
  } = {}
) => {
  let currentLocale = defaultLocale ?? (Object.keys(data)[0] as K);
  if (!currentLocale) {
    throw new Error("No locale set");
  }
  let _zoai = new ZOAI<T>(data[currentLocale]);
  type keysType = ZOAI<T>["t"];
  const t: keysType = (key, placeholders) => {
    if (!currentLocale) {
      throw new Error("No locale set");
    }
    return _zoai.t(key, placeholders);
  };
  return {
    t,
    setLocale: (locale: K) => {
      currentLocale = locale;
      _zoai = new ZOAI<T>(data[currentLocale]);
    },
    getLocale: () => currentLocale,
  };
};

const langs = {
  en: {
    hello: "Hello",
    greeting: "Hello {{name}}",
  },
  fr: {
    hello: "Bonjour",
    greeting: "Bonjour {{name}}",
  },
  es: {
    hello: "Hola",
    greeting: "Hola {{name}}",
  },
} as const;

const translation = createLocalize(langs, {
  defaultLocale: "en",
});

console.log(translation.t("hello")); // Hello
console.log(translation.t("greeting", { name: "John" })); // Hello John

translation.setLocale("fr");
console.log(translation.t("hello")); // Bonjour
console.log(translation.t("greeting", { name: "John" })); // Bonjour John

console.log(translation.getLocale()); // fr
