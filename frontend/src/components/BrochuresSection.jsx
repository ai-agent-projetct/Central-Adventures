import React, { useEffect, useState } from "react";
import { getBrochures, brochureDownloadUrl } from "../lib/api";
import { Download, FileText } from "lucide-react";

export const BrochuresSection = () => {
  const [items, setItems] = useState([]);
  useEffect(() => {
    getBrochures().then(setItems).catch(() => {});
  }, []);
  return (
    <section className="section" data-testid="brochures-section">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <div className="eyebrow mb-4">Resources</div>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
            Our <span className="text-gradient">brochures</span>
          </h2>
          <p className="text-[#A0B2C6] mt-4">Detailed guides to our educational tours and aerospace training programs — downloadable as PDF.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((b) => (
            <div key={b.id} data-testid={`brochure-${b.id}`} className="crystal-glass rounded-2xl p-6 card-hover flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578] mb-4">
                <FileText size={18} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#A0B2C6]">Added {b.added}</div>
              <h3 className="font-['Outfit'] text-xl mt-2 text-white">{b.title}</h3>
              {b.subtitle && <p className="text-sm text-[#A0B2C6] mt-2 leading-relaxed flex-1">{b.subtitle}</p>}
              <a
                href={brochureDownloadUrl(b.id)}
                target="_blank"
                rel="noreferrer"
                data-testid={`brochure-download-${b.id}`}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E29578] text-[#040914] font-semibold text-sm hover:brightness-110 transition self-start"
              >
                <Download size={14} /> Download PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
