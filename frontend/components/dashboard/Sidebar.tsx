"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth";
import { filterByRole } from "@/lib/roleAccess";
import { useAlertsContext } from "@/contexts/AlertsContext";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  match: string[];
  badge?: string;
}

const NAV: NavItem[] = [
  { href: "/dashboard", icon: "layout-dashboard", label: "Tableau de bord", match: ["/dashboard"] },
  { href: "/boviai", icon: "sparkles", label: "BoviAI", match: ["/boviai"], badge: "IA" },
  { href: "/animaux", icon: "scan-line", label: "Animaux", match: ["/animaux"] },
  { href: "/parcelles", icon: "map-pin", label: "Parcelles", match: ["/parcelles"] },
  { href: "/stocks", icon: "package", label: "Stock", match: ["/stocks"] },
  { href: "/rations", icon: "utensils", label: "Rations", match: ["/rations"] },
  { href: "/sante", icon: "heart-pulse", label: "Sante", match: ["/sante"] },
  { href: "/finances", icon: "trending-up", label: "Finances", match: ["/finances"] },
  { href: "/fournisseurs", icon: "truck", label: "Fournisseurs", match: ["/fournisseurs"] },
  { href: "/performance", icon: "bell", label: "Alertes", match: ["/performance"] },
  { href: "/administration", icon: "settings", label: "Administration", match: ["/administration"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useAlertsContext();
  const nav = filterByRole(user?.role, NAV);

  function isActive(match: string[]) {
    return match.some((m) => pathname.startsWith(m));
  }

  const initials = user
    ? `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase()
    : "-";

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col bg-sidebar px-5 py-6">
      <div className="mb-8 flex items-center">
        <img src="/logo-white.png" alt="BOVITRACK" className="h-20 mx-auto"/>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="mb-2 px-3 font-inter text-[11px] font-semibold tracking-[0.07em] text-placeholder">
          MENU PRINCIPAL
        </p>
        {nav.map(({ href, icon, label, match, badge }) => {
          const active = isActive(match);
          const isAlertes = href === "/performance";
          const alertBadge = isAlertes && unreadCount > 0 ? unreadCount : null;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[6px] px-3 py-2.5 font-inter text-sm transition-colors ${active
                  ? "bg-sidebar-active font-semibold text-white"
                  : "font-medium text-sidebar-text hover:bg-sidebar-hover"
                }`}
            >
              <Icon name={icon} size={20} strokeWidth={active ? 2 : 1.75} />
              {label}
              {badge && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 font-dm-sans text-[9px] font-bold uppercase leading-none tracking-wide text-white">
                  {badge}
                </span>
              )}
              {alertBadge && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 font-dm-sans text-[10px] font-bold text-white">
                  {alertBadge > 99 ? "99+" : alertBadge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 border-t border-[#264A2E] pt-4">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary font-dm-sans text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-inter text-[13px] font-semibold text-white">
            {user ? `${user.prenom} ${user.nom}` : "-"}
          </span>
          <span className="font-inter text-[11px] text-sidebar-text">{user?.role ?? ""}</span>
        </div>
        <button onClick={logout} title="Deconnexion" className="ml-auto text-sidebar-text transition-colors hover:text-white">
          <Icon name="log-out" size={18} />
        </button>
      </div>
    </aside>
  );
}
