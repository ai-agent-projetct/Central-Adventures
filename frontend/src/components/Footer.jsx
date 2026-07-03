import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export const Footer = () => {
  return (
    <footer data-testid="site-footer" className="relative mt-24 border-t border-white/5">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E29578] to-[#7EC8E3] flex items-center justify-center text-[#040914] font-bold">C</div>
            <div>
              <div className="font-['Outfit'] text-lg tracking-tight">CENTRAL</div>
              <div className="text-[10px] tracking-[0.3em] text-[#A0B2C6]">ADVENTURES</div>
            </div>
          </div>
          <p className="text-sm text-[#A0B2C6] leading-relaxed max-w-xs">
            Since 1987 — turning journeys into lifelong learning. 6,000+ students to NASA, 600+ schools worldwide.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-4">Explore</div>
          <ul className="space-y-2 text-sm text-[#A0B2C6]">
            <li><Link to="/destinations" className="hover:text-white">Destinations</Link></li>
            <li><Link to="/packages" className="hover:text-white">Packages</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Gallery</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">Contact</div>
          <ul className="space-y-3 text-sm text-[#A0B2C6]">
            <li className="flex items-start gap-2"><Phone size={14} className="mt-1 text-[#E29578]" /> <a href="tel:+919987015776" className="hover:text-white">+91 99870 15776</a></li>
            <li className="flex items-start gap-2"><Mail size={14} className="mt-1 text-[#E29578]" /> <a href="mailto:centraladventures@yahoo.com" className="hover:text-white">centraladventures@yahoo.com</a></li>
            <li className="flex items-start gap-2"><MapPin size={14} className="mt-1 text-[#E29578]" /> Suite 307 D, Crystal Plaza, New Link Road, Andheri, Mumbai 400053</li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">Get in touch</div>
          <a
            href="https://wa.me/919987015776?text=Hello+Central+Adventures%21+I+would+like+to+know+more+about+your+tours+and+programs."
            target="_blank" rel="noreferrer"
            data-testid="footer-whatsapp"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#E29578] text-[#040914] font-semibold text-sm hover:brightness-110 transition"
          >
            <MessageCircle size={16} /> WhatsApp Us
          </a>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-x py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6C7A89]">
          <div>© {new Date().getFullYear()} Central Group of Companies. All rights reserved.</div>
          <div>Travel. Learn. Explore.</div>
        </div>
      </div>
    </footer>
  );
};
