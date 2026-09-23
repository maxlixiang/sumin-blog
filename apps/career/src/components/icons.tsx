import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function DashboardIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M4 13.5 12 6l8 7.5" /><path d="M6.5 12.5V20h11v-7.5M9.5 20v-5h5v5" /></svg>;
}

export function DailyIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><rect x="4" y="5.5" width="16" height="14" rx="2" /><path d="M8 3.5v4M16 3.5v4M4 9.5h16" /><path d="m9 14 2 2 4-4" /></svg>;
}

export function EvidenceIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M7 3.5h7l4 4V20H7z" /><path d="M14 3.5v4h4M10 12h5M10 15.5h5" /></svg>;
}

export function ReviewsIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M5 19V9M10 19V5M15 19v-7M20 19V3" /><path d="M3 19.5h19" /></svg>;
}

export function AssetsIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M3.5 7.5h6l1.8 2H20.5V19H3.5z" /><path d="M3.5 7.5V5h6l1.8 2h6" /></svg>;
}

export function CapabilitiesIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></svg>;
}

export function PlusIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M12 5v14M5 12h14" /></svg>;
}

export function ArrowIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="M5 12h14M14 7l5 5-5 5" /></svg>;
}

export function ChevronIcon(props: IconProps) {
  return <svg {...iconProps} {...props}><path d="m9 6 6 6-6 6" /></svg>;
}

