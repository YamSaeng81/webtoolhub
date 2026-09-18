import React, { useState } from 'react';
import { BLOG_ARTICLES } from '../../data/blogArticles';
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface BlogListPageProps {
  onNavigate: (path: string) => void;
}

export const BlogListPage: React.FC<BlogListPageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const categories = ['전체', 'PDF 가이드', '이미지 팁', '문서 & 취업'];

  const filtered = selectedCategory === '전체'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* 헤더 배너 */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1))' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(99,102,241,0.2)', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem' }}>
          <Sparkles size={14} /> WebToolHub 테크 & 라이프 매거진
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.8rem', color: 'var(--text-main)' }}>
          스마트 웹 유틸리티 실전 가이드 & 칼럼
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto' }}>
          PDF 편집, 이미지 가공, 전자책 제작, 문서 최적화 등 실무와 일상에서 유용한 전문 테크 팁을 전해드립니다.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: '20px' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 아티클 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((article) => (
          <article
            key={article.id}
            onClick={() => onNavigate(`/blog/${article.slug}`)}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{article.coverEmoji}</span>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {article.category}
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: '1.5', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                {article.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {article.summary}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {article.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} /> {article.readTime}</span>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                읽기 <ArrowRight size={14} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
