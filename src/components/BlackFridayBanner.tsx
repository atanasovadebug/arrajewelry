const STAR_CLIP =
  "polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const rand = seeded(20261101);

const SPARKLES = Array.from({ length: 46 }, (_, id) => {
  const star = rand() > 0.6;
  return {
    id,
    left: rand() * 100,
    top: rand() * 100,
    size: (star ? 8 : 3) + rand() * (star ? 12 : 5),
    delay: rand() * 7,
    duration: 2.8 + rand() * 4.6,
    star,
  };
});

export function BlackFridayBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-noir text-noir-foreground">
      <div className="bf-glow pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0">
        {SPARKLES.map((s) =>
          s.star ? (
            <span
              key={s.id}
              className="bf-star"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                clipPath: STAR_CLIP,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          ) : (
            <span
              key={s.id}
              className="bf-sparkle"
              style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: s.size,
                height: s.size,
                animationDelay: `${s.delay}s`,
                animationDuration: `${s.duration}s`,
              }}
            />
          )
        )}
      </div>

      <div className="bf-sheen pointer-events-none absolute inset-0" />

      <div className="bf-rule pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div className="bf-rule pointer-events-none absolute inset-x-0 bottom-0 h-px" />

      <div className="relative container mx-auto px-4 py-16 text-center md:py-24">
        <p className="text-[11px] uppercase tracking-[0.5em] text-gold-bright md:text-xs">
          Black Friday Sale
        </p>

        <h2 className="mt-5 font-display text-5xl font-light leading-[1.05] tracking-wide md:text-7xl lg:text-8xl">
          До <span className="italic text-gold-bright">-50%</span> отстъпка
        </h2>

        <div className="mt-8 flex items-center justify-center gap-5 md:gap-8">
          <span className="bf-rule h-px w-12 md:w-20" />
          <span className="text-xs uppercase tracking-[0.4em] text-noir-foreground/85 md:text-sm">
            01 – 06.11
          </span>
          <span className="bf-rule h-px w-12 md:w-20" />
        </div>
      </div>
    </section>
  );
}
