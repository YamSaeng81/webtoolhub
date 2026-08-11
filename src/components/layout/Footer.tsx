import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', marginTop: 'auto', padding: '2.5rem 1.5rem 1.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
              Web<span className="gradient-text">ToolHub</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              사용자의 개인정보를 최우선으로 생각하는 100% 클라이언트 기반 무제한 무료 웹 유틸리티 서비스입니다.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>보안 및 프라이버시 약속</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 500 }}>
                <ShieldCheck size={16} /> 100% 브라우저 메모리 내부 직접 처리
              </span>
              <span>• 서버 업로드 및 저장 파일 0개</span>
              <span>• 처리 완료 후 브라우저 메모리 즉시 소멸</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>약관 및 정책 (AdSense Ready)</h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href="#privacy" style={{ textDecoration: 'underline' }}>개인정보 처리방침</a>
              <a href="#terms" style={{ textDecoration: 'underline' }}>이용약관</a>
              <a href="#contact" style={{ textDecoration: 'underline' }}>문의하기</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', gap: '0.5rem' }}>
          <span>© 2026 WebToolHub. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Crafted with <Heart size={14} color="#ec4899" fill="#ec4899" /> for fast & safe web tools
          </span>
        </div>

      </div>
    </footer>
  );
};
