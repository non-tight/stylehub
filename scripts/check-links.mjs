// 빌드 결과(dist)의 모든 HTML에서 사이트 안쪽 링크가 실제 파일을 가리키는지 검사한다.
// `npm run build` 마지막에 자동으로 실행되고, 끊긴 링크가 있으면 실패(exit 1)해서 배포되지 않게 한다.
// 판매처 등 외부 링크는 검사하지 않는다 (12단계 예약 작업에서 점검).
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const BASE = "/stylehub";
const SITE = "https://non-tight.github.io";

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(p);
    return e.name.endsWith(".html") ? [p] : [];
  });
}

function targetExists(urlPath) {
  if (!urlPath.startsWith(`${BASE}/`) && urlPath !== BASE) return false;
  const rest = decodeURIComponent(urlPath.slice(BASE.length)).replace(/^\/+/, "");
  const p = join(DIST, rest);
  if (rest === "" || rest.endsWith("/")) return existsSync(join(p, "index.html"));
  if (existsSync(p) && statSync(p).isFile()) return true;
  return existsSync(join(p, "index.html")) || existsSync(`${p}.html`);
}

const broken = [];
let checked = 0;
const ATTR = /\s(?:href|src)="([^"]*)"/g;

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(ATTR)) {
    let url = m[1].replace(/&amp;/g, "&");
    if (url.startsWith(SITE)) url = url.slice(SITE.length);
    if (!url.startsWith("/")) continue; // 외부 링크, data:, #, mailto: 등은 건너뜀
    const path = url.split(/[?#]/)[0];
    checked++;
    if (!targetExists(path)) broken.push(`${relative(DIST, file)} → ${url}`);
  }
}

if (broken.length > 0) {
  console.error(`\n링크 검사 실패: 끊긴 링크 ${broken.length}개\n`);
  for (const b of [...new Set(broken)]) console.error(`  - ${b}`);
  console.error("");
  process.exit(1);
}
console.log(`링크 검사 통과: 사이트 안쪽 링크 ${checked}개`);
