import { createLocalize } from "@zoai/core";
import { useState, useCallback } from "react";

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
    const [, setLocale] = useState(localize.getLocale());

    const setLocaleWrapper = useCallback(
      (locale: Parameters<typeof localize.setLocale>[0]) => {
        localize.setLocale(locale);
        setLocale(locale);
      },
      []
    );

    return {
      ...localize,
      setLocale: setLocaleWrapper,
    };
  };
};
