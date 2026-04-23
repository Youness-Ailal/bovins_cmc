"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

const NAV = [
  { href: "/dashboard", icon: "layout-dashboard", label: "Tableau de bord", match: ["/dashboard"] },
  { href: "/animaux", icon: "scan-line", label: "Animaux", match: ["/animaux"] },
  { href: "/lots", icon: "layers", label: "Lots", match: ["/lots"] },
  { href: "/parcelles", icon: "map-pin", label: "Parcelles", match: ["/parcelles"] },
  { href: "/stocks", icon: "package", label: "Stock", match: ["/stocks"] },
  { href: "/rations", icon: "utensils", label: "Rations", match: ["/rations"] },
  { href: "/sante", icon: "heart-pulse", label: "Santé", match: ["/sante"] },
  { href: "/performance", icon: "chart-bar", label: "Performance", match: ["/performance"] },
  { href: "/administration", icon: "settings", label: "Administration", match: ["/administration"] },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(match: string[]) {
    return match.some((m) => pathname.startsWith(m));
  }

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-sidebar py-6 px-5">
      {/* Logo */}
      <div className="mb-8 flex items-center">
        <Image src="/logo-white.png" alt="BOVITRACK" width={52} height={48} priority />
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-0.5">
        <p className="mb-2 px-3 font-inter text-[11px] font-semibold tracking-[0.07em] text-placeholder">
          MENU PRINCIPAL
        </p>
        {NAV.map(({ href, icon, label, match }) => {
          const active = isActive(match);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[6px] px-3 py-2.5 font-inter text-sm transition-colors ${
                active
                  ? "bg-sidebar-active font-semibold text-white"
                  : "font-medium text-sidebar-text hover:bg-sidebar-hover"
              }`}
            >
              <Icon name={icon} size={20} strokeWidth={active ? 2 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User section */}
      <div className="flex items-center gap-2.5 border-t border-[#264A2E] pt-4">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary font-dm-sans text-xs font-semibold text-white">
          YB
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="font-inter text-[13px] font-semibold text-white">Youness B.</span>
          <span className="font-inter text-[11px] text-sidebar-text">Responsable ferme</span>
        </div>
        <button className="ml-auto text-sidebar-text hover:text-white transition-colors">
          <Icon name="log-out" size={18} />
        </button>
      </div>
    </aside>
  );
}
