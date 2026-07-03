import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Globe3DScene } from "./Globe3DScene";

const TIME_ICONS = { sunrise: Sunrise, morning: Sunrise, day: Sun, sunset: Sunset, dusk: Sunset, night: Moon };

/**
 * Full immersive scroll journey:
 * - Sticky Three.js earth stays pinned as user scrolls a tall (700vh) container.
 * - Camera flies from far → into each of the 6 landmark markers.
 * - HTML overlays (title + copy + highlights) crossfade in/out sync with scroll stop.
 * - Header hero (with tagline + CTA) sits inside the intro band (top of the pin).
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
  if (progress >= 0.1 && progress < 0.85) {
    activeIdx = Math.min(stops - 1, Math.floor((progress - 0.1) / seg));
  }
  const introVisible = progress < 0.1;
  const outroVisible = progress >= 0.85;
  const activeLoc = activeIdx >= 0 ? locations[activeIdx] : null;
  const ActiveIcon = activeLoc ? TIME_ICONS[activeLoc.time_of_day] || Sun : Sun;

  return (
    <div
      ref={containerRef}
      data-scene="globe-hero"
      data-testid="globe-journey"
      className="relative"
      style={{ height: `${100 + 100 * (stops + 1)}vh` }}
    >
      {/* PIN */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Globe3DScene locations={locations} />

        {/* Subtle vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#040914]/70" />

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
                Scroll to dive into six landmarks — NASA, Statue of Liberty, Pyramids, Burj Khalifa,
                Marina Bay, Petronas — where 6,000+ students have already been.
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

        {/* Active landmark overlay */}
        {activeLoc && (
          <div
            key={activeLoc.id}
            data-testid={`journey-active-${activeLoc.id}`}
            className="absolute inset-0 flex items-end lg:items-center pointer-events-none"
          >
            <div className="container-x pointer-events-auto grid lg:grid-cols-2 gap-8 items-end pb-16 lg:pb-0">
              <div className="lg:col-start-2">
                <div className="crystal-glass rounded-3xl p-7 md:p-9 max-w-lg ml-auto animate-[fadein_500ms_ease-out]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-[#E29578]/20 border border-[#E29578]/40 flex items-center justify-center text-[#E29578]">
                      <ActiveIcon size={14} />
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-[#E29578]">
                      Scene {String(activeIdx + 1).padStart(2, "0")} · {activeLoc.time_of_day}
                    </span>
                  </div>
                  <div className="text-xs text-[#A0B2C6] mb-1">{activeLoc.country}</div>
                  <h2 className="text-3xl sm:text-4xl font-light tracking-tighter text-white">{activeLoc.name}</h2>
                  <div className="text-[#E29578] font-['Outfit'] text-lg mt-2">{activeLoc.tagline}</div>
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
        )}

        {/* Outro overlay */}
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
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-none">
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
