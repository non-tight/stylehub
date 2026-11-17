// src/data의 JSON 파일을 검사한다. `npm run build` 전에 자동으로 실행된다.
// 문제가 있으면 목록을 보여 주고 실패(exit 1)해서 잘못된 데이터가 배포되지 않게 한다.
// 직접 실행: npm run check-data
import { readFileSync } from "node:fs";

const DATA_DIR = new URL("../src/data/", import.meta.url);
const errors = [];

function load(file) {
  try {
    return JSON.parse(readFileSync(new URL(file, DATA_DIR), "utf8"));
  } catch (e) {
    errors.push(`${file}: JSON 형식이 올바르지 않습니다 (${e.message})`);
    return null;
  }
}

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function checkId(where, id, seen) {
  if (!isNonEmptyString(id) || !ID_PATTERN.test(id)) {
    errors.push(
      `${where}: id "${id}"는 영문 소문자·숫자·하이픈만 쓸 수 있습니다`,
    );
    return;
  }
  if (seen.has(id)) errors.push(`${where}: id "${id}"가 중복됩니다`);
  seen.add(id);
}

// ---- 금지 표현 ----
const banned = load("banned-words.json") ?? { phrases: [], terms: [] };
const bannedWords = [...(banned.phrases ?? []), ...(banned.terms ?? [])]
  .filter(isNonEmptyString)
  .map((w) => w.toLowerCase());
// "OO st", "OOst" 형태 (한글 바로 뒤 st, 또는 단독 단어 st)
const ST_PATTERN = /[가-힣]\s?st\b|(^|\s)st(\s|$)/i;

function checkText(where, text) {
  if (typeof text !== "string") return;
  const lower = text.toLowerCase();
  for (const w of bannedWords) {
    if (lower.includes(w))
      errors.push(`${where}: 금지 단어 "${w}"가 들어 있습니다 → "${text}"`);
  }
  if (ST_PATTERN.test(text))
    errors.push(`${where}: "OO st" 형태의 표현은 쓸 수 없습니다 → "${text}"`);
}

// ---- 카테고리 ----
const categories = load("categories.json");
const categoryMap = new Map();
if (categories) {
  if (!Array.isArray(categories))
    errors.push("categories.json: 목록([ ]) 형태여야 합니다");
  else {
    const seen = new Set();
    categories.forEach((c, i) => {
      const where = `categories.json [${i}] ${c?.name ?? ""}`;
      checkId(where, c?.id, seen);
      if (!isNonEmptyString(c?.name))
        errors.push(`${where}: name이 비어 있습니다`);
      if (!isNonEmptyString(c?.description))
        errors.push(`${where}: description이 비어 있습니다`);
      if (typeof c?.order !== "number")
        errors.push(`${where}: order는 숫자여야 합니다`);
      checkText(`${where} name`, c?.name);
      checkText(`${where} description`, c?.description);
      const subSeen = new Set();
      if (!Array.isArray(c?.subcategories) || c.subcategories.length === 0) {
        errors.push(`${where}: subcategories가 비어 있습니다`);
      } else {
        c.subcategories.forEach((s, j) => {
          const sw = `${where} > 소분류 [${j}] ${s?.name ?? ""}`;
          checkId(sw, s?.id, subSeen);
          if (!isNonEmptyString(s?.name))
            errors.push(`${sw}: name이 비어 있습니다`);
          checkText(`${sw} name`, s?.name);
        });
      }
      if (isNonEmptyString(c?.id)) categoryMap.set(c.id, subSeen);
    });
  }
}

// ---- 태그 ----
const tagGroups = load("tags.json");
const tagIds = new Set();
const colorIds = new Set();
if (tagGroups) {
  if (!Array.isArray(tagGroups))
    errors.push("tags.json: 목록([ ]) 형태여야 합니다");
  else {
    const groupSeen = new Set();
    tagGroups.forEach((g, i) => {
      const where = `tags.json 그룹 [${i}] ${g?.name ?? ""}`;
      checkId(where, g?.id, groupSeen);
      if (!Array.isArray(g?.tags)) {
        errors.push(`${where}: tags가 목록이 아닙니다`);
        return;
      }
      g.tags.forEach((t, j) => {
        const tw = `${where} > 태그 [${j}] ${t?.name ?? ""}`;
        checkId(tw, t?.id, tagIds);
        if (!isNonEmptyString(t?.name))
          errors.push(`${tw}: name이 비어 있습니다`);
        checkText(`${tw} name`, t?.name);
        if (g.id === "color" && isNonEmptyString(t?.id)) colorIds.add(t.id);
      });
    });
    if (!groupSeen.has("color"))
      errors.push('tags.json: 색상 그룹(id "color")이 있어야 합니다');
  }
}

