# zoai

> From **Z**ed **to** **A** **I**nternational - A multilingual package for your applications

## Installation

```sh
pnpm add @zoai/core
```

## Usage

```ts
import { Zoai } from "@zoai/core";

const zoai = new Zoai({
  helloWorld: "Hello World",
  goodbyeWorld: "Goodbye World",
  helloBye: "Hello {{name}}",
} as const);

console.log(zoai.t("helloWorld"));
console.log(zoai.t("goodbyeWorld"));
console.log(zoai.t("helloBye", { name: "John" }));
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for more information.
