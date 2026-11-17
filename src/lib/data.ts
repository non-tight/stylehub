/**
 * src/data의 JSON 파일을 불러와 타입과 함께 제공한다.
 * 페이지에서는 JSON을 직접 import하지 말고 이 파일의 함수를 쓴다.
 * 데이터 내용 검사는 scripts/check-data.mjs가 빌드 전에 한다.
 */
import categoriesJson from "../data/categories.json";
import tagsJson from "../data/tags.json";
import priceRangesJson from "../data/price-ranges.json";
import productsJson from "../data/products.json";
import sampleProductsJson from "../data/sample-products.json";

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  subcategories: Subcategory[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface TagGroup {
  id: string;
  name: string;
  tags: Tag[];
}

export interface PriceRange {
  id: string;
  name: string;
  min: number;
  max: number | null;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  tags: string[];
  color: string;
  priceRange: string;
  seller: string;
  url: string;
  image: string | null;
  addedAt: string;
}

export const categories: Category[] = [...(categoriesJson as Category[])].sort(
  (a, b) => a.order - b.order,
);
export const tagGroups: TagGroup[] = tagsJson as TagGroup[];
export const priceRanges: PriceRange[] = priceRangesJson as PriceRange[];
/**
 * 예시 데이터 모드: `npm run dev:sample`(= astro dev --mode sample)일 때만 sample-products.json을 쓴다.
 * 평소 개발(npm run dev)과 배포용 빌드(npm run build)는 항상 products.json만 쓴다.
 */
export const isSampleMode = import.meta.env.DEV && import.meta.env.MODE === "sample";

/** 새로 추가된 순으로 정렬된 전체 상품 */
export const products: Product[] = [
  ...((isSampleMode ? sampleProductsJson : productsJson) as Product[]),
].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

export const allTags: Tag[] = tagGroups.flatMap((g) => g.tags);
export const colorTags: Tag[] = tagGroups.find((g) => g.id === "color")?.tags ?? [];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getTag(id: string): Tag | undefined {
  return allTags.find((t) => t.id === id);
}

/** 태그가 속한 그룹 (색상·소재·스타일·무드·용도) */
export function getTagGroup(tagId: string): TagGroup | undefined {
  return tagGroups.find((g) => g.tags.some((t) => t.id === tagId));
}

export function getPriceRange(id: string): PriceRange | undefined {
  return priceRanges.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function getProductsBySub(categoryId: string, subId: string): Product[] {
  return products.filter((p) => p.category === categoryId && p.subcategory === subId);
}

export function getProductsByTag(tagId: string): Product[] {
  return products.filter((p) => p.tags.includes(tagId));
}
