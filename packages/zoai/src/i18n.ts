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

  if (!currentLocale) throw new Error("No locale set");

  let _zoai = new ZOAI<T>(data[currentLocale]);
  type TFunction = typeof _zoai.t;

  return {
    t: ((...args: Parameters<TFunction>) => _zoai.t(...args)) as TFunction,
    setLocale: (locale: K) => {
      currentLocale = locale;
      _zoai = new ZOAI<T>(data[currentLocale]);
    },
    getLocale: () => currentLocale,
  };
};
