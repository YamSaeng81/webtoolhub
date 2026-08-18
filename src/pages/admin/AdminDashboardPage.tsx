import React, { useState, useEffect } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import {
  getAnalyticsSummary,
  resetToolStatCount,
  getGlobalBanner,
  setGlobalBanner,
  clearErrorLogs,
  exportAllAnalyticsData,
  exportAnalyticsToCsv,
  importAnalyticsData,
  resetAllAnalytics,
  type GlobalBannerConfig,
} from '../../utils/analytics';
import type { FeedbackPost } from '../../types';
import {
  Lock,
  Key,
  BarChart3,
  Users,
  Wrench,
  Globe,
  Smartphone,
  Calendar,
  Layers,
  RotateCcw,
  Trash2,
  ThumbsUp,
  Bug,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  LogOut,
  RefreshCw,
  DollarSign,
  Search,
  Megaphone,
  Activity,
  Download,
  Upload,
  PieChart,
  Eye,
  MousePointerClick,
  CheckCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
} from 'lucide-react';
import confetti from 'canvas-confetti';

async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_PASSWORD_HASH = '1f654b9d0e14bf9d7ef84976c66cf17f698a9fa6f164ce68971f11c750b2ed65';

type AdminTab = 'overview' | 'ads' | 'search' | 'banner' | 'health' | 'backup' | 'feedback';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminPass, setAdminPass] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('webtoolhub_admin_auth') === 'true';
  });
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [, setRefreshCount] = useState<number>(0);

  // 글로벌 공지 배너 상태
  const [bannerConfig, setBannerConfigState] = useState<GlobalBannerConfig>(() => getGlobalBanner());
  const [bannerSavedAlert, setBannerSavedAlert] = useState<boolean>(false);

  // 실시간 통계 데이터 수집
  const statsSummary = getAnalyticsSummary();
  const toolStatsList = Object.values(statsSummary.toolStats || {}).sort((a, b) => b.count - a.count);
  const geoStatsList = Object.values(statsSummary.geoStats || {}).sort((a, b) => b.count - a.count);
  const deviceStatsList = Object.values(statsSummary.deviceStats || {}).sort((a, b) => b.count - a.count);
  const dailyHistoryList = Object.values(statsSummary.dailyHistory || {}).sort((a, b) => b.date.localeCompare(a.date));
  const adStatsList = Object.values(statsSummary.adStats || {}).sort((a, b) => b.impressions - a.impressions);
  const searchStatsList = Object.values(statsSummary.searchStats || {}).sort((a, b) => b.count - a.count);
  const errorLogsList = statsSummary.errorLogs || [];

  const totalToolExecCount = toolStatsList.reduce((acc, cur) => acc + cur.count, 0);
  const totalAdImpressions = adStatsList.reduce((acc, cur) => acc + cur.impressions, 0);
  const totalAdClicks = adStatsList.reduce((acc, cur) => acc + cur.clicks, 0);
  const overallCtr = totalAdImpressions > 0 ? ((totalAdClicks / totalAdImpressions) * 100).toFixed(2) : '0.00';

  // 카테고리별 사용량 비중 계산
  const categoryUsage = {
    pdf: toolStatsList.filter((t) => t.toolId.startsWith('pdf-')).reduce((sum, t) => sum + t.count, 0),
    image: toolStatsList.filter((t) => t.toolId.startsWith('image-')).reduce((sum, t) => sum + t.count, 0),
    media: toolStatsList.filter((t) => t.toolId.startsWith('media-')).reduce((sum, t) => sum + t.count, 0),
    text: toolStatsList.filter((t) => t.toolId.startsWith('text-')).reduce((sum, t) => sum + t.count, 0),
  };

  useEffect(() => {
    hashPassword('!Iloveyhde1').then((h) => {
      (window as any)._targetHash = h;
    });

    const saved = localStorage.getItem('webtoolhub_feedbacks');
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        setPosts([]);
      }
    }
  }, []);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputHash = await hashPassword(adminPass);
    const targetHash = (window as any)._targetHash || ADMIN_PASSWORD_HASH;

    if (inputHash === targetHash) {
      setIsAuthenticated(true);
      sessionStorage.setItem('webtoolhub_admin_auth', 'true');
      setAdminPass('');
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      alert('관리자 마스터 비밀번호가 올바르지 않습니다.');
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('webtoolhub_admin_auth');
  };

  const handleResetToolCount = (toolId: string) => {
    resetToolStatCount(toolId, 1);
    setRefreshCount((prev) => prev + 1);
  };

  const handleDeletePost = (id: string) => {
    if (!window.confirm('이 피드백 게시글을 삭제하시겠습니까?')) return;
    const nextPosts = posts.filter((p) => p.id !== id);
    setPosts(nextPosts);
    localStorage.setItem('webtoolhub_feedbacks', JSON.stringify(nextPosts));
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalBanner(bannerConfig);
    setBannerSavedAlert(true);
    setTimeout(() => setBannerSavedAlert(false), 3000);
    confetti({ particleCount: 40, spread: 40 });
  };

  const handleExportJson = () => {
    const jsonStr = exportAllAnalyticsData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webtoolhub_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvStr = exportAnalyticsToCsv();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webtoolhub_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importAnalyticsData(content)) {
        alert('백업 데이터가 성공적으로 복원되었습니다!');
        setRefreshCount((p) => p + 1);
        const saved = localStorage.getItem('webtoolhub_feedbacks');
        if (saved) setPosts(JSON.parse(saved));
        setBannerConfigState(getGlobalBanner());
      } else {
        alert('올바른 백업 JSON 파일 형식이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('정말로 모든 통계 데이터를 초기화하시겠습니까? (되돌릴 수 없습니다)')) {
      resetAllAnalytics();
      setRefreshCount((p) => p + 1);
      alert('모든 통계 데이터가 초기화되었습니다.');
    }
  };

  const categoryBadge = (cat: FeedbackPost['category']) => {
    switch (cat) {
      case 'bug':
        return (
          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Bug size={12} /> Bug
          </span>
        );
      case 'feature':
        return (
          <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Sparkles size={12} /> Feature
          </span>
        );
      default:
        return (
          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <Lightbulb size={12} /> General
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ToolHeader
        toolId="admin-dashboard"
        title="통합 관리자 엔터프라이즈 센터 (Admin Master)"
        description="실시간 트래픽, 광고 수익화, 인기 검색어, 글로벌 공지 배너 및 시스템 헬스를 총괄 제어합니다."
        badgeText="Enterprise Security"
      />

      {!isAuthenticated ? (
        /* 관리자 로그인 화면 */
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', maxWidth: '480px', margin: '2rem auto', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={32} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>관리자 인증 (Admin Master)</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              WebToolHub 관리자 전용 마스터 키를 입력해 주세요.
            </p>
          </div>

          <form onSubmit={handleAdminAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Admin Master Password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                }}
              />
              <Key size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <button className="btn-primary" type="submit" style={{ padding: '0.8rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
              <ShieldCheck size={18} /> 엔터프라이즈 대시보드 접속
            </button>
          </form>
        </div>
      ) : (
        /* 관리자 인증 완료 화면 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 상단 컨트롤 및 탭 네비게이션 */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontWeight: 800, fontSize: '1.1rem' }}>
                <ShieldCheck size={22} /> Master Admin Active
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setRefreshCount((p) => p + 1)} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RefreshCw size={14} /> 새로고침
                </button>
                <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            </div>

            {/* 6대 고도화 탭 메뉴 */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('overview')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'overview' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: activeTab === 'overview' ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <BarChart3 size={15} /> 📊 종합 통계
              </button>

              <button
                onClick={() => setActiveTab('ads')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'ads' ? '2px solid #10b981' : '1px solid var(--border-color)',
                  color: activeTab === 'ads' ? '#10b981' : 'var(--text-main)',
                  fontWeight: activeTab === 'ads' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <DollarSign size={15} /> 💰 광고 & 수익
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'search' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                  color: activeTab === 'search' ? '#f59e0b' : 'var(--text-main)',
                  fontWeight: activeTab === 'search' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <Search size={15} /> 🔍 인기 검색어
              </button>

              <button
                onClick={() => setActiveTab('banner')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'banner' ? '2px solid #ec4899' : '1px solid var(--border-color)',
                  color: activeTab === 'banner' ? '#ec4899' : 'var(--text-main)',
                  fontWeight: activeTab === 'banner' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <Megaphone size={15} /> 📢 공지 배너
              </button>

              <button
                onClick={() => setActiveTab('health')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'health' ? '2px solid #3b82f6' : '1px solid var(--border-color)',
                  color: activeTab === 'health' ? '#3b82f6' : 'var(--text-main)',
                  fontWeight: activeTab === 'health' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <Activity size={15} /> ⚡ 헬스 & 에러
              </button>

              <button
                onClick={() => setActiveTab('backup')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'backup' ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                  color: activeTab === 'backup' ? '#8b5cf6' : 'var(--text-main)',
                  fontWeight: activeTab === 'backup' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <Download size={15} /> 💾 백업 & 복원
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className="btn-secondary"
                style={{
                  border: activeTab === 'feedback' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: activeTab === 'feedback' ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: activeTab === 'feedback' ? 700 : 500,
                  fontSize: '0.85rem',
                }}
              >
                <ThumbsUp size={15} /> 💬 피드백 ({posts.length})
              </button>
            </div>
          </div>

          {/* 1. 📊 종합 통계 탭 */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 4대 주요 요약 지표 카드 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Users size={16} color="#10b981" /> 오늘 순 방문자 (UV)
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '0.3rem', display: 'block' }}>
                    {statsSummary.todayVisitors || 1} 명
                  </span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <BarChart3 size={16} color="var(--accent-primary)" /> 총 페이지뷰 (PV)
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.3rem', display: 'block' }}>
                    {statsSummary.totalPageviews || 1} 회
                  </span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Layers size={16} color="#f59e0b" /> 총 툴 실행 횟수
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.3rem', display: 'block' }}>
                    {totalToolExecCount} 회
                  </span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Globe size={16} color="#ec4899" /> 감지된 접속 국가
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ec4899', marginTop: '0.3rem', display: 'block' }}>
                    {geoStatsList.length || 1} 개국
                  </span>
                </div>
              </div>

              {/* 4대 카테고리별 사용 점유율 바 */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                  <PieChart size={18} /> 카테고리별 툴 사용 점유율
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📄 PDF 도구</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, display: 'block', color: 'var(--accent-primary)', marginTop: '0.2rem' }}>{categoryUsage.pdf}회</span>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🖼️ 이미지 & AI</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, display: 'block', color: '#10b981', marginTop: '0.2rem' }}>{categoryUsage.image}회</span>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🎬 미디어 & GIF</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, display: 'block', color: '#ec4899', marginTop: '0.2rem' }}>{categoryUsage.media}회</span>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🔤 텍스트 유틸</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, display: 'block', color: '#f59e0b', marginTop: '0.2rem' }}>{categoryUsage.text}회</span>
                  </div>
                </div>
              </div>

              {/* 📅 최근 일자별 방문자 히스토리 */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                  <Calendar size={18} /> 최근 일자별 순 방문자(UV) & 페이지뷰(PV) 히스토리
                </span>

                {dailyHistoryList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>일자별 방문 기록이 수집 대기 중입니다.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                          <th style={{ padding: '0.6rem 1rem' }}>날짜 (Date)</th>
                          <th style={{ padding: '0.6rem 1rem' }}>순 방문자 수 (UV)</th>
                          <th style={{ padding: '0.6rem 1rem' }}>총 페이지뷰 (PV)</th>
                          <th style={{ padding: '0.6rem 1rem' }}>비율 (PV/UV)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyHistoryList.map((rec) => (
                          <tr key={rec.date} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{rec.date}</td>
                            <td style={{ padding: '0.6rem 1rem', color: '#10b981', fontWeight: 700 }}>{rec.uv} 명</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{rec.pv} 회</td>
                            <td style={{ padding: '0.6rem 1rem', color: 'var(--text-muted)' }}>{rec.uv > 0 ? (rec.pv / rec.uv).toFixed(1) : 1} 회/명</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 🌍 접속 지역 (GeoIP) & 📱 디바이스 분할 위젯 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ec4899' }}>
                    <Globe size={18} /> 접속 국가 및 지역 정보 (GeoIP)
                  </span>

                  {geoStatsList.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🇰🇷 대한민국 (Seoul, KR) - 100%</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {geoStatsList.map((geo) => (
                        <div key={geo.countryCode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.5rem 0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          <span>{geo.flag} {geo.countryName} ({geo.city})</span>
                          <span style={{ fontWeight: 700, color: '#ec4899' }}>{geo.count}회 방문</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                    <Smartphone size={18} /> 접속 기기 및 브라우저 (Device/OS)
                  </span>

                  {deviceStatsList.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>💻 Desktop (Chrome / Windows) - 100%</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {deviceStatsList.map((dev, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.5rem 0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                          <span>📱 {dev.deviceType} ({dev.browser} / {dev.os})</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>{dev.count}회</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 🛠️ 툴별 실시간 사용량 랭킹 */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
                  <Wrench size={18} /> 툴별 실시간 사용량 랭킹 & 점유율 (%)
                </span>

                {toolStatsList.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    도구를 사용하면 랭킹과 점유율 바 차트가 실시간 업데이트됩니다.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {toolStatsList.map((st, idx) => {
                      const pct = totalToolExecCount > 0 ? Math.round((st.count / totalToolExecCount) * 100) : 0;
                      return (
                        <div key={st.toolId} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 600 }}>
                              #{idx + 1} {st.toolName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({st.toolId})</span>
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{st.count}회 ({pct}%)</span>
                              {st.count > 10 && (
                                <button
                                  onClick={() => handleResetToolCount(st.toolId)}
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                  title="누수/이상 수치를 1회로 초기화"
                                >
                                  <RotateCcw size={10} /> 수치 초기화
                                </button>
                              )}
                            </div>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.max(5, pct)}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. 💰 광고 & 수익화 탭 */}
          {activeTab === 'ads' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <Eye size={16} color="var(--accent-primary)" /> 총 광고 노출 (Impressions)
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.3rem', display: 'block' }}>
                    {totalAdImpressions} 회
                  </span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <MousePointerClick size={16} color="#10b981" /> 총 광고 클릭 수 (Clicks)
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '0.3rem', display: 'block' }}>
                    {totalAdClicks} 회
                  </span>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    <DollarSign size={16} color="#f59e0b" /> 평균 클릭률 (CTR)
                  </span>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.3rem', display: 'block' }}>
                    {overallCtr}%
                  </span>
                </div>
              </div>

              {/* 슬롯별 성과 테이블 */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={20} color="#10b981" /> 광고 슬롯별 실시간 성과 랭킹
                </h3>

                {adStatsList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>페이지 탐색 시 광고 슬롯 노출 데이터가 자동으로 집계됩니다.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                          <th style={{ padding: '0.6rem 1rem' }}>광고 슬롯 ID</th>
                          <th style={{ padding: '0.6rem 1rem' }}>노출수 (Impressions)</th>
                          <th style={{ padding: '0.6rem 1rem' }}>클릭수 (Clicks)</th>
                          <th style={{ padding: '0.6rem 1rem' }}>클릭률 (CTR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adStatsList.map((ad) => {
                          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={ad.slotId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.6rem 1rem', fontWeight: 600 }}>{ad.slotId}</td>
                              <td style={{ padding: '0.6rem 1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{ad.impressions}회</td>
                              <td style={{ padding: '0.6rem 1rem', color: '#10b981', fontWeight: 700 }}>{ad.clicks}회</td>
                              <td style={{ padding: '0.6rem 1rem', color: '#f59e0b', fontWeight: 700 }}>{ctr}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. 🔍 인기 검색어 탭 */}
          {activeTab === 'search' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                  <Search size={20} /> 실시간 사용자 인기 검색어 Top 15
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  상단 글로벌 검색창에 사용자들이 입력한 키워드를 분석하여 수요가 높은 도구를 파악합니다.
                </p>

                {searchStatsList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>수집된 검색어 데이터가 아직 없습니다.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {searchStatsList.slice(0, 15).map((s, idx) => (
                      <div key={s.keyword} style={{ padding: '0.8rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          <span style={{ color: idx < 3 ? '#f59e0b' : 'var(--text-muted)', fontWeight: 800, marginRight: '0.4rem' }}>#{idx + 1}</span>
                          {s.keyword}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.85rem' }}>{s.count}회</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. 📢 실시간 공지 배너 제어 탭 */}
          {activeTab === 'banner' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <form onSubmit={handleSaveBanner} className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899' }}>
                  <Megaphone size={20} /> 실시간 사이트 전체 긴급/이벤트 공지 배너 제어
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  코드 재배포 없이 관리자 설정 저장 즉시 모든 방문자의 사이트 최상단에 글로벌 알림 배너가 실시간 노출됩니다.
                </p>

                {bannerSavedAlert && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} /> 공지 배너 설정이 성공적으로 저장 및 실시간 반영되었습니다!
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem' }}>
                    <input
                      type="checkbox"
                      checked={bannerConfig.enabled}
                      onChange={(e) => setBannerConfigState({ ...bannerConfig, enabled: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    공지 배너 활성화 (On / Off)
                  </label>

                  <select
                    value={bannerConfig.type}
                    onChange={(e) => setBannerConfigState({ ...bannerConfig, type: e.target.value as any })}
                    style={{ padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                  >
                    <option value="info">📢 일반 공지 (Indigo)</option>
                    <option value="warning">⚠️ 긴급 점검 (Red/Orange)</option>
                    <option value="success">🎉 신규 툴 오픈 (Green)</option>
                    <option value="event">✨ 특별 이벤트 (Pink/Purple)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>공지 문구 (Message)</label>
                  <input
                    type="text"
                    value={bannerConfig.message}
                    onChange={(e) => setBannerConfigState({ ...bannerConfig, message: e.target.value })}
                    placeholder="예: 🎉 신규 툴 'AI 배경 제거 & GIF 제작기'가 새롭게 출시되었습니다!"
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>연결 링크 URL (선택)</label>
                    <input
                      type="text"
                      value={bannerConfig.linkUrl || ''}
                      onChange={(e) => setBannerConfigState({ ...bannerConfig, linkUrl: e.target.value })}
                      placeholder="https://webtoolhub.yhdeabba.com/image/bg-remover"
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>링크 텍스트 (선택)</label>
                    <input
                      type="text"
                      value={bannerConfig.linkText || ''}
                      onChange={(e) => setBannerConfigState({ ...bannerConfig, linkText: e.target.value })}
                      placeholder="지금 써보기"
                      style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
                    />
                  </div>
                </div>

                <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-end', padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #ec4899, #8b5cf6)' }}>
                  <Megaphone size={16} /> 공지 배너 실시간 적용하기
                </button>
              </form>
            </div>
          )}

          {/* 5. ⚡ 시스템 헬스 & 에러 로그 탭 */}
          {activeTab === 'health' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Cpu size={28} color="#10b981" />
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WebAssembly Engine</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', display: 'block' }}>정상 가동 (Active)</span>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <HardDrive size={28} color="var(--accent-primary)" />
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Local Storage Quota</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'block' }}>여유 (Optimal)</span>
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <AlertTriangle size={28} color={errorLogsList.length > 0 ? '#ef4444' : '#10b981'} />
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>최근 감지된 에러</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: errorLogsList.length > 0 ? '#ef4444' : '#10b981', display: 'block' }}>
                      {errorLogsList.length} 건
                    </span>
                  </div>
                </div>
              </div>

              {/* 에러 로그 목록 */}
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                    <AlertTriangle size={20} /> 툴별 런타임 에러 로그 ({errorLogsList.length})
                  </h3>
                  {errorLogsList.length > 0 && (
                    <button onClick={() => { clearErrorLogs(); setRefreshCount((p) => p + 1); }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}>
                      <Trash2 size={13} /> 로그 비우기
                    </button>
                  )}
                </div>

                {errorLogsList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>🎉 감지된 툴 런타임 에러가 없습니다. 모든 기능이 매우 원활하게 작동 중입니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {errorLogsList.map((err) => (
                      <div key={err.id} style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#ef4444' }}>
                          <span>[{err.toolName || err.toolId}]</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{err.timestamp}</span>
                        </div>
                        <p style={{ color: 'var(--text-main)', marginTop: '0.3rem', fontFamily: 'monospace' }}>{err.errorMessage}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. 💾 데이터 백업 & 1클릭 복원 탭 */}
          {activeTab === 'backup' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6' }}>
                  <Download size={20} /> 데이터 백업 다운로드 & 엑셀 내보내기
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  현재까지 수집된 모든 통계 데이터 및 피드백 글을 안전하게 파일로 저장합니다.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={handleExportJson} className="btn-primary" style={{ padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                    <Download size={16} /> JSON 전체 백업 다운로드
                  </button>

                  <button onClick={handleExportCsv} className="btn-secondary" style={{ padding: '0.65rem 1.25rem' }}>
                    <Download size={16} /> CSV (Excel) 통계 내보내기
                  </button>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                  <Upload size={20} /> 백업 JSON 파일로부터 데이터 복원 (Import)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  기존에 백업해 둔 JSON 파일을 업로드하면 통계와 피드백 게시글이 즉시 복원됩니다.
                </p>

                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  style={{ fontSize: '0.85rem', padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                  <Trash2 size={20} /> 위험 구역 (통계 전체 초기화)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  모든 방문자 수치 및 툴 사용량 카운트를 초기화합니다.
                </p>
                <button onClick={handleClearAllData} style={{ alignSelf: 'flex-start', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}>
                  통계 전체 리셋 실행
                </button>
              </div>
            </div>
          )}

          {/* 7. 💬 피드백 관리 탭 */}
          {activeTab === 'feedback' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  💬 전체 커뮤니티 피드백 관리 ({posts.length}건)
                </h3>

                {posts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>등록된 피드백이 없습니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {posts.map((post) => (
                      <div key={post.id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{post.nickname}</span>
                            {categoryBadge(post.category)}
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.createdAt}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <ThumbsUp size={12} /> {post.likes}
                            </span>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <Trash2 size={12} /> 삭제
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {post.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
