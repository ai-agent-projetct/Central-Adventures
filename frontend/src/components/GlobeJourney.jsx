import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";

const TIME_ICONS = { sunrise: Sunrise, morning: Sunrise, day: Sun, sunset: Sunset, dusk: Sunset, night: Moon };

/* Bird SVG (small silhouette). Rendered a few times drifting across sky at random speeds. */
const Bird = ({ style }) => (
  <svg style={style} width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 8 C 4 3, 7 3, 10 7 C 13 3, 16 3, 21 8" stroke="#0A0F16" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
  </svg>
);

/**
 * Aerial "drone" flythrough journey.
 *   • Sticky container with continuous camera motion — no card cross-fades.
 *   • Each landmark image is oversized (140% width) and continuously pans + zooms
 *     across its segment (drone flying over the site).
 *   • Adjacent images overlap during transitions to fake a seamless fly-through.
 *   • Warm golden-hour tint layered across the whole journey.
 *   • Birds silhouettes drift across at intervals.
 *   • Info card stays anchored bottom-left; only content changes per scene.
 */
export const GlobeJourney = ({ locations = [] }) => {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const height = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), height);
      const p = height > 0 ? scrolled / height : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stops = locations.length;
  // Reserve first 8% for intro hero, last 8% for outro CTA. Rest split evenly.
  const introEnd = 0.08;
  const outroStart = 0.92;
  const seg = (outroStart - introEnd) / Math.max(1, stops);

  let activeIdx = -1;
  let localFrac = 0;
  if (progress >= introEnd && progress < outroStart) {
    const idxF = (progress - introEnd) / seg;
    activeIdx = Math.min(stops - 1, Math.floor(idxF));
    localFrac = idxF - activeIdx;
  }
  const introVisible = progress < introEnd;
  const outroVisible = progress >= outroStart;

  return (
    <div
      ref={containerRef}
      data-scene="globe-hero"
      data-testid="globe-journey"
      className="relative"
      style={{ height: `${100 + 90 * (stops + 1)}vh` }}
    >
      {/* Sticky flythrough pin */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Continuous drone track — every landmark rendered; only active + neighbour
            (for cross-in) contribute visible pixels. */}
        {locations.map((loc, i) => {
          // Compute presence in viewport based on distance from active + localFrac
          // pos: -1 = just left screen, 0 = active center, +1 = about to enter
          let pos;
          if (activeIdx < 0) {
            pos = i === 0 ? -localFrac : (i - (progress / introEnd) * 0.001) + 1; // during intro all hidden except first about to enter
            pos = i === 0 ? 1 - (progress / introEnd) : 2;
          } else {
            pos = (i - activeIdx) - localFrac; // -1 → 0 → +1 as scene progresses
          }
          // Only render nearby scenes for perf
          if (pos < -1.05 || pos > 1.05) return null;

          // Camera motion per landmark: forward zoom + horizontal pan across segment
          // pos 0 = center of segment (max zoom). |pos|=1 = at the edge (handoff)
          const p = pos; // -1..1
          // Alternate pan direction per scene for varied camera feel
          const dir = i % 2 === 0 ? 1 : -1;

          // scale: 1.15 at handoff → 1.35 at peak (drone getting closer)
          const scale = 1.15 + 0.2 * Math.max(0, 1 - Math.abs(p));

          // translateX: pans from +8% to -8% as we cross the scene
          const tx = -p * 10 * dir; // percent viewport
          // translateY: subtle rise
          const ty = p * -4;
          // rotate: subtle tilt for cinematic feel
          const rot = p * -1.5 * dir;

          // Opacity: full while |p| < 0.55; sharp fade at handoff to avoid muddy double-exposure
          const opacity = Math.max(0, Math.min(1, 1.9 - Math.abs(p) * 3.4));

          return (
            <div
              key={loc.id}
              aria-hidden={i !== activeIdx}
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity,
                transform: `translate(${tx}%, ${ty}%) scale(${scale}) rotate(${rot}deg)`,
                transformOrigin: "50% 55%",
                willChange: "transform, opacity",
                transition: "opacity 200ms linear",
              }}
            >
              <img
                src={loc.image}
                alt={loc.name}
                loading={Math.abs(pos) < 0.5 ? "eager" : "lazy"}
                data-testid={`landmark-photo-${loc.id}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}

        {/* Golden-hour tint (warm overlay across the whole flythrough) */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,180,110,0.55) 0%, rgba(255,140,80,0.35) 45%, rgba(120,60,80,0.25) 100%)",
          }}
        />
        {/* Vignette + bottom fade for text readability */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#040914] via-transparent to-transparent" />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 220px rgba(20,10,0,0.65)" }} />

        {/* Drifting birds */}
        <div className="absolute inset-0 pointer-events-none">
          <Bird style={{ position: "absolute", top: "22%", left: `${((progress * 220) % 120) - 10}%`, opacity: 0.75 }} />
          <Bird style={{ position: "absolute", top: "34%", left: `${((progress * 320 + 40) % 120) - 10}%`, opacity: 0.6, transform: "scale(0.7)" }} />
          <Bird style={{ position: "absolute", top: "18%", left: `${((progress * 180 + 80) % 120) - 10}%`, opacity: 0.85, transform: "scale(1.2)" }} />
          <Bird style={{ position: "absolute", top: "42%", left: `${((progress * 260 + 20) % 120) - 10}%`, opacity: 0.5, transform: "scale(0.9)" }} />
        </div>

        {/* Intro hero overlay */}
        <div
          className={`absolute inset-0 flex items-center transition-opacity duration-500 pointer-events-none ${
            introVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="container-x pointer-events-auto">
            <div className="max-w-2xl">
              <div className="eyebrow mb-6" data-testid="hero-eyebrow">
                38+ Years of Education Through Travel
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.02] mb-6">
                Take flight.<br />
                <span className="text-gradient">Land in the classroom.</span>
              </h1>
              <p className="text-lg text-[#F5D9AA] max-w-lg leading-relaxed mb-10">
                Scroll to glide through {stops} landmarks — one continuous aerial journey
                at golden hour, from Lady Liberty to the twin Petronas.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#journey-end"
                  data-testid="hero-explore-btn"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#E29578] text-[#040914] font-semibold hover:brightness-110 transition-all"
                >
                  Take off <ArrowDown size={16} />
                </a>
                <Link
                  to="/packages"
                  data-testid="hero-packages-btn"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/30 text-white hover:bg-white/10 transition-all"
                >
                  View packages <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Active landmark info panel — anchored bottom-left, content changes as camera flies */}
        {activeIdx >= 0 && (() => {
          const activeLoc = locations[activeIdx];
          const ActiveIcon = TIME_ICONS[activeLoc.time_of_day] || Sun;
          // Card fades in near center of segment
          const cardOpacity = Math.max(0, Math.min(1, 1.4 - Math.abs(localFrac - 0.5) * 3));
          return (
            <div
              key={activeLoc.id}
              data-testid={`journey-active-${activeLoc.id}`}
              className="absolute inset-0 flex items-end pb-10 lg:pb-16 pointer-events-none"
              style={{ opacity: cardOpacity, transition: "opacity 150ms linear" }}
            >
              <div className="container-x pointer-events-auto">
                <div className="crystal-glass rounded-3xl p-6 md:p-8 max-w-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-[#E29578]/20 border border-[#E29578]/40 flex items-center justify-center text-[#E29578]">
                      <ActiveIcon size={14} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[#E29578]">
                      Scene {String(activeIdx + 1).padStart(2, "0")} · {activeLoc.time_of_day}
                    </span>
                  </div>
                  <div className="text-xs text-[#F5D9AA] mb-1">{activeLoc.country}</div>
                  <h2 className="text-3xl sm:text-4xl font-light tracking-tighter text-white">
                    {activeLoc.name}
                  </h2>
                  <div className="text-[#E29578] font-['Outfit'] text-base mt-2">{activeLoc.tagline}</div>
                  <p className="text-sm text-white/85 leading-relaxed mt-3">{activeLoc.description}</p>
                  <Link
                    to="/contact"
                    data-testid={`journey-cta-${activeLoc.id}`}
                    className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-[#E29578] text-[#040914] hover:brightness-110 transition-all text-xs font-semibold uppercase tracking-[0.2em]"
                  >
                    Plan this journey <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Outro */}
        <div
          className={`absolute inset-0 flex items-center transition-opacity duration-500 pointer-events-none ${
            outroVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="container-x text-center pointer-events-auto">
            <div className="eyebrow mb-4">You've circled the globe</div>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tighter mb-6">
              Now let's plan <span className="text-gradient">your journey</span>
            </h2>
            <Link
              to="/contact"
              data-testid="journey-end-cta"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#E29578] text-[#040914] font-semibold hover:brightness-110 transition-all"
            >
              Talk to us <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Progress dots */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none z-10">
          {locations.map((l, i) => (
            <div
              key={l.id}
              data-testid={`progress-dot-${l.id}`}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === activeIdx ? "bg-[#E29578] scale-150 shadow-[0_0_10px_#E29578]" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        {introVisible && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 text-xs uppercase tracking-[0.3em] animate-bounce pointer-events-none">
            <span>Scroll to fly</span>
            <div className="w-px h-8 bg-white/40" />
          </div>
        )}
      </div>
      <div id="journey-end" />
    </div>
  );
};
