import React from 'react';
import { BLOG_ARTICLES } from '../../data/blogArticles';
import { ArrowLeft, Calendar, Clock, User, Share2, Wrench } from 'lucide-react';

interface BlogDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug, onNavigate }) => {
  const article = BLOG_ARTICLES.find((a) => a.slug === slug) || BLOG_ARTICLES[0];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('아티클 링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button onClick={() => onNavigate('/blog')} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
        <ArrowLeft size={16} /> 목록으로 돌아가기
      </button>

      <article className="glass-panel" style={{ padding: '3rem 2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(99,102,241,0.15)', padding: '0.3rem 0.75rem', borderRadius: '20px', display: 'inline-block', marginBottom: '1rem' }}>
            {article.category}
          </span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: '1.4', color: 'var(--text-main)', marginBottom: '1.2rem' }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={15} /> {article.author}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={15} /> {article.date}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={15} /> {article.readTime}</span>
            </div>
            <button onClick={handleShare} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
              <Share2 size={14} /> 공유하기
            </button>
          </div>
        </div>

        {/* 본문 콘텐츠 */}
        <div
          style={{ lineHeight: '1.9', fontSize: '1.05rem', color: 'var(--text-main)' }}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {/* 관련 무료 웹툴 추천 배너 */}
        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.15))', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
              <Wrench size={18} color="var(--accent-primary)" /> 지금 바로 실전에서 써보세요!
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              설치나 회원가입 없이 100% 브라우저 메모리에서 안전하게 무료 처리됩니다.
            </p>
          </div>
          <button onClick={() => onNavigate(article.relatedToolPath)} className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>
            {article.relatedToolName}
          </button>
        </div>
      </article>
    </div>
  );
};
