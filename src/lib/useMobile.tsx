import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT

// The server has no viewport. false matches what the previous implementation
// rendered before its effect ran, so nothing downstream sees a new value here.
const getServerSnapshot = () => false

/**
 * Track whether the viewport is below the mobile breakpoint.
 *
 * useSyncExternalStore rather than state kept in step by an effect: the
 * viewport is an external store, and subscribing to it directly means the first
 * client render already has the right answer instead of rendering the desktop
 * layout and correcting itself a frame later.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
