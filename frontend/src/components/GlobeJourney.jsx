import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { Globe3DScene } from "./Globe3DScene";
import { getJourneyVideo } from "../lib/api";

const TIME_ICONS = { sunrise: Sunrise, morning: Sunrise, day: Sun, sunset: Sunset, dusk: Sunset, night: Moon };

/**
 * Two-phase scroll journey:
 *  Phase 1 (0 → 0.15 progress): 3D Earth in space (existing Three.js scene).
 *  Phase 2 (0.15 → 0.92 progress): Scroll-driven aerial flythrough video —
 *      video.currentTime is bound linearly to scroll progress, so the user
 *      scrubs through the ~35s AI-generated drone reel with mouse-wheel.
 *  Phase 3 (0.92 → 1.0): Final CTA overlay.
 *
 * Info card overlays fade in when the current video time is inside a scene's
 * [video_start, video_end] window.
 */
export const GlobeJourney = ({ locations = [] }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const rafRef = useRef(0);
  const targetTimeRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

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

  // Track scroll & drive video currentTime. Always compute target — no state gates —
  // so the video catches up as soon as it becomes ready.
  const progressRef = useRef(0);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const height = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), height);
      const p = height > 0 ? scrolled / height : 0;
      progressRef.current = p;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // rAF loop — always running once video element exists. Reads progressRef,
  // computes target, and moves video.currentTime toward it. Gates internally
  // on videoReady so it's fully robust to load-order races.
  useEffect(() => {
    if (!videoRef.current) return;
    let running = true;
    const step = () => {
      if (!running) return;
      const video = videoRef.current;
      const dur = video && (video.duration || videoInfo?.duration || 20);
      if (video && dur && !isNaN(dur)) {
        const p = progressRef.current;
        // Map scroll 0.04 → 0.98 to video 0 → duration
        const vp = Math.min(1, Math.max(0, (p - 0.04) / (0.98 - 0.04)));
        const target = vp * dur;
        const cur = video.currentTime;
        const diff = target - cur;
        const absDiff = Math.abs(diff);
        if (absDiff > 0.02 && video.readyState >= 2) {
          const factor = absDiff > 1.5 ? 0.28 : absDiff > 0.4 ? 0.35 : 0.55;
          try {
            video.currentTime = cur + diff * factor;
          } catch (e) {}
        }
        setCurrentTime(video.currentTime);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [videoInfo]);

  // ==== Derived UI state ====
  const introVisible = progress < 0.06;
  const videoVisible = progress >= 0.04 && progress < 0.99;
  const outroVisible = progress >= 0.98;

  // Which landmark is the video currently at?
  let activeLoc = null;
  let activeIdx = -1;
  if (!outroVisible) {
    for (let i = 0; i < locations.length; i++) {
      const l = locations[i];
      if (l.video_start != null && currentTime >= l.video_start && currentTime < l.video_end) {
        activeLoc = l;
        activeIdx = i;
        break;
      }
    }
  }
  // Fade card in/out at scene boundaries (last 0.6s of each 5s scene)
  const inScene = activeLoc ? (currentTime - activeLoc.video_start) : 0;
  const sceneLen = activeLoc ? (activeLoc.video_end - activeLoc.video_start) : 0;
  const cardOpacity = activeLoc
    ? Math.max(0, Math.min(1, Math.min(inScene, sceneLen - inScene) / 0.6))
    : 0;

  const ActiveIcon = activeLoc ? (TIME_ICONS[activeLoc.time_of_day] || Sun) : Sun;

  // Container: slightly longer per video-second gives smoother scrubbing feel.
  // 20s video × 120vh per second + intro/outro = 2600vh total.
  const containerVh = 100 /* intro */ + Math.round((videoInfo?.duration || 20) * 120) + 100 /* outro */;

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
            style={{ opacity: videoReady && videoVisible ? 1 : 0 }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              data-testid="journey-video"
              className="w-full h-full object-cover"
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
        {!videoReady && progress > 0.02 && (
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

        {/* Active landmark card (Phase 2) */}
        {activeLoc && (
          <div
            key={activeLoc.id}
            data-testid={`journey-active-${activeLoc.id}`}
            className="absolute inset-0 flex items-end pb-10 lg:pb-16 pointer-events-none"
            style={{ opacity: cardOpacity, transition: "opacity 200ms ease-out" }}
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
        )}

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
