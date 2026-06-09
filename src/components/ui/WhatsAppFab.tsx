import { MessageCircle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5511988776655";

export default function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-24 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-strong transition-all hover:scale-105 hover:bg-[#1ebe57] md:bottom-[6.5rem]"
    >
      <MessageCircle className="size-7" />
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-70 blur-md transition-opacity group-hover:opacity-100" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
