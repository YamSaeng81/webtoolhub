import React, { useState, useEffect } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { getAnalyticsSummary, resetToolStatCount } from '../../utils/analytics';
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
} from 'lucide-react';

async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_PASSWORD_HASH = '1f654b9d0e14bf9d7ef84976c66cf17f698a9fa6f164ce68971f11c750b2ed65';

export const AdminDashboardPage: React.FC = () => {
  const [adminPass, setAdminPass] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('webtoolhub_admin_auth') === 'true';
  });
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [, setRefreshCount] = useState<number>(0);

  // 실시간 통계 데이터 수집
  const statsSummary = getAnalyticsSummary();
  const toolStatsList = Object.values(statsSummary.toolStats || {}).sort((a, b) => b.count - a.count);
  const geoStatsList = Object.values(statsSummary.geoStats || {}).sort((a, b) => b.count - a.count);
  const deviceStatsList = Object.values(statsSummary.deviceStats || {}).sort((a, b) => b.count - a.count);
  const dailyHistoryList = Object.values(statsSummary.dailyHistory || {}).sort((a, b) => b.date.localeCompare(a.date));

  const totalToolExecCount = toolStatsList.reduce((acc, cur) => acc + cur.count, 0);

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
        title="통합 관리자 대시보드 (Admin Master)"
        description="실시간 트래픽, 방문자 통계, 툴 실행 현황 및 커뮤니티 피드백을 총괄 관리합니다."
        badgeText="Security Area"
      />

      {!isAuthenticated ? (
        /* 관리자 로그인 화면 */
        <div className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', maxWidth: '480px', margin: '2rem auto', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={32} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>관리자 인증 (Admin Login)</h2>
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
              <ShieldCheck size={18} /> 대시보드 접속하기
            </button>
          </form>
        </div>
      ) : (
        /* 관리자 인증 완료 화면 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* 상단 컨트롤 바 */}
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontWeight: 700, fontSize: '1.05rem' }}>
              <ShieldCheck size={20} /> 관리자 마스터 권한 활성화됨
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setRefreshCount((p) => p + 1)} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <RefreshCw size={14} /> 데이터 새로고침
              </button>
              <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ef4444' }}>
                <LogOut size={14} /> 로그아웃
              </button>
            </div>
          </div>

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

          {/* 🛠️ 툴별 실시간 사용량 랭킹 & 비율 바 차트 */}
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

          {/* 💬 커뮤니티 피드백 전체 관리 목록 */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💬 전체 피드백 관리 ({posts.length}건)
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
  );
};
