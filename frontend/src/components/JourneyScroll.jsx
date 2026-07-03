import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, Sunrise, Sun, Sunset, Moon } from "lucide-react";

const TIME_ICONS = { sunrise: Sunrise, morning: Sunrise, day: Sun, sunset: Sunset, dusk: Sunset, night: Moon };

const DestinationScene = ({ dest, index }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const Icon = TIME_ICONS[dest.time_of_day] || Sun;
  const isEven = index % 2 === 0;

  return (
    <section
      ref={ref}
      data-testid={`journey-scene-${dest.id}`}
      className="min-h-[95vh] flex items-center py-24"
    >
      <div className="container-x grid lg:grid-cols-12 gap-10 items-center">
        <div className={`lg:col-span-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
          <div
            className={`relative rounded-3xl overflow-hidden aspect-[4/5] border border-white/10 shadow-2xl landmark-img ${
              visible ? "opacity-100 translate-y-0" : "opacity-40 translate-y-10"
            }`}
            style={{ transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)" }}
          >
            <img
              src={dest.image}
              alt={dest.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full crystal-glass text-xs uppercase tracking-[0.25em] text-white">
              <Icon size={14} className="text-[#E29578]" /> {dest.time_of_day}
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="eyebrow mb-2">{dest.country}</div>
              <div className="font-['Outfit'] text-3xl text-white font-light">{dest.name}</div>
            </div>
          </div>
        </div>

        <div className={`lg:col-span-6 space-y-6 ${isEven ? "lg:order-2 lg:pl-8" : "lg:order-1 lg:pr-8"}`}>
          <div className="eyebrow">Scene {String(index + 1).padStart(2, "0")} • {dest.time_of_day}</div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tighter leading-[1.05]">
            <span className="text-gradient">{dest.tagline}</span>
          </h2>
          <p className="text-base text-[#A0B2C6] leading-relaxed max-w-lg">{dest.description}</p>
          <ul className="grid grid-cols-2 gap-3 max-w-md">
            {dest.highlights?.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-white/90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E29578]" /> {h}
              </li>
            ))}
          </ul>
          <a
            href="/contact"
            data-testid={`journey-cta-${dest.id}`}
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-[#E29578] hover:text-[#040914] hover:border-transparent transition-all text-sm font-semibold text-white"
          >
            Plan this journey <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export const JourneyScroll = ({ destinations }) => {
  return (
    <div data-testid="journey-scroll" className="relative">
      <div className="container-x pt-24 pb-6 text-center">
        <div className="eyebrow mb-4">The Journey</div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tighter">
          From <span className="text-gradient">sunrise</span> at NASA<br />
          to <span className="text-gradient">midnight</span> in Kuala Lumpur
        </h2>
        <p className="mt-6 text-[#A0B2C6] max-w-xl mx-auto">
          Scroll through the day. Each destination unfolds in its own hour of light.
        </p>
      </div>
      {destinations.map((d, i) => (
        <DestinationScene key={d.id} dest={d} index={i} />
      ))}
    </div>
  );
};
