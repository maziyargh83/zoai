import { createLocalize } from "@zoai/core";
import { useState } from "react";
export const createZoai = <K extends string, T, L extends K>(
  data: Record<K, T>,
  {
    defaultLocale,
  }: {
    defaultLocale?: L;
  } = {}
) => {
  let localize = createLocalize(data, { defaultLocale });
  return () => {
    const [_, setReRender] = useState(0);
    return {
      ...localize,
      setLocale: (locale: Parameters<typeof localize.setLocale>[0]) => {
        localize.setLocale(locale);
        setReRender((prev) => prev + 1);
      },
    };
  };
};
