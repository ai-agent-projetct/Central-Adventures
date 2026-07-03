import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SkyBackground } from "@/components/SkyBackground";
import { WhatsappFab } from "@/components/WhatsappFab";

import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import Packages from "@/pages/Packages";
import Gallery from "@/pages/Gallery";
import About from "@/pages/About";
import Contact from "@/pages/Contact";

function ScrollToTop() {
  const { pathname } = window.location;
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <div className="App min-h-screen" data-testid="app-root">
      <SkyBackground />
      <BrowserRouter>
        <Navbar />
        <ScrollToTop />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
        <WhatsappFab />
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </BrowserRouter>
    </div>
  );
}

export default App;
