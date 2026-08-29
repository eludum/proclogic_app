import { useEffect, useRef } from "react";

/**
 * Keep a ref pointing at the latest value without making it a dependency.
 *
 * Used for Clerk's `getToken`. The data-loading callbacks in this app are
 * memoised so the effects that run them can list them as dependencies honestly
 * instead of lying with an empty array. That is only safe while every
 * dependency of the callback is referentially stable: if `getToken` returned a
 * fresh function each render, naming it would rebuild the callback every
 * render, retrigger the effect, and turn a mount-time fetch into an unbounded
 * refetch loop.
 *
 * Reading it through this ref removes the question. The memoised callback then
 * closes over nothing reactive, so its identity never changes and the effect
 * runs exactly once -- the behaviour the original empty dependency arrays were
 * reaching for.
 */
export function useLatestRef<T>(value: T) {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    });
    return ref;
}
