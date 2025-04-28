import { createZoai } from "@zoai/react";

const useZoai = createZoai({
  en: {
    hello: "Hello",
  },
  fa: {
    hello: "سلام",
  },
} as const);

export { useZoai };
