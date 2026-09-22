export interface CardTheme {
  header: string;
  headerText: string;
  headerSubtext: string;
}

// Tones matched to each card's real design (Techcombank vàng/gold, Vietcombank
// đen-vàng, VPBank đỏ). Falls back to a neutral slate for anything else.
export const CARD_THEMES: Record<string, CardTheme> = {
  "Tech 6505": {
    header: "bg-gradient-to-br from-amber-400 to-orange-500",
    headerText: "text-white",
    headerSubtext: "text-white/80",
  },
  "VCB Sig 0328": {
    header: "bg-gradient-to-br from-neutral-900 to-neutral-800",
    headerText: "text-amber-300",
    headerSubtext: "text-amber-200/70",
  },
  "VPbank 4264": {
    header: "bg-gradient-to-br from-rose-600 to-red-700",
    headerText: "text-white",
    headerSubtext: "text-white/80",
  },
  "Mycash thấu chi": {
    header: "bg-gradient-to-br from-slate-600 to-slate-800",
    headerText: "text-white",
    headerSubtext: "text-white/70",
  },
};

export const DEFAULT_CARD_THEME: CardTheme = {
  header: "bg-black/[0.04] dark:bg-white/[0.06]",
  headerText: "text-foreground",
  headerSubtext: "text-foreground/60",
};

export function cardTheme(name: string): CardTheme {
  return CARD_THEMES[name] ?? DEFAULT_CARD_THEME;
}
