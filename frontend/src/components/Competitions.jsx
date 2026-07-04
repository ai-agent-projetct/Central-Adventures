import React from "react";
import { Trophy, Globe } from "lucide-react";

const NATIONAL = [
  { title: "Boeing National Aeromodelling Competition", desc: "Prestigious national-level competition in model aircraft design and flight — mentored by our experts." },
  { title: "IISc Bangalore · MathWorks Minidrone Competition", desc: "Design drone algorithms and deploy on real hardware — guided simulation and live rounds." },
  { title: "ISRO · YUVIKA Young Scientist Programme", desc: "Two-week residential programme at ISRO for school students — preparation and registration support." },
  { title: "NIDAR — India's Largest Drone Challenge", desc: "India's biggest drone innovation challenge — end-to-end mentorship for participating teams." },
];

export const Competitions = () => {
  return (
    <section className="section" data-testid="competitions-section">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <div className="eyebrow mb-4">Competitions &amp; Events</div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
            Aerospace &amp; drone <span className="text-gradient">competitions</span>
          </h2>
          <p className="text-[#A0B2C6] mt-4">
            We mentor and facilitate participation in national and international competitions covering UAV
            design, autonomous navigation, and precision flight.
          </p>
        </div>

        {/* International highlight */}
        <div className="crystal-glass rounded-3xl p-8 md:p-10 mb-6 flex flex-col md:flex-row md:items-center gap-6" data-testid="competition-ioaa">
          <div className="w-14 h-14 rounded-2xl bg-[#E29578]/15 border border-[#E29578]/40 flex items-center justify-center text-[#E29578] shrink-0">
            <Globe size={26} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#E29578] mb-2">International</div>
            <h3 className="font-['Outfit'] text-2xl text-white">IOAA 2025 — Mumbai</h3>
            <p className="text-sm text-[#A0B2C6] mt-2 leading-relaxed">
              International Olympiad on Astronomy &amp; Astrophysics — 300 students, 60+ countries, August 2025.
            </p>
          </div>
        </div>

        {/* National competitions */}
        <div className="grid sm:grid-cols-2 gap-5">
          {NATIONAL.map((c) => (
            <div key={c.title} data-testid={`competition-${c.title.toLowerCase().replace(/[^\w]/g, "-").slice(0, 24)}`} className="crystal-glass rounded-2xl p-6 card-hover">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578]">
                  <Trophy size={14} />
                </span>
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#E29578]">National</span>
              </div>
              <h3 className="font-['Outfit'] text-lg text-white leading-snug">{c.title}</h3>
              <p className="text-sm text-[#A0B2C6] mt-2 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
