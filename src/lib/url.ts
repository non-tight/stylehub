/**
 * 사이트 안쪽 링크 앞에 base 경로(/stylehub)를 붙여 준다.
 * 예: withBase("/tags/red") → "/stylehub/tags/red"
 * (Next.js의 basePath와 달리 Astro는 <a href>에 자동으로 붙여 주지 않는다)
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}`;
}
