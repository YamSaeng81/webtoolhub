import React, { useState, useEffect } from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { AdBanner } from '../../components/ads/AdBanner';
import { ToolGuideSection } from '../../components/common/ToolGuideSection';

import { useLanguage } from '../../context/LanguageContext';
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
  Eye,
  EyeOff,
  Globe,
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [nickname, setNickname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'general'>('feature');
  const [content, setContent] = useState<string>('');

  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  const [authNick, setAuthNick] = useState<string>('');
  const [authPass, setAuthPass] = useState<string>('');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>(false);

  const defaultPosts: FeedbackPost[] = [
    {
      id: 'post-1',
      nickname: 'WebToolHub Team',
      passwordHash: 'secured',
      category: 'general',
      content: 'WebToolHub 소통 & 피드백 게시판에 오신 것을 환영합니다! 추가를 원하시는 도구나 개선 의견을 자유롭게 남겨주세요.',
      createdAt: '2026-08-11',
      likes: 15,
    },
  ];

  useEffect(() => {
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
      alert('일치하는 닉네임과 비밀번호의 작성 글을 찾을 수 없습니다.');
      setIsUserAuthenticated(false);
    }
  };

  const handleDelete = (id: string, passwordHash: string) => {
    const enteredPass = prompt('게시글 등록 시 설정한 비밀번호를 입력해 주세요:');
    if (enteredPass === passwordHash || (isUserAuthenticated && authPass === passwordHash)) {
      const nextPosts = posts.filter((p) => p.id !== id);
      savePosts(nextPosts);
      alert('게시글이 삭제되었습니다.');
    } else if (enteredPass !== null) {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLike = (id: string) => {
    const nextPosts = posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p));
    savePosts(nextPosts);
  };

  const visiblePosts = viewMode === 'all'
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

      {/* 뷰 모드 탭 (전체 글 보기 / 내가 쓴 글 보기) */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setViewMode('all')}
            className="btn-secondary"
            style={{
              border: viewMode === 'all' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              color: viewMode === 'all' ? 'var(--accent-primary)' : 'var(--text-main)',
              fontWeight: viewMode === 'all' ? 700 : 500,
            }}
          >
            <Globe size={16} /> 전체 글 보기
          </button>
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
        </div>

        {/* 유저 본인 글 인증 폼 */}
        {viewMode === 'my' && !isUserAuthenticated && (
          <form onSubmit={handleUserAuth} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>🔒 {t.nicknameLabel}:</span>
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
                <span>내가 작성한 글을 보려면 상단에서 닉네임과 비밀번호를 입력해 인증해 주세요.</span>
              </div>
            ) : (
              <span>등록된 피드백이 없습니다. 첫 번째 피드백을 남겨보세요!</span>
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
                    <ThumbsUp size={12} /> 좋아요 {post.likes}
                  </button>

                  <button
                    onClick={() => handleDelete(post.id, post.passwordHash)}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                  >
                    <Trash2 size={12} /> 삭제
                  </button>
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

      <ToolGuideSection
        toolId="feedback-board"
        toolTitle="익명 소통 & 신규 도구 요청 커뮤니티 (Feedback Board)"
        categoryName="커뮤니티 & 소통"
      />
    </div>
  );
};

