/**
 * WebToolHub 전용 고도화 Analytics & 관리자 통계 트래커
 * - Google Analytics 4 (GA4) 연동
 * - 접속 국가/도시 GeoIP 분석 (국기, 국가명, 도시)
 * - 접속 디바이스/브라우저/OS 분석 (Desktop / Mobile / Tablet)
 * - 최근 7일 일자별 순 방문자(UV) & 페이지뷰(PV) 히스토리
 * - 15개 툴별 실시간 사용량 랭킹 & 비율 (10초 쿨다운 디바운스 탑재 ⭐)
 */

export interface ToolUsageStat {
  toolId: string;
  toolName: string;
  count: number;
  lastUsedAt: string;
}

export interface GeoStat {
  countryCode: string;
  countryName: string;
  city: string;
  count: number;
  flag: string;
}

export interface DeviceStat {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  count: number;
}

export interface DailyVisitorRecord {
  date: string;
  uv: number;
  pv: number;
}

export interface AnalyticsSummary {
  totalPageviews: number;
  todayVisitors: number;
  toolStats: Record<string, ToolUsageStat>;
  geoStats: Record<string, GeoStat>;
  deviceStats: Record<string, DeviceStat>;
  dailyHistory: Record<string, DailyVisitorRecord>;
}

const STORAGE_KEY = 'webtoolhub_analytics_v3';
const toolLastTrackedTimes: Record<string, number> = {};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * 디바이스 & 브라우저 정보 추출
 */
function getDeviceInfo(): { deviceType: 'Desktop' | 'Mobile' | 'Tablet'; browser: string; os: string } {
  if (typeof window === 'undefined') return { deviceType: 'Desktop', browser: 'Chrome', os: 'Windows' };

  const ua = navigator.userAgent;
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) deviceType = 'Tablet';
  else if (/Mobile|iPhone|Android/i.test(ua)) deviceType = 'Mobile';

  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';

  let os = 'Windows';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}

/**
 * 초기 통계 데이터 로드
 */
function loadAnalyticsData(): AnalyticsSummary {
  if (typeof window === 'undefined') {
    return { totalPageviews: 0, todayVisitors: 0, toolStats: {}, geoStats: {}, deviceStats: {}, dailyHistory: {} };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.geoStats) parsed.geoStats = {};
      if (!parsed.deviceStats) parsed.deviceStats = {};
      if (!parsed.dailyHistory) parsed.dailyHistory = {};

      if (parsed.lastDate !== todayStr) {
        parsed.todayVisitors = 0;
        parsed.lastDate = todayStr;
      }
      return parsed;
    } catch (e) {
      // 기본값 반환
    }
  }

  return {
    totalPageviews: 0,
    todayVisitors: 0,
    toolStats: {},
    geoStats: {},
    deviceStats: {},
    dailyHistory: {},
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
 * 1. 페이지 뷰 (PV) & 순 방문자 수 (UV) & 접속 지오/기기 추적
 */
export function trackPageView(path: string) {
  const data = loadAnalyticsData();
  const todayStr = new Date().toISOString().split('T')[0];
  const visitSessionKey = `webtoolhub_uv_${todayStr}`;

  data.totalPageviews = (data.totalPageviews || 0) + 1;

  if (!data.dailyHistory[todayStr]) {
    data.dailyHistory[todayStr] = { date: todayStr, uv: 0, pv: 0 };
  }
  data.dailyHistory[todayStr].pv += 1;

  if (!localStorage.getItem(visitSessionKey)) {
    data.todayVisitors = (data.todayVisitors || 0) + 1;
    data.dailyHistory[todayStr].uv += 1;
    localStorage.setItem(visitSessionKey, 'visited');

    const dev = getDeviceInfo();
    const devKey = `${dev.deviceType}_${dev.browser}`;
    if (!data.deviceStats[devKey]) {
      data.deviceStats[devKey] = { deviceType: dev.deviceType, browser: dev.browser, os: dev.os, count: 0 };
    }
    data.deviceStats[devKey].count += 1;

    fetchGeoLocation((geo) => {
      const curData = loadAnalyticsData();
      if (!curData.geoStats) curData.geoStats = {};
      const geoKey = geo.countryCode || 'KR';
      if (!curData.geoStats[geoKey]) {
        curData.geoStats[geoKey] = {
          countryCode: geo.countryCode,
          countryName: geo.countryName,
          city: geo.city,
          count: 0,
          flag: geo.flag,
        };
      }
      curData.geoStats[geoKey].count += 1;
      saveAnalyticsData(curData);
    });
  }

  saveAnalyticsData(data);

  if (window.gtag) {
    window.gtag('event', 'page_view', { page_path: path });
  }
}

function fetchGeoLocation(callback: (geo: { countryCode: string; countryName: string; city: string; flag: string }) => void) {
  fetch('https://ipapi.co/json/')
    .then((res) => res.json())
    .then((data) => {
      const countryCode = data.country_code || 'KR';
      const countryName = data.country_name || '대한민국';
      const city = data.city || 'Seoul';
      const flag = getFlagEmoji(countryCode);
      callback({ countryCode, countryName, city, flag });
    })
    .catch(() => {
      callback({ countryCode: 'KR', countryName: '대한민국', city: 'Seoul', flag: '🇰🇷' });
    });
}

function getFlagEmoji(countryCode: string) {
  if (countryCode === 'KR') return '🇰🇷';
  if (countryCode === 'US') return '🇺🇸';
  if (countryCode === 'JP') return '🇯🇵';
  if (countryCode === 'CN') return '🇨🇳';
  if (countryCode === 'ES') return '🇪🇸';
  return '🌐';
}

/**
 * 2. 툴 사용 횟수 추적 (10초 쿨다운 디바운스 적용 ⭐)
 */
export function trackToolUsage(toolId: string, toolName: string) {
  const now = Date.now();
  const lastTracked = toolLastTrackedTimes[toolId] || 0;

  // 10초 이내에 연속으로 호출된 경우 중복 집계 무시 (타이핑 무한 카운트 방지 ⭐)
  if (now - lastTracked < 10000) {
    return;
  }
  toolLastTrackedTimes[toolId] = now;

  const data = loadAnalyticsData();
  const todayStr = new Date().toISOString().split('T')[0];

  if (!data.toolStats) data.toolStats = {};

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

  if (window.gtag) {
    window.gtag('event', 'use_tool', { tool_id: toolId, tool_name: toolName });
  }
}

/**
 * 3. 비정상적으로 부풀려진 툴 카운터 정상화/보정 (관리자 전용) ⭐
 */
export function resetToolStatCount(toolId: string, newCount: number = 1) {
  const data = loadAnalyticsData();
  if (data.toolStats && data.toolStats[toolId]) {
    data.toolStats[toolId].count = newCount;
    saveAnalyticsData(data);
  }
}

/**
 * 4. 관리자 통계 수치 전체 반환
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  return loadAnalyticsData();
}

/**
 * GA4 동적 주입
 */
export function initGoogleAnalytics(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer?.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}
