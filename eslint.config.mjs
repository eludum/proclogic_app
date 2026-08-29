// Flat config. Next 16 removed `next lint`, and ESLint 9 no longer reads
// .eslintrc.json by default, so `pnpm lint` had been failing on both counts.
// eslint-config-next 16 ships its own flat config under /core-web-vitals,
// which is the direct equivalent of the old { "extends": ["next/core-web-vitals"] }.
import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...coreWebVitals,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];
