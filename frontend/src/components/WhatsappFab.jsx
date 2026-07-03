import React from "react";
import { MessageCircle } from "lucide-react";

export const WhatsappFab = () => {
  return (
    <a
      href="https://wa.me/919987015776?text=Hello+Central+Adventures%21+I+would+like+to+know+more+about+your+tours+and+programs."
      target="_blank"
      rel="noreferrer"
      data-testid="whatsapp-fab"
      className="fixed z-40 bottom-6 right-6 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} />
    </a>
  );
};
