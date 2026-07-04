import React from "react";
import { Target, BookOpen, Plane, Award, Wrench } from "lucide-react";

const REASONS = [
  { icon: Target, title: "Expert-Led Tours", desc: "Guided experiences at premier space facilities worldwide — including exclusive access with ISRO scientists." },
  { icon: BookOpen, title: "Educational Focus", desc: "Every program is designed to inspire the next generation of scientists, engineers, and innovators." },
  { icon: Plane, title: "Seamless Travel", desc: "End-to-end arrangement for both domestic and international tours — worry-free for schools and teachers." },
  { icon: Award, title: "Lasting Impact", desc: "Memories and knowledge that shape future careers — 38+ years of life-changing experiences." },
  { icon: Wrench, title: "Hands-On Learning", desc: "We bring STEM education to your school campus with real equipment, live launches, and expert instructors." },
];

export const WhyCentralGroup = () => {
  return (
    <section className="section" data-testid="why-section">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <div className="eyebrow mb-4">Why Central Group</div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
            What sets us <span className="text-gradient">apart</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} data-testid={`why-${title.toLowerCase().replace(/[^\w]/g, "-")}`} className="crystal-glass rounded-2xl p-7 card-hover">
              <div className="w-11 h-11 rounded-xl bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578]">
                <Icon size={20} />
              </div>
              <h3 className="font-['Outfit'] text-xl mt-4 text-white">{title}</h3>
              <p className="text-sm text-[#A0B2C6] mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
