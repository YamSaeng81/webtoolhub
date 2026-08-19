import React from 'react';
import { Wrench, ArrowLeft, ShieldAlert } from 'lucide-react';

interface MaintenanceNoticeProps {
  toolName?: string;
  onGoHome: () => void;
}

export const MaintenanceNotice: React.FC<MaintenanceNoticeProps> = ({ toolName, onGoHome }) => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', padding: '2rem' }}>
      <div
        className="glass-panel"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Wrench size={32} />
        </div>

        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {toolName ? `"${toolName}" 점검 중` : '기능 점검 및 업데이트 중'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
            더 안정적이고 빠른 서비스 제공을 위해 관리자에 의해 일시적으로 점검 중입니다.<br />
            다른 도구들은 정상적으로 이용하실 수 있습니다.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
          <ShieldAlert size={14} /> 관리자 설정에 의해 일시 비활성화됨
        </div>

        <button
          onClick={onGoHome}
          className="btn-primary"
          style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} /> 메인 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};
