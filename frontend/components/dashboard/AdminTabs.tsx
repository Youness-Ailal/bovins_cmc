"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Utilisateurs", href: "/administration" },
  { label: "Races", href: "/administration/races" },
  { label: "Alertes", href: "/administration/alertes" },
  { label: "Paramètres", href: "/administration/parametres" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="flex h-12 shrink-0 items-center border-b border-border-light bg-card px-6">
      {TABS.map((tab) => {
        const active = tab.href === "/administration"
          ? pathname === "/administration" || pathname.startsWith("/administration/utilisateurs")
          : pathname.startsWith(tab.href);
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
