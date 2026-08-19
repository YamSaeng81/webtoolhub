/**
 * WebToolHub 전용 고도화 Analytics & 관리자 통계 트래커 (Enterprise Full-Package)
 * - Google Analytics 4 (GA4) 연동
 * - 접속 국가/도시 GeoIP 분석 (국기, 국가명, 도시)
 * - 접속 디바이스/브라우저/OS 분석 (Desktop / Mobile / Tablet)
 * - 최근 일자별 순 방문자(UV) & 페이지뷰(PV) 히스토리
 * - 툴별 실시간 사용량 랭킹 & 비율 (10초 쿨다운 디바운스)
 * - 💰 광고 슬롯별 노출량(Impression) & 클릭(Click/CTR) 트래커
 * - 🔍 실시간 인기 검색어 트래커
 * - ⚡ 툴별 에러 로그 수집 및 시스템 헬스체크
 * - 🚨 사이트 전체 실시간 긴급 공지/이벤트 배너 상태 관리
 * - 💾 데이터 백업 (JSON / CSV 내보내기) & 1클릭 복구 (Import)
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

export interface AdStat {
  slotId: string;
  impressions: number;
  clicks: number;
}

export interface SearchStat {
  keyword: string;
  count: number;
  lastSearchedAt: string;
}

export interface ToolErrorLog {
  id: string;
  toolId: string;
  toolName: string;
  errorMessage: string;
  timestamp: string;
}

export interface GlobalBannerConfig {
  enabled: boolean;
  message: string;
  type: 'info' | 'warning' | 'success' | 'event';
  linkUrl?: string;
  linkText?: string;
}

export interface AnalyticsSummary {
  totalPageviews: number;
  todayVisitors: number;
  toolStats: Record<string, ToolUsageStat>;
  geoStats: Record<string, GeoStat>;
  deviceStats: Record<string, DeviceStat>;
  dailyHistory: Record<string, DailyVisitorRecord>;
  adStats: Record<string, AdStat>;
  searchStats: Record<string, SearchStat>;
  errorLogs: ToolErrorLog[];
  globalBanner?: GlobalBannerConfig;
}

const STORAGE_KEY = 'webtoolhub_analytics_v4';
const BANNER_STORAGE_KEY = 'webtoolhub_global_banner';
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
    return {
      totalPageviews: 0,
      todayVisitors: 0,
      toolStats: {},
      geoStats: {},
      deviceStats: {},
      dailyHistory: {},
      adStats: {},
      searchStats: {},
      errorLogs: [],
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.geoStats) parsed.geoStats = {};
      if (!parsed.deviceStats) parsed.deviceStats = {};
      if (!parsed.dailyHistory) parsed.dailyHistory = {};
      if (!parsed.adStats) parsed.adStats = {};
      if (!parsed.searchStats) parsed.searchStats = {};
      if (!parsed.errorLogs) parsed.errorLogs = [];

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
    adStats: {},
    searchStats: {},
    errorLogs: [],
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
 * 2. 툴 사용 횟수 추적 (10초 쿨다운 디바운스)
 */
export function trackToolUsage(toolId: string, toolName: string) {
  const now = Date.now();
  const lastTracked = toolLastTrackedTimes[toolId] || 0;

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
 * 3. 💰 광고 슬롯 노출(Impression) 및 클릭(Click) 추적
 */
export function trackAdImpression(slotId: string) {
  const data = loadAnalyticsData();
  if (!data.adStats) data.adStats = {};
  if (!data.adStats[slotId]) {
    data.adStats[slotId] = { slotId, impressions: 0, clicks: 0 };
  }
  data.adStats[slotId].impressions += 1;
  saveAnalyticsData(data);
}

export function trackAdClick(slotId: string) {
  const data = loadAnalyticsData();
  if (!data.adStats) data.adStats = {};
  if (!data.adStats[slotId]) {
    data.adStats[slotId] = { slotId, impressions: 1, clicks: 0 };
  }
  data.adStats[slotId].clicks += 1;
  saveAnalyticsData(data);

  if (window.gtag) {
    window.gtag('event', 'ad_click', { ad_slot: slotId });
  }
}

/**
 * 4. 🔍 검색어 트래킹
 */
export function trackSearchQuery(keyword: string) {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed || trimmed.length < 2) return;

  const data = loadAnalyticsData();
  if (!data.searchStats) data.searchStats = {};
  const todayStr = new Date().toISOString().split('T')[0];

  if (!data.searchStats[trimmed]) {
    data.searchStats[trimmed] = { keyword: trimmed, count: 0, lastSearchedAt: todayStr };
  }
  data.searchStats[trimmed].count += 1;
  data.searchStats[trimmed].lastSearchedAt = todayStr;

  saveAnalyticsData(data);
}

/**
 * 5. ⚡ 툴 에러 로그 수집
 */
