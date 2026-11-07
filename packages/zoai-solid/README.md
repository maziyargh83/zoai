# @zoai/solid

SolidJS bindings for [`@zoai/core`](../zoai): fine-grained reactive, fully type-safe translations with plurals, fallbacks and RTL support, at about 1 kB gzipped.

```bash
pnpm add @zoai/core @zoai/solid
```

## Quick start

```ts
// i18n.ts
import { createZoai } from "@zoai/solid";

const en = {
  title: "Hello {{name}}",
  tiles: { one: "{{count}} tile", other: "{{count}} tiles" },
} as const;

const fa = {
  title: "سلام {{name}}",
  tiles: { one: "{{count}} کاشی", other: "{{count}} کاشی" },
} as const;

export const i18n = createZoai(
  { en, fa },
  {
    defaultLocale: "en",
    storageKey: "locale", // remember the choice in localStorage
    detect: true, // otherwise start from navigator.languages
    syncDocument: true, // keep <html lang dir> in sync ("rtl" for fa)
    formatNumbers: true, // "۳ کاشی" in Persian
  },
);

export const { t } = i18n;
```

```tsx
import { For } from "solid-js";
import { i18n, t } from "./i18n";

export const Header = () => (
  <header>
    <h1>{t("title", { name: "Ace" })}</h1>
    <p>{t("tiles", { count: 3 })}</p>
    <For each={i18n.locales}>
      {(locale) => (
        <button onClick={() => i18n.setLocale(locale)}>{locale}</button>
      )}
    </For>
  </header>
);
```

`t()` reads the locale signal, so any JSX expression, memo or effect that calls it updates on its own when the language changes: no provider, no hook, no re-render of the tree.

## Type safety

- Keys are checked: `t("titel")` is a compile error.
- Placeholders are checked: `t("title")` without `{ name }` is a compile error.
- Plural keys require a numeric `count`.
- A key missing from one locale can't be used until every locale has it.

## API

### `createZoai(data, options?)` / `createZoai(localize, options?)`

Pass the locale dictionaries, or an existing `createLocalize()` instance from `@zoai/core`. Call it at module level for an app-wide singleton, or inside a component (its subscription is then disposed with the owner).

| Option           | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `defaultLocale`  | Initial locale. Defaults to the first key.                    |
| `fallbackLocale` | Used for keys missing in the active locale. `false` to throw. |
| `formatNumbers`  | Format number placeholders with `Intl.NumberFormat`.          |
| `storageKey`     | Persist and restore the locale in `localStorage`.             |
| `detect`         | Pick the initial locale from `navigator.languages`.           |
| `syncDocument`   | Keep `<html lang dir>` (or a given element) in sync.          |

Returns:

| Member              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `t(key, values?)`   | Reactive translate                                |
| `locale()`          | Active locale (signal)                            |
| `setLocale(locale)` | Switch language                                   |
| `dir()`             | `"ltr"` or `"rtl"` for the active locale (signal) |
| `locales`           | All available locales                             |
| `formatNumber(n)`   | Reactive locale-aware number formatting           |
| `has(key)`          | Whether a key exists (reactive)                   |
| `localize`          | The underlying `@zoai/core` instance              |

### `ZoaiProvider` / `useZoai()`

Optional context, for libraries or tests that need a different instance per tree:

```tsx
<ZoaiProvider value={i18n}>
  <App />
</ZoaiProvider>;
const { t } = useZoai<typeof i18n>();
```
