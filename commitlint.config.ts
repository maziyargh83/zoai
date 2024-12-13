import type { UserConfig } from "@commitlint/types";
import { getPackages } from "@scripts/commitlint";
const Configuration: UserConfig = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ["@commitlint/config-conventional", "monorepo"],
  rules: {
    "scope-enum": [
      2, // throw error
      "always",
      getPackages(),
    ],
  },
};

module.exports = Configuration;
