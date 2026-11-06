import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // Pre-existing patterns (localStorage hydration, fetch-then-setState in
      // effects) carried over from the JS codebase during the TS conversion;
      // restructuring them is a separate behavioural task.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Stale backup folder from a previous install:
    "node_modules_old/**",
  ]),
]);

export default eslintConfig;
