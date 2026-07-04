import React from "react";
import { Heart, Shield, GraduationCap, Sparkles, Users, HandHeart, Plane, Rocket } from "lucide-react";

const VALUES = [
  { icon: HandHeart, title: "Humility", desc: "We remain grounded in gratitude for all the learning and support we have received from the 600+ schools across India we have worked with since 1987." },
  { icon: Shield, title: "Trust & Responsibility", desc: "Parents, institutions, and our dearest children place their faith in us — and we honour that trust with sincerity, care, and commitment." },
  { icon: GraduationCap, title: "Learning Beyond Classrooms", desc: "Education must be experienced, felt, and lived. Our workshops and education-driven travel programs are a testimony to that belief." },
  { icon: Heart, title: "Safety & Care", desc: "The wellbeing of every participant remains our highest priority on every journey and in every session." },
  { icon: Sparkles, title: "Transformation Through Experience", desc: "Every journey should leave behind greater awareness, confidence, and inspiration — supported by our pre-training and post-reflection sessions." },
  { icon: Users, title: "Relationships for Life", desc: "We do not believe in transactions alone. We believe in nurturing long-term bonds and meaningful partnerships." },
];

const PILLARS = [
  {
    icon: Plane,
    name: "CENTRAL Travel & Learn",
    focus: "Central Adventures & Holidays",
    desc: "Pioneers in organizing educational tours to ISRO, NASA Kennedy Space Center, European Space Centers, and iconic Indian destinations. Over 6,000 students guided worldwide.",
    tags: ["Domestic Tours", "International Tours", "NASA Visits", "ISRO Tours"],
  },
  {
    icon: Rocket,
    name: "CENTRAL Knowledge Experience",
    focus: "Training Programs",
    desc: "Igniting futures in aerospace and exploration. Hands-on STEM training programs in schools — from aeromodelling and drone building to rocket launches, satellite making, and astronomy nights.",
    tags: ["Aeromodelling", "Drone Training", "Rocketry", "Astronomy"],
  },
];

export default function About() {
  return (
    <div data-testid="about-page" className="pt-32">
      <div className="container-x max-w-4xl">
        <div className="eyebrow mb-4">🚀 Igniting Young Minds</div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tighter leading-[1.05]">
          From journeys to <span className="text-gradient">transformation</span>
        </h1>
        <div className="mt-10 space-y-6 text-lg text-[#A0B2C6] leading-relaxed">
          <p>
            At CENTRAL Adventures &amp; Holidays, we believe that true education does not happen only within
            four walls — it happens on mountain trails, inside museums, under star-filled skies, and through
            experiences that awaken curiosity, confidence, and wisdom.
          </p>
          <p>
            For nearly four decades, CENTRAL has remained committed to the philosophy of{" "}
            <em className="text-white not-italic">Education Through Travel</em>. Founded and led by{" "}
            <strong className="text-white font-medium">Milan Kumar Ittal</strong>, the organization evolved
            from educational travel into a holistic learning institution serving thousands — operating across
            India and internationally, including Malaysia, Europe, Egypt, the USA and NASA.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container-x grid md:grid-cols-4 gap-6 text-center">
          {[
            ["39", "Years"],
            ["600+", "Schools since 1987"],
            ["6,000+", "Students at NASA"],
            ["Global", "Destinations"],
          ].map(([n, l]) => (
            <div key={l} className="crystal-glass rounded-2xl p-8" data-testid={`about-stat-${l.toLowerCase().replace(/\s/g, "-")}`}>
              <div className="font-['Outfit'] text-5xl text-gradient">{n}</div>
              <div className="text-sm text-[#A0B2C6] mt-2 tracking-wide">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TWO PILLARS / COMPANY DIVISIONS */}
      <section className="section pt-0" data-testid="pillars-section">
        <div className="container-x">
          <div className="eyebrow mb-6">Our Companies</div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter mb-4">
            Two pillars of <span className="text-gradient">educational excellence</span>
          </h2>
          <p className="text-[#A0B2C6] max-w-2xl mb-12">
            CENTRAL Group of Companies brings together world-class educational tours and hands-on aerospace
            training programs — inspiring the next generation of scientists, engineers, and explorers.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map(({ icon: Icon, name, focus, desc, tags }) => (
              <div key={name} data-testid={`pillar-${name.toLowerCase().replace(/[^\w]/g, "-")}`} className="crystal-glass rounded-3xl p-8 card-hover">
                <div className="w-12 h-12 rounded-2xl bg-[#E29578]/15 border border-[#E29578]/40 flex items-center justify-center text-[#E29578] mb-5">
                  <Icon size={24} />
                </div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#E29578] mb-1">{focus}</div>
                <h3 className="font-['Outfit'] text-2xl text-white">{name}</h3>
                <p className="text-sm text-[#A0B2C6] leading-relaxed mt-3">{desc}</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {tags.map((t) => (
                    <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x">
          <div className="eyebrow mb-6">Our Values</div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter mb-12">
            What we <span className="text-gradient">stand for</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} data-testid={`value-${title.toLowerCase().replace(/[^\w]/g, "-")}`} className="crystal-glass rounded-2xl p-7 card-hover">
                <Icon size={22} className="text-[#E29578] mb-4" />
                <h3 className="font-['Outfit'] text-xl mb-2 text-white">{title}</h3>
                <p className="text-sm text-[#A0B2C6] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMITMENT */}
      <section className="section pt-0">
        <div className="container-x">
          <div className="crystal-glass rounded-3xl p-10 md:p-16 max-w-4xl mx-auto text-center" data-testid="commitment-section">
            <div className="eyebrow mb-6">Our Commitment</div>
            <p className="text-xl sm:text-2xl font-light text-white/90 leading-relaxed">
              For nearly 39 years, CENTRAL has remained dedicated to creating experiences that go beyond
              itineraries and schedules. We are committed to building bridges between people, cultures,
              knowledge, institutions, and ideas. To inspire minds. To enrich lives. To transform journeys
              into lifelong learning experiences.
            </p>
            <p className="text-[#E29578] mt-6 font-['Outfit'] text-lg">
              Because at CENTRAL, every journey is not just a destination reached — it is a life experience
              remembered forever.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
