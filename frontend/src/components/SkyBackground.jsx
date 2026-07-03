import React, { useEffect, useRef, useState } from "react";

/* Sky palette per time-of-day. Blended based on scroll progress across
   the full journey. Also drives the sun/moon orb color+position and star opacity. */
const PHASES = [
  { name: "dawn",    from: "#1B2951", to: "#E29578", orb: "#F5D9AA", orbTop: "60vh", orbRight: "10vw", stars: 0.3 },
  { name: "sunrise", from: "#FF7A00", to: "#F5D9AA", orb: "#FFD08A", orbTop: "35vh", orbRight: "-5vw", stars: 0.1 },
  { name: "day",     from: "#4CA1AF", to: "#F5D9AA", orb: "#FFF7C2", orbTop: "10vh", orbRight: "-10vw", stars: 0 },
  { name: "sunset",  from: "#7A3B69", to: "#E29578", orb: "#FF7A00", orbTop: "45vh", orbRight: "-8vw", stars: 0.15 },
  { name: "dusk",    from: "#1B2951", to: "#7A3B69", orb: "#B26AA6", orbTop: "70vh", orbRight: "5vw", stars: 0.55 },
  { name: "night",   from: "#040914", to: "#0A0F16", orb: "#7EC8E3", orbTop: "80vh", orbRight: "15vw", stars: 1 },
];

export const SkyBackground = () => {
  const bgRef = useRef(null);
  const orbRef = useRef(null);
  const starsRef = useRef(null);
  const [phase, setPhase] = useState(PHASES[0]);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      const idx = Math.min(PHASES.length - 1, Math.floor(p * PHASES.length));
      const ph = PHASES[idx];
      if (bgRef.current) {
        bgRef.current.style.background = `linear-gradient(180deg, ${ph.from} 0%, ${ph.to} 100%)`;
      }
      if (orbRef.current) {
        orbRef.current.style.background = `radial-gradient(circle, ${ph.orb} 0%, ${ph.orb}00 70%)`;
        orbRef.current.style.top = ph.orbTop;
        orbRef.current.style.right = ph.orbRight;
      }
      if (starsRef.current) {
        starsRef.current.style.opacity = String(ph.stars);
      }
      setPhase(ph);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div ref={bgRef} className="sky-canvas" data-testid="sky-canvas" data-phase={phase.name} />
      <div ref={starsRef} className="stars" />
      <div ref={orbRef} className="orb" />
      <div className="grain-overlay" />
    </>
  );
};
