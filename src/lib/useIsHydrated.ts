import { useSyncExternalStore } from "react";

// Nothing to subscribe to: the value flips exactly once, when React hydrates,
// and useSyncExternalStore already re-renders at that point.
const subscribe = () => () => {};

/**
 * True once the component has hydrated on the client, false during SSR and the
 * hydration render.
 *
 * Replaces the `const [mounted, setMounted] = useState(false)` +
 * `useEffect(() => setMounted(true), [])` pair. Same semantics, but React
 * distinguishes the server and client snapshots itself rather than us rendering
 * once with the wrong value and setting state in an effect to correct it.
 */
export function useIsHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
