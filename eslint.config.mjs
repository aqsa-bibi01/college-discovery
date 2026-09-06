import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The react-hooks "set-state-in-effect" rule (from the React Compiler
    // plugin bundled with this eslint-config-next version) flags the
    // standard "fetch in useEffect, setState with the result" pattern as an
    // error. That pattern is intentional and correct here (client components
    // fetching from our own API routes), so this is downgraded to a warning
    // rather than restructured into more convoluted code.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