export function trackToolError(toolId: string, toolName: string, errorMessage: string) {
  const data = loadAnalyticsData();
  if (!data.errorLogs) data.errorLogs = [];

  const newLog: ToolErrorLog = {
    id: `err-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    toolId,
    toolName,
    errorMessage: errorMessage.slice(0, 300),
    timestamp: new Date().toLocaleString('ko-KR'),
  };

  data.errorLogs = [newLog, ...data.errorLogs.slice(0, 49)]; // 최대 50건 유지
  saveAnalyticsData(data);
}

export function clearErrorLogs() {
  const data = loadAnalyticsData();
  data.errorLogs = [];
  saveAnalyticsData(data);
}

/**
 * 6. 🚨 글로벌 공지 배너 제어
 */
export function getGlobalBanner(): GlobalBannerConfig {
  if (typeof window === 'undefined') {
    return { enabled: false, message: '', type: 'info' };
  }
  const saved = localStorage.getItem(BANNER_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
  }
  return { enabled: false, message: '', type: 'info' };
}

export function setGlobalBanner(config: GlobalBannerConfig) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BANNER_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('webtoolhub_banner_updated'));
}

/**
 * 7. 💾 데이터 백업 및 복원 (Export / Import / Reset)
 */
export function exportAllAnalyticsData(): string {
  const data = loadAnalyticsData();
  const feedbacks = localStorage.getItem('webtoolhub_feedbacks') || '[]';
  const banner = getGlobalBanner();

  return JSON.stringify(
    {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      analytics: data,
      feedbacks: JSON.parse(feedbacks),
      globalBanner: banner,
    },
    null,
    2
  );
}

export function exportAnalyticsToCsv(): string {
  const data = loadAnalyticsData();
  const toolStats = Object.values(data.toolStats || {});
  
  let csv = '\uFEFF'; // UTF-8 BOM for Excel
  csv += '순위,도구 ID,도구 이름,실행 횟수,최근 실행일\n';
  
  toolStats
    .sort((a, b) => b.count - a.count)
    .forEach((tool, idx) => {
      csv += `${idx + 1},"${tool.toolId}","${tool.toolName}",${tool.count},${tool.lastUsedAt}\n`;
    });

  csv += '\n날짜,순 방문자(UV),총 페이지뷰(PV)\n';
  Object.values(data.dailyHistory || {})
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((d) => {
      csv += `${d.date},${d.uv},${d.pv}\n`;
    });

  return csv;
}

export function importAnalyticsData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.analytics) {
      saveAnalyticsData(parsed.analytics);
    }
    if (parsed.feedbacks) {
      localStorage.setItem('webtoolhub_feedbacks', JSON.stringify(parsed.feedbacks));
    }
    if (parsed.globalBanner) {
      setGlobalBanner(parsed.globalBanner);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

export function resetAllAnalytics() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * 8. 비정상 툴 카운터 보정
 */
export function resetToolStatCount(toolId: string, newCount: number = 1) {
  const data = loadAnalyticsData();
  if (data.toolStats && data.toolStats[toolId]) {
    data.toolStats[toolId].count = newCount;
    saveAnalyticsData(data);
  }
}

/**
 * 9. 관리자 통계 수치 전체 반환
 */
export function getAnalyticsSummary(): AnalyticsSummary {
  return loadAnalyticsData();
}

/**
 * 10. ⚙️ 메뉴 및 도구 활성화 / 비활성화 제어 (Feature Toggle)
 */
const DISABLED_TOOLS_KEY = 'webtoolhub_disabled_tools';
const ADS_ENABLED_KEY = 'webtoolhub_ads_enabled';

export function getDisabledTools(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(DISABLED_TOOLS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function isToolEnabled(toolId: string): boolean {
  const disabled = getDisabledTools();
  return !disabled.includes(toolId);
}

export function setToolEnabled(toolId: string, enabled: boolean) {
  if (typeof window === 'undefined') return;
  let disabled = getDisabledTools();
  if (enabled) {
    disabled = disabled.filter((id) => id !== toolId);
  } else {
    if (!disabled.includes(toolId)) {
      disabled.push(toolId);
    }
  }
  localStorage.setItem(DISABLED_TOOLS_KEY, JSON.stringify(disabled));
  window.dispatchEvent(new Event('webtoolhub_feature_toggle_updated'));
}

export function setBatchToolsEnabled(toolIds: string[], enabled: boolean) {
  if (typeof window === 'undefined') return;
  let disabled = getDisabledTools();
  if (enabled) {
    disabled = disabled.filter((id) => !toolIds.includes(id));
  } else {
    toolIds.forEach((id) => {
      if (!disabled.includes(id)) disabled.push(id);
    });
  }
  localStorage.setItem(DISABLED_TOOLS_KEY, JSON.stringify(disabled));
  window.dispatchEvent(new Event('webtoolhub_feature_toggle_updated'));
}

/**
 * 11. 💰 글로벌 광고 활성화 / 비활성화 제어
 */
export function getAdsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(ADS_ENABLED_KEY);
  return saved === null ? true : saved === 'true';
}

export function setAdsEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADS_ENABLED_KEY, String(enabled));
  window.dispatchEvent(new Event('webtoolhub_ads_toggle_updated'));
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

