import { useSyncExternalStore } from "react";
import type { Localize } from "@zoai/core";

/**
 * Turn a `createLocalize()` instance into a hook that re-renders its
 * components when the locale changes.
 */
export const createZoai = <K extends string, T>(localize: Localize<K, T>) => {
  const getLocale = () => localize.getLocale();

  return (): Localize<K, T> => {
    useSyncExternalStore(localize.subscribe, getLocale, getLocale);
    return localize;
  };
};
