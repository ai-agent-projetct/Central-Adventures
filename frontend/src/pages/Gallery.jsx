import React, { useEffect, useState } from "react";
import { getGallery } from "../lib/api";

const CATEGORIES = ["All", "NASA Tour", "Egypt Tour", "General Tour", "DUDHWA NATIONAL PARK"];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [cat, setCat] = useState("All");
  const [active, setActive] = useState(null);

  useEffect(() => {
    getGallery().then(setImages).catch(() => {});
  }, []);

  const filtered = cat === "All" ? images : images.filter((i) => i.category === cat);

  return (
    <div data-testid="gallery-page" className="pt-32">
      <div className="container-x">
        <div className="eyebrow mb-4">Memories &amp; Moments</div>
        <h1 className="text-5xl sm:text-6xl font-light tracking-tighter">
          Our tour <span className="text-gradient">gallery</span>
        </h1>
        <p className="mt-4 text-[#A0B2C6] max-w-2xl">Every journey with Central Adventures creates lasting memories.</p>

        <div className="flex gap-2 mt-10 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              data-testid={`gallery-filter-${c.toLowerCase().replace(/\s/g, "-")}`}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] border transition-all ${
                cat === c ? "bg-[#E29578] text-[#040914] border-transparent" : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className="section pt-14">
        <div className="container-x">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filtered.map((img) => (
              <button
                key={img.id}
                onClick={() => setActive(img)}
                data-testid={`gallery-img-${img.id}`}
                className="w-full block rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all card-hover break-inside-avoid"
              >
                <img src={img.url} alt={img.caption} loading="lazy" className="w-full h-auto object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div
          data-testid="lightbox"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <div className="max-w-4xl w-full">
            <img src={active.url} alt={active.caption} className="w-full h-auto rounded-2xl" />
            <div className="text-center mt-4 text-white/80">{active.caption}</div>
          </div>
        </div>
      )}
    </div>
  );
}
