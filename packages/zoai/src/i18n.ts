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

  return {
    t: _zoai.t,
    setLocale: (locale: K) => {
      currentLocale = locale;
      _zoai = new ZOAI<T>(data[currentLocale]);
    },
    getLocale: () => currentLocale,
  };
};