// ---- 가격대 ----
const priceRanges = load("price-ranges.json");
const priceIds = new Set();
if (priceRanges) {
  if (!Array.isArray(priceRanges))
    errors.push("price-ranges.json: 목록([ ]) 형태여야 합니다");
  else {
    priceRanges.forEach((p, i) => {
      const where = `price-ranges.json [${i}] ${p?.name ?? ""}`;
      checkId(where, p?.id, priceIds);
      if (!isNonEmptyString(p?.name))
        errors.push(`${where}: name이 비어 있습니다`);
      if (typeof p?.min !== "number")
        errors.push(`${where}: min은 숫자여야 합니다`);
      if (p?.max !== null && typeof p?.max !== "number")
        errors.push(`${where}: max는 숫자 또는 null이어야 합니다`);
    });
  }
}

// ---- 상품 ----
// products.json(실제 상품)과 sample-products.json(npm run dev:sample용 예시)을 같은 규칙으로 검사
function checkProducts(file) {
  const products = load(file);
  if (products) {
    if (!Array.isArray(products))
      errors.push(`${file}: 목록([ ]) 형태여야 합니다`);
    else {
      const seen = new Set();
      products.forEach((p, i) => {
        const where = `${file} [${i}] ${p?.name ?? p?.id ?? ""}`;
        checkId(where, p?.id, seen);

        for (const field of [
          "name",
          "category",
          "subcategory",
          "color",
          "priceRange",
          "seller",
          "url",
          "addedAt",
        ]) {
          if (!isNonEmptyString(p?.[field]))
            errors.push(`${where}: ${field}가 비어 있습니다`);
        }

        checkText(`${where} name`, p?.name);
        checkText(`${where} seller`, p?.seller);

        if (isNonEmptyString(p?.category)) {
          const subs = categoryMap.get(p.category);
          if (!subs)
            errors.push(
              `${where}: 대분류 "${p.category}"가 categories.json에 없습니다`,
            );
          else if (
            isNonEmptyString(p?.subcategory) &&
            !subs.has(p.subcategory)
          ) {
            errors.push(
              `${where}: 소분류 "${p.subcategory}"가 대분류 "${p.category}" 안에 없습니다`,
            );
          }
        }

        if (!Array.isArray(p?.tags) || p.tags.length === 0) {
          errors.push(
            `${where}: tags가 비어 있습니다 (태그를 1개 이상 넣어 주세요)`,
          );
        } else {
          for (const t of p.tags) {
            if (!tagIds.has(t))
              errors.push(`${where}: 태그 "${t}"가 tags.json에 없습니다`);
          }
        }

        if (isNonEmptyString(p?.color) && !colorIds.has(p.color)) {
          errors.push(
            `${where}: color "${p.color}"가 tags.json 색상 그룹에 없습니다`,
          );
        }
        if (isNonEmptyString(p?.priceRange) && !priceIds.has(p.priceRange)) {
          errors.push(
            `${where}: priceRange "${p.priceRange}"가 price-ranges.json에 없습니다`,
          );
        }
        if (isNonEmptyString(p?.url) && !p.url.startsWith("https://")) {
          errors.push(`${where}: url은 https://로 시작해야 합니다`);
        }
        if (
          p?.image !== null &&
          !(isNonEmptyString(p?.image) && p.image.startsWith("https://"))
        ) {
          errors.push(
            `${where}: image는 https://로 시작하는 주소이거나 null이어야 합니다`,
          );
        }
        if (
          isNonEmptyString(p?.addedAt) &&
          (!DATE_PATTERN.test(p.addedAt) || Number.isNaN(Date.parse(p.addedAt)))
        ) {
          errors.push(
            `${where}: addedAt은 2026-11-17 같은 날짜 형식이어야 합니다`,
          );
        }
      });
    }
  }
  return Array.isArray(products) ? products.length : 0;
}

const productCount = checkProducts("products.json");
const sampleCount = checkProducts("sample-products.json");

if (errors.length > 0) {
  console.error(`\n데이터 검사 실패: 문제 ${errors.length}건\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

console.log(
  `데이터 검사 통과: 대분류 ${categoryMap.size}개, 태그 ${tagIds.size}개, 가격대 ${priceIds.size}개, 상품 ${productCount}개 (예시 상품 ${sampleCount}개)`,
);
