<p align="center">
  <img src="https://github.com/maziyargh83/zoai/blob/main/static/logo.png?raw=true" width="300" alt="@zoai/core" />
</p>

<p align="center"><strong>A multilingual package for your applications</strong></p>

<div align="center">

[![npm version](https://badge.fury.io/js/@zoai%2Fcore.svg)](https://badge.fury.io/js/@zoai%2Fcore)
![npm downloads](https://img.shields.io/npm/dw/@zoai/core)

<a href="https://twitter.com/intent/follow?screen_name=GhMaziyar">
  <img src="https://img.shields.io/twitter/follow/GhMaziyar?style=social&logo=x" alt="Follow on Twitter">
</a>

</div>

---

# 📦 zoai

> From **Z**ed **to** **A** **I**nternational – A lightweight, type-safe, platform-agnostic multilingual package for JavaScript and TypeScript environments.

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [📥 Installation](#-installation)
- [🚀 Usage](#-usage)
  - [🧑‍💻 TypeScript Example](#-typescript-example)
  - [🧾 Pure JavaScript Example](#-pure-javascript-example)
  - [📘 Enum & Dynamic Access Example](#-enum--dynamic-access-example)
- [📚 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙌 Credits](#-credits)

---

## ✨ Features

- 🌍 Simple and flexible translation system
- 🧠 Type-safe API with `as const` support
- 🔀 Supports nested keys and placeholders
- 🔒 Immutable language objects
- ⚡ Zero runtime dependencies
- 🧩 Works in both JavaScript and TypeScript
- 📱 **Platform-agnostic**: usable in web, Node.js, mobile, or CLI apps

---

## 📥 Installation

```bash
# Using pnpm
pnpm add @zoai/core

# Or yarn
yarn add @zoai/core

# Or npm
npm install @zoai/core
```

---

## 🚀 Usage

### 🧑‍💻 TypeScript Example

```ts
import { Zoai } from "@zoai/core";

const zoai = new Zoai({
  helloWorld: "Hello World",
  goodbyeWorld: "Goodbye World",
  helloBye: "Hello {{name}}",
  nested: {
    children: "Nested children {{index}}",
  },
} as const);

console.log(zoai.t("helloWorld")); // Hello World
console.log(zoai.t("goodbyeWorld")); // Goodbye World
console.log(zoai.t("helloBye", { name: "John" })); // Hello John
console.log(zoai.t("nested.children", { index: 1 })); // Nested children 1
```

---

### 🧾 Pure JavaScript Example

```js
import ZOAI from "@zoai/core";

const lang = Object.freeze({
  hello: "hello {{name}} {{age}}",
});

const zoai = new ZOAI(lang);

console.log(zoai.t("hello", { name: "John", age: 20 }));
// Output: hello John 20
```

---

### 📘 Enum & Dynamic Access Example

Use enums and dynamic keys safely with `zoai`. Lowercasing is optional — as long as keys match your type definition, type safety is preserved.

```ts
import ZOAI from "@zoai/core";

const enum Animal {
  Pinguin = "Pinguin",
  Lion = "Lion",
  Tiger = "Tiger",
  Bear = "Bear",
  Dog = "Dog",
  Cat = "Cat",
  Mouse = "Mouse",
  Bird = "Bird",
}

const lang = {
  animals: {
    [Animal.Pinguin.toLowerCase()]: "Pinguin",
    [Animal.Lion.toLowerCase()]: "Lion",
    [Animal.Tiger.toLowerCase()]: "Tiger",
    [Animal.Bear.toLowerCase()]: "Bear",
    [Animal.Dog.toLowerCase()]: "Dog",
    [Animal.Cat.toLowerCase()]: "Cat",
    [Animal.Mouse.toLowerCase()]: "Mouse",
    [Animal.Bird.toLowerCase()]: "Bird",
  },
} as const;

const zoai = new ZOAI(lang);

console.log(zoai.t("animals.Pinguin")); // Pinguin

const data = ["lion", "tiger", "bear", "dog", "cat", "mouse", "bird"] as const;

for (const key of data) {
  console.log(zoai.t(`animals.${key}`));
}
// Output:
// Lion
// Tiger
// Bear
// Dog
// Cat
// Mouse
// Bird
```

> ✅ **Note:** Using `.toLowerCase()` is optional. As long as your keys are consistent with the type definition, you still get full type safety with `zoai`.

### 🌐 Multi-language Support Example

Use the `createLocalize` function to create a localization utility that supports multiple languages and allows switching between them.

```ts
import { createLocalize } from "@zoai/core";

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
```

---

## 📚 API Reference

### `new Zoai(dictionary: Record<string, string | object>)`

Creates a new Zoai instance with your language map.

### `.t(path: string, values?: Record<string, T): string`

Translates a string key (supports dot notation) and interpolates placeholders.

#### Parameters:

| Name   | Type                | Description                                      |
| ------ | ------------------- | ------------------------------------------------ |
| path   | `string`            | Translation key (e.g. `home.title`, `button.ok`) |
| values | `Record<string, T>` | (Optional) Interpolation values for placeholders |

### `createLocalize(data: Record<K, T>, options: { defaultLocale?: L })`

Creates a localization utility with support for multiple languages.

#### Parameters:

| Name                  | Type           | Description                              |
| --------------------- | -------------- | ---------------------------------------- |
| data                  | `Record<K, T>` | Object containing translations by locale |
| options               | `Object`       | Configuration options                    |
| options.defaultLocale | `L`            | (Optional) Default locale to use         |

#### Returns:

An object with the following methods:

| Method    | Description                                |
| --------- | ------------------------------------------ |
| t         | Translate a key with optional placeholders |
| setLocale | Change the current locale                  |
| getLocale | Get the current locale                     |

---

## 🤝 Contributing

Contributions, ideas, and feature requests are welcome!  
Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

---

## 📄 License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for more details.

---

## 🙌 Credits

Created with ❤️ by [Maziyar Gh](https://github.com/maziyargh83)

---
