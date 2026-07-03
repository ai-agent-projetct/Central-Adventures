import React, { useEffect, useState } from "react";
import { getGlobal, getDomestic } from "../lib/api";
import { MapPin } from "lucide-react";

export default function Destinations() {
  const [global, setGlobal] = useState([]);
  const [domestic, setDomestic] = useState([]);

  useEffect(() => {
    getGlobal().then(setGlobal).catch(() => {});
    getDomestic().then(setDomestic).catch(() => {});
  }, []);

  return (
    <div data-testid="destinations-page" className="pt-32">
      <div className="container-x">
        <div className="eyebrow mb-4">All Destinations</div>
        <h1 className="text-5xl sm:text-6xl font-light tracking-tighter mb-6">
          Every corner. <span className="text-gradient">Every hour of light.</span>
        </h1>
        <p className="text-[#A0B2C6] max-w-2xl">Global icons and Indian gems — chosen for the stories they tell.</p>
      </div>

      <section className="section" data-testid="global-destinations">
        <div className="container-x">
          <div className="eyebrow mb-6">Global Icons</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {global.map((d) => (
              <div key={d.id} data-testid={`global-${d.id}`} className="crystal-glass rounded-2xl overflow-hidden card-hover">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-[#E29578]">{d.time_of_day}</div>
                    <div className="font-['Outfit'] text-2xl text-white mt-1">{d.name}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-[#A0B2C6]"><MapPin size={12} /> {d.country}</div>
                  <p className="text-sm text-[#A0B2C6] mt-3 leading-relaxed">{d.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0" data-testid="domestic-destinations-page">
        <div className="container-x">
          <div className="eyebrow mb-6">Indian Journeys</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {domestic.map((d) => (
              <div key={d.id} className="crystal-glass rounded-2xl overflow-hidden card-hover" data-testid={`dest-domestic-${d.id}`}>
                <div className="aspect-square relative">
                  <img src={d.image} alt={d.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="font-['Outfit'] text-lg text-white">{d.name}</div>
                    <div className="text-xs text-[#A0B2C6] mt-1">{d.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
