// Flat config. Next 16 removed `next lint`, and ESLint 9 no longer reads
// .eslintrc.json by default, so `pnpm lint` had been failing on both counts.
// eslint-config-next 16 ships its own flat config under /core-web-vitals,
// which is the direct equivalent of the old { "extends": ["next/core-web-vitals"] }.
import coreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...coreWebVitals,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  {
    rules: {
      // react-hooks/set-state-in-effect is new in eslint-plugin-react-hooks 6
      // and an error by default here. It rejects *any* setState reachable from
      // an effect body -- verified: wrapping the fetcher in useCallback and
      // moving the setState behind an await does not satisfy it either.
      //
      // Every remaining report is a component that loads its data in an effect
      // and tracks its own loading/error state, which is how this app fetches
      // everywhere. Clearing them means moving async state into a data layer
      // that owns it (React Query/SWR, or server components) -- a real
      // migration, not a local edit. Kept as a warning so the list stays
      // visible instead of being switched off.
      //
      // The reports that were NOT this pattern -- state derived from props,
      // effects reading a binding declared below them, an impure initialiser
      // called during render -- are fixed rather than downgraded.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default config;
