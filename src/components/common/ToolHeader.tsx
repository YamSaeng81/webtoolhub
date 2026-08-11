import React from 'react';
import { PrivacyBadge } from './PrivacyBadge';
import { useLanguage } from '../../context/LanguageContext';
import { TOOLS_REGISTRY } from '../../config/toolsRegistry';

interface ToolHeaderProps {
  title: string;
  description: string;
  badgeText?: string;
  toolId?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ title, description, badgeText, toolId }) => {
  const { language, t } = useLanguage();

  // toolId가 전달되면 중앙 레지스트리의 titleMap과 descriptionMap에서 언어별 동적 텍스트 검색
  const matchedTool = toolId ? TOOLS_REGISTRY.find((item) => item.id === toolId) : null;
  const displayTitle = matchedTool ? matchedTool.titleMap[language] || title : title;
  const displayDescription = matchedTool ? matchedTool.descriptionMap[language] || description : description;

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{displayTitle}</h1>
          {badgeText && (
            <span style={{ background: 'var(--accent-gradient)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
              {badgeText}
            </span>
          )}
        </div>
        <PrivacyBadge text={t.privacyBadge} />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
        {displayDescription}
      </p>
    </div>
  );
};
