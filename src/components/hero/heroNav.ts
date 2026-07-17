/* =========================================================================
   heroNav — a one-slot bridge between the global <Nav> and the <Hero>.
   -------------------------------------------------------------------------
   The hero cinematic is a tall, pinned wrapper ((N+1)×100svh). While it
   hasn't completed, the sections below it (About, Research, Team, …) sit
   several viewports down. A raw `#section` anchor click starts scrolling
   toward that far-down position, but partway there the hero's completion
   sentinel trips: the wrapper collapses to 100svh and its scroll-
   compensation hard-resets Lenis's target — overriding the in-flight anchor
   scroll and stranding the click mid-page. The section only lands on the
   SECOND click, once the hero is already collapsed. (Same race the hero's
   own "Scroll to learn more" button avoids by forcing completion first —
   see Hero's completeAndScrollTo.)

   This module lets the nav hand a section target to the hero so the hero
   can run that exact collapse-then-scroll sequence for ANY section, not
   just About. The hero registers a handler while it's mounted; the nav
   asks it to take over a click. If no hero is mounted (other routes) — or
   the target isn't a section the hero owns — the handler declines and the
   nav falls back to the browser / Lenis default. Exactly one <Nav> and one
   <Hero> exist at a time, so a single module-level slot is all we need.
   ========================================================================= */

/** A hero's click handler. Returns true if the hero took ownership of the
 *  jump to `hash` (it will collapse if needed, then smooth-scroll there);
 *  false if the caller should handle the anchor itself. */
type HeroNavHandler = (hash: string) => boolean;

let handler: HeroNavHandler | null = null;

/** Called by the mounted hero. Returns an unregister fn for effect cleanup. */
export function registerHeroNav(h: HeroNavHandler): () => void {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}

/** Called by the nav on a same-page section click. Returns false when no
 *  hero is mounted (or it declines), so the caller can fall back to a
 *  normal anchor scroll. */
export function requestHeroNav(hash: string): boolean {
  return handler ? handler(hash) : false;
}
