/**
 * 대분류(테마)별 색. 홈 테마 타일 등에 쓴다.
 * categories.json에 대분류를 추가하면 여기에도 추가한다 (없으면 기본 색).
 * 야구 응원은 특정 구단의 팀 색 조합처럼 보이지 않도록 한 가지 색만 쓴다.
 */
export interface ThemeColor {
  /** 타일 배경 */
  bg: string;
  /** 타일 기본 글자 */
  fg: string;
  /** 상품 수 등 강조 글자 */
  accent: string;
}

const THEMES: Record<string, ThemeColor> = {
  cheering: { bg: "#2f5bea", fg: "#ffffff", accent: "#dbe4ff" },
  christmas: { bg: "#1f5e45", fg: "#ffffff", accent: "#f3d27a" },
  "movie-mood": { bg: "#24262c", fg: "#ffffff", accent: "#e2b85c" },
};

const FALLBACK: ThemeColor = { bg: "#3a3f4b", fg: "#ffffff", accent: "#dce1e8" };

export function getTheme(categoryId: string): ThemeColor {
  return THEMES[categoryId] ?? FALLBACK;
}
