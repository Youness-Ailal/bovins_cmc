// Shared badge/status style classes for consistent coloring across pages.
// Use these instead of duplicating hex values in page files.

export const traitementStatutStyle: Record<string, string> = {
  "En cours": "bg-[#E0ECFF] text-info",
  "Terminé":  "bg-[#DFF0E4] text-[#004D1A]",
  "Planifié": "bg-[#EDE7DC] text-[#7A3F00]",
};

export const alerteNiveauStyle: Record<string, string> = {
  "Critique":      "bg-[#F0E0DC] text-[#8C1C00]",
  "Avertissement": "bg-[#EDE7DC] text-[#7A3F00]",
  "Info":          "bg-[#E0ECFF] text-info",
};

export const userRoleStyle: Record<string, string> = {
  "Admin":       "bg-[#E8E8F2] text-[#00006B]",
  "Responsable": "bg-[#DFF0E4] text-[#004D1A]",
  "Opérateur":   "bg-[#EDE7DC] text-[#7A3F00]",
};

export const planStatutStyle: Record<string, string> = {
  "À faire":    "bg-[#E0ECFF] text-info",
  "Rappel J-3": "bg-[#EDE7DC] text-[#7A3F00]",
  "En retard":  "bg-[#F0E0DC] text-[#8C1C00]",
};

export const stockStatutStyle: Record<string, string> = {
  OK:       "bg-[#DFF0E4] text-[#004D1A]",
  Faible:   "bg-[#EDE7DC] text-[#7A3F00]",
  Critique: "bg-[#F0E0DC] text-[#8C1C00]",
};

// Generic helper for "active" vs "inactive"
export const activeStyle = {
  active:   "bg-[#DFF0E4] text-[#004D1A]",
  inactive: "bg-surface text-subtle",
};
