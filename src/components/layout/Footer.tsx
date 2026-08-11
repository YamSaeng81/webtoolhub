import React from 'react';
import { Wrench, Shield, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', marginTop: '3rem', padding: '2.5rem 1.5rem', color: 'var(--text-muted)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('/')}>
            <div style={{ background: 'var(--accent-gradient)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Wrench size={18} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              Web<span className="gradient-text">ToolHub</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('/community/feedback')}>
              Privacy Policy
            </span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('/community/feedback')}>
              Terms of Service
            </span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('/community/feedback')}>
              Feedback Board
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Lock size={14} color="#10b981" /> 100% In-Browser Privacy Protection
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Shield size={14} color="var(--accent-primary)" /> Zero Server Storage
            </span>
          </div>

          <div>
            © 2026 WebToolHub. All rights reserved. Powered by Antigravity Engine.
          </div>
        </div>

      </div>
    </footer>
  );
};
