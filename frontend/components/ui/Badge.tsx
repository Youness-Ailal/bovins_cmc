interface BadgeProps {
  children: React.ReactNode;
  variant?: "phase-croissance" | "phase-engraissement" | "phase-finition" | "sain" | "malade" | "origin" | "capacity";
  className?: string;
}

const variants: Record<string, string> = {
  "phase-croissance":    "bg-[#E8E8F2] text-[#00006B] border border-[#00006B]/12",
  "phase-engraissement": "bg-[#EDE7DC] text-[#7A3F00] border border-[#7A3F00]/12",
  "phase-finition":      "bg-[#DFF0E4] text-[#004D1A] border border-[#004D1A]/12",
  "sain":                "bg-[#DFF0E4] text-[#004D1A] border border-[#004D1A]/12",
  "malade":              "bg-[#F0E0DC] text-[#8C1C00] border border-[#8C1C00]/12",
  "origin":              "bg-[#E8E8F2] text-[#00006B] border border-[#00006B]/12",
  "capacity":            "bg-[#E8E8F2] text-[#00006B] border border-[#00006B]/12",
};

export default function Badge({ children, variant = "origin", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-0.5 font-inter text-[11px] font-semibold tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
