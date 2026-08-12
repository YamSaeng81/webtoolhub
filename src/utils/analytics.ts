/**
 * WebToolHub 전용 Analytics & 툴 사용 통계 트래커
 * - Google Analytics 4 (GA4) 이벤트 연동
 * - 로컬/서버 자체 통계 집계 (일별 순 방문자 수 UV, 총 페이지뷰 PV, 15개 툴별 사용 횟수 랭킹)
 */

export interface ToolUsageStat {
  toolId: string;
  toolName: string;
  count: number;
  lastUsedAt: string;
}

export interface AnalyticsSummary {
  totalPageviews: number;
  todayVisitors: number;
  toolStats: Record<string, ToolUsageStat>;
}

const STORAGE_KEY = 'webtoolhub_analytics_v2';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * 초기 통계 데이터 로드
 */
function loadAnalyticsData(): AnalyticsSummary {
  if (typeof window === 'undefined') {
    return { totalPageviews: 0, todayVisitors: 0, toolStats: {} };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // 날짜가 지나면 오늘 순 방문자 수 리셋
      if (parsed.lastDate !== todayStr) {
        parsed.todayVisitors = 0;
        parsed.lastDate = todayStr;
      }
      return parsed;
    } catch (e) {
      // 파싱 실패시 기본값
    }
  }

  return {
    totalPageviews: 0,
    todayVisitors: 0,
    toolStats: {},
  };
}

/**
 * 통계 데이터 저장
 */
function saveAnalyticsData(data: AnalyticsSummary) {
  if (typeof window === 'undefined') return;
  const todayStr = new Date().toISOString().split('T')[0];
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastDate: todayStr }));
}

/**
 * 1. 페이지 뷰 (PV) & 순 방문자 수 (UV) 추적 (중복 방문 100% 방지 ⭐)
 */
export function trackPageView(path: string) {
  const data = loadAnalyticsData();
  const todayStr = new Date().toISOString().split('T')[0];
  const visitSessionKey = `webtoolhub_uv_${todayStr}`;

  // 페이지 뷰(PV)는 누적 +1
  data.totalPageviews = (data.totalPageviews || 0) + 1;

  // 순 방문자 수(UV)는 동일 사용자/브라우저 당 오늘 딱 1번만 +1 ⭐
  if (!localStorage.getItem(visitSessionKey)) {
    data.todayVisitors = (data.todayVisitors || 0) + 1;
    localStorage.setItem(visitSessionKey, 'visited');
  }

  saveAnalyticsData(data);

  // GA4 연동
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
}

/**
 * 2. 툴 사용 횟수 추적 (변환, OCR, 압축 실행 시 자동 실행)
 * @param toolId 툴 식별자 (예: 'pdf-ocr', 'image-compress')
 * @param toolName 툴 이름
 */
export function trackToolUsage(toolId: string, toolName: string) {
  const data = loadAnalyticsData();
  const todayStr = new Date().toISOString().split('T')[0];

  if (!data.toolStats) {
    data.toolStats = {};
  }

  const current = data.toolStats[toolId] || {
    toolId,
    toolName,
    count: 0,
    lastUsedAt: todayStr,
  };

  current.count += 1;
  current.lastUsedAt = todayStr;
  data.toolStats[toolId] = current;

  saveAnalyticsData(data);

  // GA4 커스텀 이벤트 전송
  if (window.gtag) {
    window.gtag('event', 'use_tool', {
      tool_id: toolId,
      tool_name: toolName,
    });
  }
}

/**
 * 3. 관리자 통계 수치 반환
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  return loadAnalyticsData();
}

/**
 * Google Analytics 4 (GA4) 스크립트 동적 주입 함수
 * @param measurementId GA4 측정 ID (예: 'G-XXXXXXXXXX')
 */
export function initGoogleAnalytics(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}
