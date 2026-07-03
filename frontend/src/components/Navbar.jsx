import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/destinations", label: "Destinations" },
  { to: "/packages", label: "Packages" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3 bg-[#040914]/80 backdrop-blur-2xl border-b border-white/5" : "py-6"
      }`}
    >
      <div className="container-x flex items-center justify-between">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E29578] to-[#7EC8E3] flex items-center justify-center text-[#040914] font-bold text-lg font-['Outfit']">
            C
          </div>
          <div className="hidden sm:block">
            <div className="text-white font-['Outfit'] text-lg leading-none tracking-tight">CENTRAL</div>
            <div className="text-[10px] tracking-[0.3em] text-[#A0B2C6] mt-1">ADVENTURES</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors ${
                  isActive ? "text-[#E29578]" : "text-[#A0B2C6] hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <a
          href="tel:+919987015776"
          data-testid="nav-call-btn"
          className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-white"
        >
          <Phone size={14} className="text-[#E29578]" />
          +91 99870 15776
        </a>

        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white"
          aria-label="Menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div data-testid="mobile-menu" className="lg:hidden mt-4 mx-6 crystal-glass rounded-2xl p-6 space-y-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              data-testid={`mobile-nav-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `block text-base font-medium ${isActive ? "text-[#E29578]" : "text-white"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a href="tel:+919987015776" className="flex items-center gap-2 text-[#E29578] pt-4 border-t border-white/10">
            <Phone size={14} /> +91 99870 15776
          </a>
        </div>
      )}
    </header>
  );
};
