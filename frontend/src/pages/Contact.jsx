import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { contactUs } from "../lib/api";
import { toast } from "sonner";

const DEST_OPTIONS = [
  "NASA & USA Tour",
  "Egypt Tour",
  "Singapore + Malaysia",
  "Dubai",
  "European Space Center",
  "Kashmir",
  "Kullu-Manali",
  "Jaipur-Jaisalmer",
  "ISRO Sriharikota",
  "School Training Program",
  "Other",
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", destination: "", message: "" });
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) {
      toast.error("Please fill in name, email, phone and message.");
      return;
    }
    setBusy(true);
    try {
      await contactUs(form);
      toast.success("Thank you! We'll reach out within 24 hours.");
      setForm({ name: "", email: "", phone: "", destination: "", message: "" });
    } catch (err) {
      toast.error("Something went wrong. Please try WhatsApp or call us.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-32">
      <div className="container-x">
        <div className="eyebrow mb-4">Get in touch</div>
        <h1 className="text-5xl sm:text-6xl font-light tracking-tighter">
          Let's plan your <span className="text-gradient">next adventure</span>
        </h1>
        <p className="mt-4 text-[#A0B2C6] max-w-2xl">Our team is ready to build an unforgettable journey for your school or family.</p>
      </div>

      <section className="section pt-14">
        <div className="container-x grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <a href="tel:+919987015776" className="crystal-glass rounded-2xl p-6 flex items-start gap-4 card-hover block" data-testid="contact-phone">
              <div className="w-11 h-11 rounded-xl bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578]"><Phone size={18} /></div>
              <div>
                <div className="eyebrow mb-1">Phone</div>
                <div className="text-white text-lg">+91 99870 15776</div>
                <div className="text-xs text-[#A0B2C6] mt-1">+91 99580 44660 · +91 99878 57776</div>
              </div>
            </a>
            <a href="mailto:centraladventures@yahoo.com" className="crystal-glass rounded-2xl p-6 flex items-start gap-4 card-hover block" data-testid="contact-email">
              <div className="w-11 h-11 rounded-xl bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578]"><Mail size={18} /></div>
              <div>
                <div className="eyebrow mb-1">Email</div>
                <div className="text-white">centraladventures@yahoo.com</div>
                <div className="text-xs text-[#A0B2C6] mt-1">We reply within 24 hours</div>
              </div>
            </a>
            <div className="crystal-glass rounded-2xl p-6 flex items-start gap-4" data-testid="contact-address">
              <div className="w-11 h-11 rounded-xl bg-[#E29578]/10 border border-[#E29578]/30 flex items-center justify-center text-[#E29578]"><MapPin size={18} /></div>
              <div>
                <div className="eyebrow mb-1">Office</div>
                <div className="text-white text-sm">Suite 307 D Wing, Crystal Plaza</div>
                <div className="text-xs text-[#A0B2C6] mt-1">New Link Road, Andheri, Mumbai 400053</div>
              </div>
            </div>
            <a href="https://wa.me/919987015776" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:brightness-110 transition" data-testid="contact-whatsapp">
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>

          <form onSubmit={submit} className="lg:col-span-3 crystal-glass rounded-2xl p-8 space-y-5" data-testid="contact-form">
            <h2 className="font-['Outfit'] text-3xl">Send us a message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-[#A0B2C6]">Name *</span>
                <input required data-testid="contact-name" value={form.name} onChange={set("name")}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E29578]" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-[#A0B2C6]">Email *</span>
                <input required type="email" data-testid="contact-email-input" value={form.email} onChange={set("email")}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E29578]" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-[#A0B2C6]">Phone *</span>
                <input required data-testid="contact-phone-input" value={form.phone} onChange={set("phone")}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E29578]" />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-[#A0B2C6]">Interested in</span>
                <select data-testid="contact-destination" value={form.destination} onChange={set("destination")}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E29578]">
                  <option value="" className="bg-[#040914]">Select destination</option>
                  {DEST_OPTIONS.map((d) => (<option key={d} value={d} className="bg-[#040914]">{d}</option>))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-[#A0B2C6]">Message *</span>
              <textarea required rows={5} data-testid="contact-message" value={form.message} onChange={set("message")}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E29578] resize-none"
                placeholder="Tell us about your school, batch size, preferred dates..." />
            </label>
            <button type="submit" disabled={busy} data-testid="contact-submit"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#E29578] text-[#040914] font-semibold hover:brightness-110 transition-all disabled:opacity-50">
              {busy ? "Sending..." : (<>Send message <Send size={16} /></>)}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
