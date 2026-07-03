import React, { useEffect, useRef } from "react";

/* Scroll-driven animated hero:
   - Particle globe rotates continuously
   - Camera zooms in on the sphere as the user scrolls (perspective decreases → orbit tightens)
   - Second orbiting ring of stars for depth */
export const HeroCanvas = () => {
  const canvasRef = useRef(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0, h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onScroll = () => {
      const vh = window.innerHeight;
      scrollRef.current = Math.min(1.4, Math.max(0, window.scrollY / vh));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Sphere particles (fibonacci)
    const N = 320;
    const baseR = 220;
    const particles = [];
    for (let i = 0; i < N; i++) {
      const phi = Math.acos(2 * (i / N) - 1);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      particles.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      });
    }
    // Outer ring
    const ringN = 90;
    const ring = Array.from({ length: ringN }, (_, i) => {
      const a = (i / ringN) * Math.PI * 2;
      return { a };
    });

    let rot = 0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const s = scrollRef.current;
      // Cinematic pin: globe moves + scales with scroll (zoom-in feel)
      const cx = w * 0.72 - s * w * 0.15;
      const cy = h * 0.5 + s * 60;
      const R = baseR * (1 + s * 0.5); // grows with scroll
      rot += 0.003 + s * 0.008;

      const sinR = Math.sin(rot), cosR = Math.cos(rot);
      const tiltSin = Math.sin(0.35), tiltCos = Math.cos(0.35);

      // Outer ring first (depth)
      for (let i = 0; i < ringN; i++) {
        const p = ring[i];
        const a = p.a + rot * 0.6;
        const rx = Math.cos(a) * R * 1.35;
        const rz = Math.sin(a) * R * 1.35;
        const y = tiltSin * rz;
        const z = tiltCos * rz;
        const perspective = 500 / (500 + z);
        const px = cx + rx * perspective;
        const py = cy + y * perspective;
        const alpha = 0.7 * ((z / R + 1) / 2);
        ctx.beginPath();
        ctx.fillStyle = `rgba(226, 149, 120, ${alpha.toFixed(3)})`;
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Globe particles
      for (let i = 0; i < N; i++) {
        const p = particles[i];
        const x = (p.x * cosR - p.z * sinR) * R;
        const z = (p.x * sinR + p.z * cosR) * R;
        const y = p.y * R;
        const perspective = 500 / (500 + z);
        const px = cx + x * perspective;
        const py = cy + y * perspective;
        const size = Math.max(1.0, 2.8 * perspective + s * 1.5);
        const depth = (z + R) / (2 * R);
        const alpha = 0.55 + 0.45 * depth;
        const hue = 20 + depth * 55 + s * 30;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue}, 90%, 75%, ${alpha})`;
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" data-testid="hero-canvas">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute right-[10%] top-[25%] w-72 h-72 rounded-full bg-gradient-to-br from-[#E29578]/30 to-transparent blur-3xl" />
      <div className="absolute left-[8%] bottom-[10%] w-80 h-80 rounded-full bg-gradient-to-tr from-[#7EC8E3]/25 to-transparent blur-3xl" />
    </div>
  );
};
