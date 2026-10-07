import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: { alias: Object.fromEntries(["domain", "policy-engine", "audit"].map(name => [
    "@fro/" + name, fileURLToPath(new URL("./packages/" + name + "/src/index.ts", import.meta.url)),
  ])) },
  test: { include: ["tests/**/*.test.ts"], maxWorkers: 2 },
});
