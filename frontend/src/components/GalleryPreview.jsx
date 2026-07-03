import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getGallery } from "../lib/api";

export const GalleryPreview = () => {
  const [images, setImages] = useState([]);
  useEffect(() => {
    getGallery().then((d) => setImages(d.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <section className="section" data-testid="gallery-preview-section">
      <div className="container-x">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="eyebrow mb-4">Memories &amp; Moments</div>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tighter">
              Our tour <span className="text-gradient">gallery</span>
            </h2>
            <p className="text-[#A0B2C6] mt-4">From rocket launches at NASA to Himalayan peaks and ancient temples — every journey creates a lasting frame.</p>
          </div>
          <Link to="/gallery" data-testid="gallery-preview-cta" className="text-sm text-[#E29578] hover:text-white flex items-center gap-2">
            View full gallery <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {images.map((img, i) => (
            <div
              key={img.id}
              data-testid={`gallery-preview-${img.id}`}
              className={`relative rounded-xl overflow-hidden border border-white/10 card-hover ${
                i === 0 || i === 5 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <img src={img.url} alt={img.caption} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white opacity-0 hover:opacity-100 transition-opacity">{img.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
