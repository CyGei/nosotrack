// The wordmark is always all-caps NOSOTRACK; prose/title/aria use "Nosotrack".
export function BrandWordmark() {
  return (
    <>
      <span className="whitespace-nowrap font-mono text-[0.94em] font-medium tracking-[-0.02em]">
        NOSO<span className="text-alert">TRACK</span>
      </span>
      <sup
        aria-label="trademark"
        className="ml-[0.15em] align-super font-mono text-[0.55em] font-medium leading-[0] tracking-normal opacity-70"
      >
        ™
      </sup>
    </>
  );
}
