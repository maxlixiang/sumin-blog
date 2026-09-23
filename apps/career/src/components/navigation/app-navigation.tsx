"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AssetsIcon,
  CapabilitiesIcon,
  DailyIcon,
  DashboardIcon,
  EvidenceIcon,
  ReviewsIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/", label: "总览", icon: DashboardIcon },
  { href: "/daily", label: "今日记录", icon: DailyIcon },
  { href: "/capabilities", label: "能力", icon: CapabilitiesIcon },
  { href: "/evidence", label: "成长证据", icon: EvidenceIcon },
  { href: "/reviews", label: "复盘", icon: ReviewsIcon },
  { href: "/assets", label: "职业资产", icon: AssetsIcon },
] as const;

function isActiveRoute(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNavigation({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();

  return (
    <nav className={`app-navigation app-navigation--${variant}`} aria-label="Career OS">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActiveRoute(pathname, href);
        return (
          <Link
            className={`nav-item${active ? " nav-item--active" : ""}`}
            href={href}
            key={href}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="nav-item__icon" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

