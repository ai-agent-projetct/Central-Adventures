import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Tag, Check, ArrowRight } from "lucide-react";
import { getPackages } from "../lib/api";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getPackages().then(setPackages).catch(() => {});
  }, []);

  const filtered = filter === "All" ? packages : packages.filter((p) => p.type === filter);

  return (
    <div data-testid="packages-page" className="pt-32">
      <div className="container-x">
        <div className="eyebrow mb-4">Curated Tour Packages</div>
        <h1 className="text-5xl sm:text-6xl font-light tracking-tighter">
          Journeys, <span className="text-gradient">ready to book</span>
        </h1>
        <p className="mt-4 text-[#A0B2C6] max-w-2xl">Handpicked itineraries — flights, hotels, guides, and unforgettable moments included.</p>

        <div className="flex gap-2 mt-10 flex-wrap">
          {["All", "International", "Domestic"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`packages-filter-${f.toLowerCase()}`}
              className={`px-5 py-2 rounded-full text-sm border transition-all ${
                filter === f
                  ? "bg-[#E29578] text-[#040914] border-transparent"
                  : "bg-white/5 text-white border-white/10 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section className="section pt-14">
        <div className="container-x grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div key={p.id} data-testid={`package-${p.id}`} className="crystal-glass rounded-2xl overflow-hidden card-hover flex flex-col">
              <div className="aspect-[16/10] relative">
                <img src={p.image} alt={p.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-[0.2em] text-[#E29578] border border-white/10">
                  {p.type}
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="font-['Outfit'] text-2xl text-white">{p.name}</h3>
                  <div className="flex gap-4 text-xs text-[#A0B2C6] mt-2">
                    <span className="flex items-center gap-1"><Clock size={12} /> {p.duration}</span>
                    <span className="flex items-center gap-1"><Tag size={12} /> {p.starting_price}</span>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {p.includes?.slice(0, 4).map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#A0B2C6]">
                      <Check size={14} className="text-[#E29578] mt-0.5 shrink-0" /> {i}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="mt-auto inline-flex items-center gap-2 text-sm text-white hover:text-[#E29578]" data-testid={`pkg-enquire-${p.id}`}>
                  Enquire now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
