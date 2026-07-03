import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Globe3DScene } from "./Globe3DScene";

const TIME_ICONS = { sunrise: Sunrise, morning: Sunrise, day: Sun, sunset: Sunset, dusk: Sunset, night: Moon };

/**
 * Cinematic scroll journey with 3D depth-of-field.
 * Each landmark photo:
 *   • enters from below with rotateX + scale (like a card lifting off a table),
 *   • Ken-Burns pans while active (subtle zoom + drift),
 *   • exits by rotating away and receding into the distance.
 * Combined with the sticky Three.js earth in the background, the effect reads
 * as "diving into a 3D location" every ~viewport of scroll.
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
  const seg = 0.75 / Math.max(1, stops);
  let activeIdx = -1;
  let localFrac = 0;
  if (progress >= 0.1 && progress < 0.85) {
    const local = (progress - 0.1) / 0.75;
    const idxF = local / seg;
    activeIdx = Math.min(stops - 1, Math.floor(idxF));
    localFrac = idxF - activeIdx;
  }
  const introVisible = progress < 0.1;
  const outroVisible = progress >= 0.85;

  // Bell curve: image is transparent at edges of segment, full at middle
  const bell = Math.max(0, Math.sin(localFrac * Math.PI));

  return (
    <div
      ref={containerRef}
      data-scene="globe-hero"
      data-testid="globe-journey"
      className="relative"
      style={{ height: `${100 + 100 * (stops + 1)}vh` }}
    >
      {/* Sticky pin */}
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ perspective: "1400px" }}>
        {/* Globe layer — dims when landmark photo is prominent */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: activeIdx >= 0 ? 0.25 + (1 - bell) * 0.5 : 1 }}
        >
          <Globe3DScene locations={locations} />
        </div>

        {/* 3D Landmark scenes — dive-in effect: image starts far & tiny,
            scales forward past the viewer, next scene rises from horizon.
            Matches the Instagram-reel "fly through cities" cadence. */}
        {locations.map((loc, i) => {
          const isActive = i === activeIdx;

          // Compute per-scene scale/opacity from localFrac (0 → 1)
          // Enter (0-0.4): scale 0.15 → 1.0, opacity 0 → 1
          // Peak  (0.4-0.6): full-bleed, subtle Ken Burns 1.0 → 1.12
          // Exit (0.6-1.0): scale 1.12 → 3.5, opacity 1 → 0 (fly through)
          let scale = 0.15, opacity = 0, tz = -800, blur = 0;
          if (isActive) {
            if (localFrac < 0.4) {
              const t = localFrac / 0.4;
              const eased = t * t; // ease-in for acceleration
              scale = 0.15 + 0.85 * eased;
              tz = -800 + 800 * eased;
              opacity = Math.min(1, t * 1.6);
              blur = (1 - t) * 6;
            } else if (localFrac < 0.6) {
              const t = (localFrac - 0.4) / 0.2;
              scale = 1.0 + 0.12 * t;
              tz = 0;
              opacity = 1;
              blur = 0;
            } else {
              const t = (localFrac - 0.6) / 0.4;
              const eased = 1 - Math.pow(1 - t, 2); // ease-out
              scale = 1.12 + 2.38 * eased;
              tz = 0 + 200 * eased;
              opacity = Math.max(0, 1 - eased * 1.6);
              blur = eased * 10;
            }
          }

          return (
            <div
              key={loc.id}
              aria-hidden={!isActive}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{
                opacity,
                transform: `translateZ(${tz}px) scale(${scale})`,
                transformStyle: "preserve-3d",
                filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : "none",
                willChange: "transform, opacity, filter",
              }}
            >
              <div className="absolute inset-0">
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading={isActive ? "eager" : "lazy"}
                  data-testid={`landmark-photo-${loc.id}`}
                  className="w-full h-full object-cover"
                />
                {/* Text side gradient (darker at bottom for card readability) */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#040914]/95 via-[#040914]/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-transparent to-[#040914]/40" />
              </div>
            </div>
          );
        })}

        {/* Motion-streak overlay — kicks in during transition (localFrac near 0 or 1) */}
        {activeIdx >= 0 && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              opacity: Math.max(0, 1 - Math.sin(localFrac * Math.PI) * 1.4),
              background:
                "radial-gradient(ellipse at center, rgba(226,149,120,0.25) 0%, transparent 45%), repeating-linear-gradient(90deg, transparent 0 6px, rgba(255,255,255,0.05) 6px 7px)",
            }}
          />
        )}

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#040914]/60" />

        {/* Intro overlay (hero header) */}
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
                Spin the world.<br />
                <span className="text-gradient">Fly to the classroom.</span>
              </h1>
              <p className="text-lg text-[#A0B2C6] max-w-lg leading-relaxed mb-10">
                Scroll to dive into {stops} landmarks — from Lady Liberty to the twin Petronas — where
                6,000+ students have already been.
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
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  View packages <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Active landmark info panel */}
        {activeIdx >= 0 && (() => {
          const activeLoc = locations[activeIdx];
          const ActiveIcon = TIME_ICONS[activeLoc.time_of_day] || Sun;
          return (
            <div
              key={activeLoc.id}
              data-testid={`journey-active-${activeLoc.id}`}
              className="absolute inset-0 flex items-end lg:items-center pointer-events-none"
              style={{
                opacity: Math.max(0, Math.min(1, bell * 1.5)),
                transform: `translateY(${(1 - bell) * 30}px)`,
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
              }}
            >
              <div className="container-x pointer-events-auto grid lg:grid-cols-12 gap-8 items-end lg:items-center pb-16 lg:pb-0">
                <div className="lg:col-start-7 lg:col-span-6">
                  <div className="crystal-glass rounded-3xl p-7 md:p-10 max-w-xl ml-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-8 h-8 rounded-full bg-[#E29578]/20 border border-[#E29578]/40 flex items-center justify-center text-[#E29578]">
                        <ActiveIcon size={14} />
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.28em] text-[#E29578]">
                        Scene {String(activeIdx + 1).padStart(2, "0")} · {activeLoc.time_of_day}
                      </span>
                    </div>
                    <div className="text-xs text-[#A0B2C6] mb-1">{activeLoc.country}</div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tighter text-white">
                      {activeLoc.name}
                    </h2>
                    <div className="text-[#E29578] font-['Outfit'] text-lg mt-3">{activeLoc.tagline}</div>
                    <p className="text-sm text-[#A0B2C6] leading-relaxed mt-4">{activeLoc.description}</p>
                    <ul className="grid grid-cols-2 gap-2 mt-5">
                      {activeLoc.highlights?.slice(0, 4).map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-white/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E29578]" /> {h}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/contact"
                      data-testid={`journey-cta-${activeLoc.id}`}
                      className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-[#E29578] hover:text-[#040914] hover:border-transparent transition-all text-xs font-semibold text-white uppercase tracking-[0.2em]"
                    >
                      Plan this journey <ArrowRight size={14} />
                    </Link>
                  </div>
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
                i === activeIdx ? "bg-[#E29578] scale-150 shadow-[0_0_10px_#E29578]" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        {introVisible && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A0B2C6] text-xs uppercase tracking-[0.3em] animate-bounce pointer-events-none">
            <span>Scroll</span>
            <div className="w-px h-8 bg-white/30" />
          </div>
        )}
      </div>
      <div id="journey-end" />
    </div>
  );
};
