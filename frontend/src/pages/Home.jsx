import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, Star, Users, Globe2, Award } from "lucide-react";
import { HeroCanvas } from "../components/HeroCanvas";
import { JourneyScroll } from "../components/JourneyScroll";
import { GalleryPreview } from "../components/GalleryPreview";
import { BrochuresSection } from "../components/BrochuresSection";
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
  const heroContentRef = useRef(null);

  useEffect(() => {
    getGlobal().then(setGlobal).catch(() => {});
    getDomestic().then(setDomestic).catch(() => {});
    getPrograms().then(setPrograms).catch(() => {});
  }, []);

  // Scroll-driven pin: fade + scale hero content as user scrolls past.
  useEffect(() => {
    const onScroll = () => {
      const el = heroContentRef.current;
      if (!el) return;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, y / (vh * 0.9)));
      el.style.opacity = String(1 - p);
      el.style.transform = `translateY(${p * -40}px) scale(${1 - p * 0.06})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden" data-testid="hero-section">
        <HeroCanvas />
        <div ref={heroContentRef} className="container-x relative z-10 pt-32 pb-16 will-change-transform">
          <div className="max-w-3xl">
            <div className="eyebrow mb-6" data-testid="hero-eyebrow">
              38+ Years of Education Through Travel
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.02] mb-6">
              Where <em className="text-gradient not-italic font-normal">Education</em> meets<br />
              Adventure &amp; <em className="text-gradient not-italic font-normal">Exploration</em>
            </h1>
            <p className="text-lg text-[#A0B2C6] max-w-xl leading-relaxed mb-10">
              Central Group brings together world-class educational tours and hands-on aerospace training —
              inspiring the next generation of scientists, engineers, and explorers.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#journey"
                data-testid="hero-explore-btn"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#E29578] text-[#040914] font-semibold hover:brightness-110 transition-all"
              >
                Explore the Journey <ArrowDown size={16} />
              </a>
              <Link
                to="/packages"
                data-testid="hero-packages-btn"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all"
              >
                View Packages <ArrowRight size={16} />
              </Link>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl">
              {STATS.map(({ icon: Icon, num, label }) => (
                <div key={label} className="crystal-glass rounded-2xl p-5" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
                  <Icon size={18} className="text-[#E29578] mb-2" />
                  <div className="font-['Outfit'] text-2xl text-white">{num}</div>
                  <div className="text-xs text-[#A0B2C6] mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A0B2C6] text-xs uppercase tracking-[0.3em] animate-bounce">
          <span>Scroll</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </section>

      {/* SCROLL JOURNEY */}
      <div id="journey">
        <JourneyScroll destinations={global} />
      </div>

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
