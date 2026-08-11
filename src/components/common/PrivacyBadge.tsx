import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface PrivacyBadgeProps {
  text?: string;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  text = '100% 브라우저 내 안전 처리 (서버 업로드 없음)',
}) => {
  return (
    <div className="privacy-badge">
      <ShieldCheck size={16} />
      <span>{text}</span>
    </div>
  );
};
