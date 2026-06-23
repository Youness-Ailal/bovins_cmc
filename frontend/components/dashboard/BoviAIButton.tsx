"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

/** Floating BoviAI launcher shown on every dashboard page (except the chat itself). */
export default function BoviAIButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/boviai")) return null;

  return (
    <Link
      href="/boviai"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 font-dm-sans text-[14px] font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-xl"
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Icon name="sparkles" size={18} />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white/90 animate-pulse" />
      </span>
      BoviAI
    </Link>
  );
}
