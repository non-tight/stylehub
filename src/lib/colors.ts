/**
 * tags.json 색상 태그 id → 색상 카드에 칠할 실제 색.
 * 이미지가 없거나 깨진 상품은 이 색으로 카드를 칠한다.
 * tags.json에 색상을 추가하면 여기에도 추가한다 (없으면 회색으로 표시).
 */
export interface SwatchColor {
  /** 카드 배경 (CSS background 값) */
  bg: string;
  /** 카드 위 글자색 */
  fg: string;
}

const DARK_TEXT = "#171a21";
const LIGHT_TEXT = "#ffffff";

const SWATCHES: Record<string, SwatchColor> = {
  red: { bg: "#d9473f", fg: LIGHT_TEXT },
  orange: { bg: "#ec7b2d", fg: LIGHT_TEXT },
  yellow: { bg: "#f2c84b", fg: DARK_TEXT },
  green: { bg: "#2e8b57", fg: LIGHT_TEXT },
  mint: { bg: "#9ad9c4", fg: DARK_TEXT },
  "sky-blue": { bg: "#8cc4ec", fg: DARK_TEXT },
  blue: { bg: "#3567d6", fg: LIGHT_TEXT },
  navy: { bg: "#1f2f5c", fg: LIGHT_TEXT },
  purple: { bg: "#7b4fc4", fg: LIGHT_TEXT },
  pink: { bg: "#ec9ab4", fg: DARK_TEXT },
  brown: { bg: "#8a5a3c", fg: LIGHT_TEXT },
  beige: { bg: "#e5d6bd", fg: DARK_TEXT },
  black: { bg: "#23262d", fg: LIGHT_TEXT },
  white: { bg: "#fbfbfc", fg: DARK_TEXT },
  gray: { bg: "#9aa1ac", fg: DARK_TEXT },
  gold: { bg: "linear-gradient(135deg, #e9c46a, #b8892b)", fg: DARK_TEXT },
  silver: { bg: "linear-gradient(135deg, #e3e6ea, #a9afb8)", fg: DARK_TEXT },
  multicolor: {
    bg: "linear-gradient(135deg, #d9473f, #f2c84b 35%, #2e8b57 65%, #3567d6)",
    fg: LIGHT_TEXT,
  },
};

const FALLBACK: SwatchColor = { bg: "#c4cad3", fg: DARK_TEXT };

export function getSwatch(colorId: string): SwatchColor {
  return SWATCHES[colorId] ?? FALLBACK;
}
