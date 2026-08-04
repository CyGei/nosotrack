// A one-slot bridge letting <Nav> hand a section target to <Hero>, so the
// hero can collapse before scrolling. Exactly one of each is ever mounted.

/** Returns true if the hero took ownership of the jump to `hash`. */
type HeroNavHandler = (hash: string) => boolean;

let handler: HeroNavHandler | null = null;

/** Returns an unregister fn for effect cleanup. */
export function registerHeroNav(h: HeroNavHandler): () => void {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}

/** Returns false when no hero is mounted or it declines, so the caller can
 *  fall back to a normal anchor scroll. */
export function requestHeroNav(hash: string): boolean {
  return handler ? handler(hash) : false;
}
