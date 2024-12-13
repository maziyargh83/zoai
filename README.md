<p align="center">
    <img src="static/logo.png" width="300" alt="@zoai/core" />
</p>

<p align="center">
    A multilingual package for your applications
</p>

<div align="center">

[![npm version](https://badge.fury.io/js/@zoai%2Fcore.svg)](https://badge.fury.io/js/@zoai%2Fcore)

![npm](https://img.shields.io/npm/dw/@zoai/core)

<a href="https://twitter.com/intent/follow?screen_name=GhMaziyar">
<img src="https://img.shields.io/twitter/follow/GhMaziyar?style=social&logo=x"
            alt="follow on Twitter"></a>

</div>

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

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information.
