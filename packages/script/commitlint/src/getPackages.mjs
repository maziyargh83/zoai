import { readdirSync } from "node:fs";
const DEFAULT_SCOPES = ["monorepo"];
const PATHS = ["packages", "apps"];
export const getPackages = () => {
  const packageDirNames = PATHS.flatMap((path) => {
    return readdirSync(`./${path}`, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((dir) => dir.name);
  });

  return DEFAULT_SCOPES.concat(packageDirNames);
};
