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

        {/* 3D Landmark scenes — each is a perspective card that lifts, floats & recedes */}
        {locations.map((loc, i) => {
          const isActive = i === activeIdx;
          const relative = isActive ? localFrac : (i < activeIdx ? 1 : 0);

          // 3D transforms driven by localFrac (0→1 across the segment)
          // Enter: rotateX 30 → 0, translateZ -600 → 0, scale 0.75 → 1
          // Ken Burns while at center (0.35 - 0.65): scale 1.02 → 1.08, slight X drift
          // Exit: rotateX 0 → -25, translateZ 0 → -400, scale 1 → 0.85
          let rotX = 0, tz = 0, scale = 1, tx = 0;
          if (isActive) {
            if (localFrac < 0.35) {
              const t = localFrac / 0.35;
              rotX = 30 * (1 - t);
              tz = -600 * (1 - t);
              scale = 0.75 + 0.25 * t;
            } else if (localFrac < 0.65) {
              const t = (localFrac - 0.35) / 0.3;
              rotX = 0;
              tz = 0;
              scale = 1.0 + t * 0.06;
              tx = (t - 0.5) * 30; // subtle horizontal drift
            } else {
              const t = (localFrac - 0.65) / 0.35;
              rotX = -25 * t;
              tz = -400 * t;
              scale = 1.06 - 0.21 * t;
            }
          } else if (i < activeIdx) {
            rotX = -25; tz = -600; scale = 0.85;
          } else {
            rotX = 30; tz = -600; scale = 0.75;
          }

          const opacity = isActive ? bell : 0;

          return (
            <div
              key={loc.id}
              aria-hidden={!isActive}
              className="absolute inset-0 pointer-events-none"
              style={{
                opacity,
                transform: `translate3d(${tx}px, 0, ${tz}px) rotateX(${rotX}deg) scale(${scale})`,
                transformStyle: "preserve-3d",
                transition: "opacity 400ms ease-out",
                willChange: "transform, opacity",
              }}
            >
              {/* Photo (full-bleed) */}
              <div className="absolute inset-0">
                <img
                  src={loc.image}
                  alt={loc.name}
                  loading={isActive ? "eager" : "lazy"}
                  data-testid={`landmark-photo-${loc.id}`}
                  className="w-full h-full object-cover"
                />
                {/* Cinematic gradients: darker left for text, subtle bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#040914]/95 via-[#040914]/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040914] via-transparent to-[#040914]/50" />
                {/* 3D "glass edge" glow around the frame */}
                <div className="absolute inset-0 ring-1 ring-white/10 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] pointer-events-none" />
              </div>
            </div>
          );
        })}

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
