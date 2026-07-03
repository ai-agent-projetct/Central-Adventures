import React from "react";
import { Heart, Shield, GraduationCap, Sparkles, Users, HandHeart } from "lucide-react";

const VALUES = [
  { icon: HandHeart, title: "Humility", desc: "We remain grounded in gratitude for 600+ schools we have worked with since 1987." },
  { icon: Shield, title: "Trust & Responsibility", desc: "Parents, institutions, and our children place their faith in us — we honour it." },
  { icon: GraduationCap, title: "Learning Beyond Classrooms", desc: "Education must be experienced, felt, and lived." },
  { icon: Heart, title: "Safety & Care", desc: "The wellbeing of every participant is our highest priority." },
  { icon: Sparkles, title: "Transformation", desc: "Every journey should leave behind greater awareness and inspiration." },
  { icon: Users, title: "Relationships for Life", desc: "We nurture long-term bonds — not just transactions." },
];

export default function About() {
  return (
    <div data-testid="about-page" className="pt-32">
      <div className="container-x max-w-4xl">
        <div className="eyebrow mb-4">About Central Group</div>
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
            <strong className="text-white font-medium">Milan Kumar Ittal</strong>, we have curated
            educational and experiential programs across India and internationally — including Malaysia,
            Europe, Egypt, the USA, NASA and many other destinations — helping participants discover not
            only the world, but also themselves.
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
    </div>
  );
}
