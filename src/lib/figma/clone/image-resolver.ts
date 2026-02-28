/**
 * Unsplash 무료 이미지 매칭
 * 클론 시 원본의 IMAGE fill을 무료 Unsplash 이미지로 대체한다.
 * AI 이미지 생성 비용을 절약하기 위한 모듈.
 */

import 'server-only';

/** 카테고리별 Unsplash 이미지 ID 풀 */
const UNSPLASH_POOLS: Record<string, string[]> = {
  agriculture: [
    'pkKeuRiDJko', // 토마토 클로즈업
    'YbgZeaOdMa0', // 과일 시장
    'Ih4Rz40gyPY', // 농산물
    'jGnNl9kN1Zg', // 채소 디스플레이
    '4_jhDO54BYg', // 신선 토마토
    'ieic5Tq8YMk', // 과일 바스켓
    'uQs1802D0CQ', // 유기농 농산물
    'uxUUENpp01I', // 시장 채소
    'kxgM9GfP04Y', // 농장
    'ARy6VGwmZRw', // 수확
  ],
  baby: [
    'Dhi_VjMmKJk', // 아기 이불
    '3Sg6Ozbxv-0', // 유아 침구
    'hIgeoQjS_iE', // 귀여운 유아
    'zGHEpgOeMWo', // 아기 용품
    'iYQC9xWMvw4', // 아기방 인테리어
    'TxPO2c2Dlrc', // 부드러운 직물
    'XaLjWfFSUGY', // 아기 담요
    'pVt9j3iWtPM', // 유아 패브릭
    'wFOH8alCx5I', // 부드러운 베딩
    'rjrQ4_MzEKQ', // 편안한 침대
  ],
  food: [
    'MqT0asuoIcU', // 음식 클로즈업
    'Gg5-K3N2y0o', // 요리 플레이팅
    'IGfIGP5ONV0', // 신선한 식재료
    '08bOYnH_r_E', // 레스토랑 요리
    'N_Y88TWmGwA', // 디저트
    'kcA-c3f_3FE', // 샐러드
    'SqYmTDQYMjo', // 한식
    'awj7sRviVXo', // 카페 음료
  ],
  product: [
    'p6yH8VmGqxo', // 제품 스튜디오
    '2JIvboGLeho', // 미니멀 제품
    'tBtuxtLvAZs', // 깔끔한 제품
    'HGHv0Wmqnjo', // 화이트 배경 제품
    'hpTH5b6mo2s', // 패키지
    'FV3GConVSss', // 디자인 오브젝트
  ],
  nature: [
    'LBI7cgq7Nr4', // 자연 풍경
    '1Z2niiBPg5A', // 숲
    'wQLAGv4_OYs', // 산
    'K2s_YE031CA', // 바다
    'JgOeRuGD_Y4', // 꽃밭
  ],
  generic: [
    'WkfDrhxDMC8', // 미니멀 배경
    '2EJCSULRwC8', // 그라데이션
    'oZuBNC-6E2s', // 텍스처
    'rMILC1PIwM0', // 추상
    'VGOiY1gZZYg', // 패턴
    'koy6FlCCy5s', // 기하학
    'nXt5HtLmlgE', // 단색 배경
    'JFeOy62yjXk', // 미니멀 텍스처
  ],
};

/** 이미지 이름/카테고리에서 적절한 풀 선택 */
function selectPool(category: string, nodeName: string): string[] {
  const lowerName = nodeName.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (/토마토|농수산|과일|채소|유기농|농산/.test(lowerName) || /농수산/.test(lowerCat)) {
    return UNSPLASH_POOLS.agriculture;
  }
  if (/아기|유아|이불|침구|베이비|baby|kid/.test(lowerName) || /영유아/.test(lowerCat)) {
    return UNSPLASH_POOLS.baby;
  }
  if (/음식|요리|메뉴|맛|식당|카페/.test(lowerName)) {
    return UNSPLASH_POOLS.food;
  }
  if (/상품|제품|패키지|박스/.test(lowerName)) {
    return UNSPLASH_POOLS.product;
  }
  if (/자연|풍경|산|바다|꽃/.test(lowerName)) {
    return UNSPLASH_POOLS.nature;
  }

  return UNSPLASH_POOLS.generic;
}

/** Unsplash URL 빌드 */
function buildUnsplashUrl(photoId: string, width: number, height: number): string {
  const w = Math.min(Math.round(width), 1920);
  const h = Math.min(Math.round(height), 1920);
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}

/** 이미지 노드에 Unsplash 이미지 URL 매핑 */
export function resolveImages(
  imageNodes: Array<{ name: string; width: number; height: number; imageRef: string }>,
  category: string,
): Map<string, string> {
  const result = new Map<string, string>();
  const usedIds = new Set<string>();

  for (const node of imageNodes) {
    const pool = selectPool(category, node.name);
    let photoId: string | undefined;

    for (const id of pool) {
      if (!usedIds.has(id)) {
        photoId = id;
        usedIds.add(id);
        break;
      }
    }

    if (!photoId) {
      usedIds.clear();
      photoId = pool[0];
      usedIds.add(photoId);
    }

    const url = buildUnsplashUrl(photoId, node.width, node.height);
    result.set(node.imageRef, url);
  }

  return result;
}
