import { useSyncExternalStore } from "react";
import { createSubsciber } from "./utils";
import { createLocalize } from "@zoai/core";

type LocalizeType = ReturnType<typeof createLocalize>;

export const createZoai = <T>(_localize: T) => {
  const localize = _localize as LocalizeType;
  const { subscribe, notify } = createSubsciber();

  const setLocaleWrapper: typeof localize.setLocale = (locale) => {
    localize.setLocale(locale);
    notify();
  };

  return () => {
    useSyncExternalStore(subscribe, localize.getLocale);

    return {
      ...localize,
      setLocale: setLocaleWrapper,
    } as T;
  };
};
