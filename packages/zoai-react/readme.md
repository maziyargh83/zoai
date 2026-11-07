# @zoai/react

React bindings for [`@zoai/core`](../zoai).

```tsx
import { createLocalize } from "@zoai/core";
import { createZoai } from "@zoai/react";

const localize = createLocalize({
  en: { hi: "Hi {{name}}" },
  fa: { hi: "سلام {{name}}" },
} as const);
export const useZoai = createZoai(localize);

const Greeting = () => {
  const { t, setLocale, dir } = useZoai();
  return (
    <h1 dir={dir()} onClick={() => setLocale("fa")}>
      {t("hi", { name: "Ace" })}
    </h1>
  );
};
```
