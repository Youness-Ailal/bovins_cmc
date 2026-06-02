"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Traitements", href: "/sante" },
  { label: "État de santé", href: "/sante/etat" },
  { label: "Planification", href: "/sante/planification" },
  { label: "Calendrier", href: "/sante/calendrier" },
];

export default function SanteTabs() {
  const pathname = usePathname();

  return (
    <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
      {TABS.map((tab) => {
        const active = tab.href === "/sante" ? pathname === "/sante" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-12 items-center px-4 font-inter text-sm transition-colors ${
              active
                ? "border-b-2 border-primary font-semibold text-primary"
                : "font-normal text-placeholder hover:text-subtle"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
