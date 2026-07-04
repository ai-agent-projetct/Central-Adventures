import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Users, Globe2, Award } from "lucide-react";
import { GlobeJourney } from "../components/GlobeJourney";
import { GalleryPreview } from "../components/GalleryPreview";
import { BrochuresSection } from "../components/BrochuresSection";
import { Competitions } from "../components/Competitions";
import { WhyCentralGroup } from "../components/WhyCentralGroup";
import { getGlobal, getDomestic, getPrograms } from "../lib/api";

const STATS = [
  { icon: Award, num: "38+", label: "Years Experience" },
  { icon: Users, num: "6,000+", label: "Students at NASA" },
  { icon: Star, num: "600+", label: "Schools since 1987" },
  { icon: Globe2, num: "Global", label: "Destinations" },
];

export default function Home() {
  const [global, setGlobal] = useState([]);
  const [domestic, setDomestic] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    getGlobal().then(setGlobal).catch(() => {});
    getDomestic().then(setDomestic).catch(() => {});
    getPrograms().then(setPrograms).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* IMMERSIVE 3D GLOBE JOURNEY (hero + scroll fly-through) */}
      {global.length > 0 && <GlobeJourney locations={global} />}

      {/* STATS */}
      <section className="section pt-24" data-testid="stats-section">
        <div className="container-x">
          <div className="mb-12 max-w-2xl">
            <div className="eyebrow mb-4">By the numbers</div>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
              Nearly four decades of <span className="text-gradient">education through travel</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ icon: Icon, num, label }) => (
              <div
                key={label}
                data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}
                className="crystal-glass rounded-2xl p-6 card-hover"
              >
                <Icon size={20} className="text-[#E29578] mb-3" />
                <div className="font-['Outfit'] text-3xl text-white">{num}</div>
                <div className="text-xs text-[#A0B2C6] mt-1 tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOMESTIC BENTO */}
      <section className="section" data-testid="domestic-section">
        <div className="container-x">
          <div className="mb-14 max-w-2xl">
            <div className="eyebrow mb-4">Closer to home</div>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
              Indian journeys with a <span className="text-gradient">soul</span>
            </h2>
            <p className="text-[#A0B2C6] mt-4">From the Himalayas to Kanyakumari — every destination is a classroom.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {domestic.map((d, i) => (
              <div
                key={d.id}
                data-testid={`domestic-${d.id}`}
                className={`crystal-glass rounded-2xl overflow-hidden group card-hover ${
                  i % 5 === 0 ? "md:row-span-2 md:col-span-2 aspect-square md:aspect-auto" : "aspect-square"
                }`}
              >
                <div className="relative w-full h-full min-h-[220px]">
                  <img src={d.image} alt={d.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <div className="font-['Outfit'] text-xl text-white">{d.name}</div>
                    <div className="text-xs text-[#A0B2C6] mt-1">{d.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINING PROGRAMS */}
      <section className="section" data-testid="training-section">
        <div className="container-x">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="eyebrow mb-4">Central Knowledge Experience</div>
              <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
                Hands-on <span className="text-gradient">aerospace</span> training,<br />delivered to your school
              </h2>
            </div>
            <Link to="/contact" className="text-sm text-[#E29578] hover:text-white flex items-center gap-2">
              Book a program <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((p) => (
              <div key={p.id} data-testid={`program-${p.id}`} className="crystal-glass rounded-2xl p-6 card-hover">
                <div className="w-11 h-11 rounded-xl bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578] font-['Outfit'] text-lg">
                  {p.title[0]}
                </div>
                <h3 className="font-['Outfit'] text-xl mt-4 text-white">{p.title}</h3>
                <p className="text-sm text-[#A0B2C6] mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETITIONS & EVENTS */}
      <Competitions />

      {/* WHY CENTRAL GROUP */}
      <WhyCentralGroup />

      {/* GALLERY PREVIEW */}
      <GalleryPreview />

      {/* BROCHURES */}
      <BrochuresSection />

      {/* CTA */}
      <section className="section" data-testid="home-cta">
        <div className="container-x">
          <div className="crystal-glass rounded-3xl p-10 md:p-16 text-center">
            <div className="eyebrow mb-4">Ready to travel, learn, explore?</div>
            <h2 className="text-3xl sm:text-5xl font-light tracking-tighter mb-4">
              Let's plan your next <span className="text-gradient">adventure</span>
            </h2>
            <p className="text-[#A0B2C6] max-w-xl mx-auto mb-8">Talk to our team — from NASA tours to Himalayan camps, we build it for your school.</p>
            <Link to="/contact" data-testid="home-cta-btn" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E29578] text-[#040914] font-semibold hover:brightness-110 transition-all">
              Start Planning <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
