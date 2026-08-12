import React, { useState, useEffect } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
import { getAnalyticsSummary } from '../../utils/analytics';
import type { FeedbackPost } from '../../types';
import confetti from 'canvas-confetti';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Trash2,
  Sparkles,
  Bug,
  Lightbulb,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Key,
  BarChart3,
  Users,
  Wrench,
  Globe,
  Smartphone,
  Calendar,
  Layers,
} from 'lucide-react';

async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_PASSWORD_HASH = '1f654b9d0e14bf9d7ef84976c66cf17f698a9fa6f164ce68971f11c750b2ed65';

export const FeedbackPage: React.FC = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('feature');
  const [content, setContent] = useState<string>('');

  const [viewMode, setViewMode] = useState<'my' | 'admin'>('my');
  const [authNick, setAuthNick] = useState<string>('');
  const [authPass, setAuthPass] = useState<string>('');
  const [adminPass, setAdminPass] = useState<string>('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(false);

  // 고도화 통계 데이터 수집 ⭐
  const statsSummary = getAnalyticsSummary();
  const toolStatsList = Object.values(statsSummary.toolStats || {}).sort((a, b) => b.count - a.count);
  const geoStatsList = Object.values(statsSummary.geoStats || {}).sort((a, b) => b.count - a.count);
  const deviceStatsList = Object.values(statsSummary.deviceStats || {}).sort((a, b) => b.count - a.count);
  const dailyHistoryList = Object.values(statsSummary.dailyHistory || {}).sort((a, b) => b.date.localeCompare(a.date));

  const totalToolExecCount = toolStatsList.reduce((acc, cur) => acc + cur.count, 0);

  const defaultPosts: FeedbackPost[] = [
    {
      id: 'post-1',
      nickname: 'WebToolHub Admin',
      passwordHash: 'secured',
      category: 'general',
      content: 'Welcome to WebToolHub Feedback Board!',
      createdAt: '2026-08-11',
      likes: 15,
    },
  ];

  useEffect(() => {
    hashPassword('!Iloveyhde1').then((h) => {
      (window as any)._targetHash = h;
    });

    const saved = localStorage.getItem('webtoolhub_feedbacks');
    if (saved) {
      try {
        setPosts(JSON.parse(saved));
      } catch (e) {
        setPosts(defaultPosts);
      }
    } else {
      setPosts(defaultPosts);
      localStorage.setItem('webtoolhub_feedbacks', JSON.stringify(defaultPosts));
    }
  }, []);

  const savePosts = (newPosts: FeedbackPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('webtoolhub_feedbacks', JSON.stringify(newPosts));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim() || !content.trim()) {
      alert(t.nicknameLabel + ' ' + t.passwordLabel);
      return;
    }

    const newPost: FeedbackPost = {
      id: `post-${Date.now()}`,
      nickname: nickname.trim(),
      passwordHash: password.trim(),
      category,
      content: content.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    const nextPosts = [newPost, ...posts];
    savePosts(nextPosts);

    setAuthNick(nickname.trim());
    setAuthPass(password.trim());
    setIsUserAuthenticated(true);
    setViewMode('my');

    setContent('');
    setPassword('');
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const handleUserAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authNick || !authPass) return;
    const hasPost = posts.some((p) => p.nickname === authNick && p.passwordHash === authPass);
    if (hasPost) {
      setIsUserAuthenticated(true);
    } else {
      alert('No post matched your nickname and password.');
      setIsUserAuthenticated(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputHash = await hashPassword(adminPass);
    const targetHash = (window as any)._targetHash || ADMIN_PASSWORD_HASH;

    if (inputHash === targetHash) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Invalid admin password.');
      setIsAdminAuthenticated(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    const nextPosts = posts.filter((p) => p.id !== id);
    savePosts(nextPosts);
  };

  const handleLike = (id: string) => {
    const nextPosts = posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    savePosts(nextPosts);
  };

  const visiblePosts = isAdminAuthenticated && viewMode === 'admin'
    ? posts
    : isUserAuthenticated && viewMode === 'my'
    ? posts.filter((p) => p.nickname === authNick && p.passwordHash === authPass)
    : [];

  const categoryBadge = (cat: FeedbackPost['category']) => {
    switch (cat) {
      case 'bug':
        return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Bug size={12} /> Bug</span>;
      case 'feature':
        return <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Sparkles size={12} /> Feature</span>;
      default:
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Lightbulb size={12} /> General</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="feedback-board"
        title="소통 & 피드백 게시판"
        description="회원가입 없이 닉네임과 비밀번호로 자유롭게 신규 도구 요청 및 개선 의견을 남겨주세요."
        badgeText="익명 커뮤니티"
      />

      <AdBanner slotId="feedback-top" />

      {/* 작성 폼 */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={20} color="var(--accent-primary)" /> {t.feedbackSubmitTitle}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.nicknameLabel}</label>
            <input
              type="text"
              placeholder={t.nicknamePlaceholder}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.passwordLabel}</label>
            <input
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.categoryLabel}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
            >
              <option value="feature">{t.catFeature}</option>
              <option value="bug">{t.catBug}</option>
              <option value="general">{t.catGeneral}</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.contentLabel}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.contentPlaceholder}
            rows={4}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', marginTop: '0.3rem' }}
          />
        </div>

        <button className="btn-primary" type="submit" style={{ alignSelf: 'flex-end', padding: '0.6rem 1.5rem' }}>
          <Send size={16} /> {t.btnSubmit}
        </button>
      </form>

      {/* 뷰 모드 탭 */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setViewMode('my')}
            className="btn-secondary"
            style={{
              border: viewMode === 'my' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              color: viewMode === 'my' ? 'var(--accent-primary)' : 'var(--text-main)',
              fontWeight: viewMode === 'my' ? 700 : 500,
            }}
          >
            <UserCheck size={16} /> {t.myPostsViewBtn}
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className="btn-secondary"
            style={{
              border: viewMode === 'admin' ? '2px solid #ec4899' : '1px solid var(--border-color)',
              color: viewMode === 'admin' ? '#ec4899' : 'var(--text-main)',
              fontWeight: viewMode === 'admin' ? 700 : 500,
            }}
          >
            <Lock size={16} /> {t.adminMasterViewBtn}
          </button>
        </div>

        {/* 유저 본인 글 인증 폼 */}
        {viewMode === 'my' && !isUserAuthenticated && (
          <form onSubmit={handleUserAuth} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>🔒 {t.nicknameLabel}</span>
            <input
              type="text"
              placeholder={t.nicknameLabel}
              value={authNick}
              onChange={(e) => setAuthNick(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
            />
            <input
              type="password"
              placeholder={t.passwordLabel}
              value={authPass}
              onChange={(e) => setAuthPass(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
            />
            <button className="btn-secondary" type="submit" style={{ fontSize: '0.85rem' }}>
              <Eye size={14} /> {t.myPostsViewBtn}
            </button>
          </form>
        )}

        {/* 관리자 인증 폼 */}
        {viewMode === 'admin' && !isAdminAuthenticated && (
          <form onSubmit={handleAdminAuth} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ec4899' }}>🔑 Admin Master Key:</span>
            <input
              type="password"
              placeholder="Enter Admin Master Password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem' }}
            />
            <button className="btn-primary" type="submit" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              <Key size={14} /> Admin Login
            </button>
          </form>
        )}

        {/* 📊 고도화 관리자 마스터 실시간 통계 대시보드 ⭐ */}
        {viewMode === 'admin' && isAdminAuthenticated && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem', background: 'rgba(236, 72, 153, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={22} /> 📊 실시간 종합 통계 통합 대시보드 (Master Admin)
            </div>

            {/* 4대 주요 요약 지표 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Users size={16} color="#10b981" /> 오늘 순 방문자 (UV)
                </span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem', display: 'block' }}>
                  {statsSummary.todayVisitors || 1} 명
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <BarChart3 size={16} color="var(--accent-primary)" /> 총 페이지뷰 (PV)
                </span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem', display: 'block' }}>
                  {statsSummary.totalPageviews || 1} 회
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Layers size={16} color="#f59e0b" /> 총 툴 실행 횟수
                </span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem', display: 'block' }}>
                  {totalToolExecCount} 회
                </span>
              </div>

              <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  <Globe size={16} color="#ec4899" /> 감지된 접속 국가
                </span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ec4899', marginTop: '0.2rem', display: 'block' }}>
                  {geoStatsList.length || 1} 개국
                </span>
              </div>
            </div>

            {/* 📅 최근 일자별 방문자 히스토리 (Daily History) ⭐ */}
            <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
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

            {/* 🌍 접속 지역 (GeoIP) & 📱 디바이스 분할 위젯 ⭐ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* 접속 지역 (GeoIP) */}
              <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ec4899' }}>
                  <Globe size={18} /> 접속 국가 및 지역 정보 (GeoIP)
                </span>

                {geoStatsList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🇰🇷 대한민국 (Seoul, KR) - 100%</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {geoStatsList.map((geo) => (
                      <div key={geo.countryCode} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                        <span>{geo.flag} {geo.countryName} ({geo.city})</span>
                        <span style={{ fontWeight: 700, color: '#ec4899' }}>{geo.count}회 방문</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 접속 디바이스 & 브라우저 */}
              <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
                  <Smartphone size={18} /> 접속 기기 및 브라우저 (Device/OS)
                </span>

                {deviceStatsList.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>💻 Desktop (Chrome / Windows) - 100%</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {deviceStatsList.map((dev, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.4rem 0.8rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                        <span>📱 {dev.deviceType} ({dev.browser} / {dev.os})</span>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{dev.count}회</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🛠️ 15개 툴별 실시간 사용량 랭킹 & 비율 바 차트 ⭐ */}
            <div style={{ background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
                <Wrench size={18} /> 15개 툴별 실시간 사용량 랭킹 & 점유율 (%)
              </span>

              {toolStatsList.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  도구를 사용하면 랭킹과 점유율 바 차트가 실시간 업데이트됩니다.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {toolStatsList.map((st, idx) => {
                    const pct = totalToolExecCount > 0 ? Math.round((st.count / totalToolExecCount) * 100) : 0;
                    return (
                      <div key={st.toolId} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>#{idx + 1} {st.toolName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({st.toolId})</span></span>
                          <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{st.count}회 ({pct}%)</span>
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
      </div>

      {/* 게시글 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          💬 {t.postsHeader} ({visiblePosts.length})
        </h3>

        {visiblePosts.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
            {viewMode === 'my' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <EyeOff size={32} />
                <span>Verify your nickname and password above to view your private posts.</span>
              </div>
            ) : (
              <span>Login with admin password to view all posts.</span>
            )}
          </div>
        ) : (
          visiblePosts.map((post) => (
            <div key={post.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{post.nickname}</span>
                  {categoryBadge(post.category)}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.createdAt}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: 'var(--accent-primary)' }}
                  >
                    <ThumbsUp size={12} /> Like {post.likes}
                  </button>

                  {(isAdminAuthenticated || isUserAuthenticated) && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>
            </div>
          ))
        )}
      </div>

      <AdBanner slotId="feedback-bottom" />
    </div>
  );
};
