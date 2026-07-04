import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Globe3DScene } from "./Globe3DScene";
import { getJourneyVideo } from "../lib/api";

const TIME_ICONS = { sunrise: Sunrise, morning: Sunrise, day: Sun, sunset: Sunset, dusk: Sunset, night: Moon };

/**
 * Two-phase scroll journey:
 *  Phase 1 (intro):  3D Earth in space (existing Three.js scene).
 *  Phase 2 (video):  Scroll-driven aerial flythrough video — video.currentTime
 *                    is eased toward a target bound to scroll progress, so the
 *                    user scrubs through the drone reel with the wheel.
 *  Phase 3 (outro):  Final CTA overlay.
 *
 * Performance: ALL per-frame work (reading scroll, moving the video, deciding
 * which scene is active) happens inside a SINGLE requestAnimationFrame loop and
 * reads/writes refs. React state is only updated when a *discrete* thing changes
 * (the phase, or the active scene index) — never once per frame — so the
 * component does not re-render 60×/second, which is what caused the stutter.
 */
export const GlobeJourney = ({ locations = [] }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(0);
  const progressRef = useRef(0);

  const [videoInfo, setVideoInfo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  // Discrete UI state — changes rarely, so re-renders are rare.
  const [phase, setPhase] = useState("intro"); // "intro" | "video" | "outro"
  const [started, setStarted] = useState(false); // has the user begun scrolling?
  const [activeIdx, setActiveIdx] = useState(-1); // which landmark scene is showing

  // Fetch the flythrough video URL
  useEffect(() => {
    getJourneyVideo().then(setVideoInfo).catch(() => {});
  }, []);

  // Force video load once info is present.
  useEffect(() => {
    if (!videoInfo || !videoRef.current) return;
    const v = videoRef.current;
    try { v.load(); } catch (e) {}
  }, [videoInfo]);

  // Track scroll into a ref only — NO setState here, so scrolling never triggers
  // a React re-render on its own.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const height = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), height);
      progressRef.current = height > 0 ? scrolled / height : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Single rAF loop. Runs once the video element exists. Reads progressRef,
  // eases video.currentTime toward the scroll target, and pushes state ONLY on
  // change. Keeps a couple of local "last" values to avoid redundant setState.
  useEffect(() => {
    if (!videoRef.current) return;
    let running = true;
    let lastPhase = phase;
    let lastActive = activeIdx;
    let lastStarted = started;

    const step = () => {
      if (!running) return;
      const p = progressRef.current;
      const video = videoRef.current;

      // --- Ease the video toward the scroll-driven target time ---
      if (video) {
        const dur = video.duration || videoInfo?.duration || 20;
        if (dur && !isNaN(dur)) {
          const vp = Math.min(1, Math.max(0, (p - 0.04) / (0.98 - 0.04)));
          const target = vp * dur;
          const cur = video.currentTime;
          const diff = target - cur;
          const absDiff = Math.abs(diff);
          if (absDiff > 0.02 && video.readyState >= 2) {
            const factor = absDiff > 1.5 ? 0.28 : absDiff > 0.4 ? 0.35 : 0.55;
            try { video.currentTime = cur + diff * factor; } catch (e) {}
          }
        }
      }

      // --- Phase (discrete) ---
      const nextPhase = p < 0.06 ? "intro" : p >= 0.98 ? "outro" : "video";
      if (nextPhase !== lastPhase) { lastPhase = nextPhase; setPhase(nextPhase); }

      const nextStarted = p > 0.02;
      if (nextStarted !== lastStarted) { lastStarted = nextStarted; setStarted(nextStarted); }

      // --- Active landmark (discrete) — derived from the eased video time ---
      let idx = -1;
      if (nextPhase !== "outro" && video) {
        const t = video.currentTime;
        for (let i = 0; i < locations.length; i++) {
          const l = locations[i];
          if (l.video_start != null && t >= l.video_start && t < l.video_end) { idx = i; break; }
        }
      }
      if (idx !== lastActive) { lastActive = idx; setActiveIdx(idx); }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoInfo, locations]);

  // ==== Derived render flags (from discrete state — cheap) ====
  const introVisible = phase === "intro";
  const videoVisible = phase === "video";
  const outroVisible = phase === "outro";

  const activeLoc = activeIdx >= 0 ? locations[activeIdx] : null;
  const ActiveIcon = activeLoc ? (TIME_ICONS[activeLoc.time_of_day] || Sun) : Sun;

  // Container height: ~120vh of scroll per video-second gives room for smooth
  // scrubbing, plus an intro and outro screen.
  const containerVh = 100 + Math.round((videoInfo?.duration || 20) * 120) + 100;

  return (
    <div
      ref={containerRef}
      data-scene="globe-hero"
      data-testid="globe-journey"
      className="relative"
      style={{ height: `${containerVh}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#040914]">
        {/* Phase 1 — 3D Earth intro (stays until video is loaded to avoid black screen) */}
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: introVisible || !videoReady ? 1 : 0,
            pointerEvents: introVisible ? "auto" : "none",
          }}
        >
          <Globe3DScene locations={locations} />
        </div>

        {/* Phase 2 — Scroll-driven flythrough video (always mounted so it can buffer even during intro) */}
        {videoInfo && (
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: videoReady && videoVisible ? 1 : 0, willChange: "opacity" }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              data-testid="journey-video"
              className="w-full h-full object-cover"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
              onLoadedMetadata={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onLoadedData={() => setVideoReady(true)}
              onError={(e) => console.log("video error:", e.target.error)}
            >
              {(videoInfo.sources || [{ type: "video/mp4", src: videoInfo.url }]).map((s) => (
                <source key={s.src} src={s.src.startsWith("http") ? s.src : `${process.env.REACT_APP_BACKEND_URL}${s.src}`} type={s.type} />
              ))}
            </video>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#040914]/70 via-transparent to-transparent" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#040914] via-transparent to-transparent" />
          </div>
        )}

        {/* Loading indicator while video buffers (after intro, before ready) */}
        {!videoReady && started && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full crystal-glass text-xs text-white/80 uppercase tracking-[0.25em] pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#E29578] animate-pulse" /> Buffering flythrough…
          </div>
        )}

        {/* Hero overlay (visible during Phase 1) */}
        <div
          className={`absolute inset-0 flex items-center pointer-events-none transition-opacity duration-500 ${
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
                <span className="text-gradient">Then fly the journey.</span>
              </h1>
              <p className="text-lg text-[#A0B2C6] max-w-lg leading-relaxed mb-10">
                Scroll to lift off from Earth and glide through {locations.length} landmarks —
                Statue of Liberty, Washington D.C., Pyramids, NASA, Singapore, Petronas and Burj Khalifa.
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

        {/* Active landmark card (Phase 2) — cross-fades on scene change via CSS. */}
        <div
          className="absolute inset-0 flex items-end pb-10 lg:pb-16 pointer-events-none transition-opacity duration-300"
          style={{ opacity: activeLoc && videoVisible ? 1 : 0, willChange: "opacity" }}
        >
          {activeLoc && (
            <div className="container-x pointer-events-auto" key={activeLoc.id} data-testid={`journey-active-${activeLoc.id}`}>
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
          )}
        </div>

        {/* Outro CTA */}
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
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A0B2C6] text-xs uppercase tracking-[0.3em] animate-bounce pointer-events-none">
            <span>Scroll to fly</span>
            <div className="w-px h-8 bg-white/30" />
          </div>
        )}
      </div>
      <div id="journey-end" />
    </div>
  );
};
