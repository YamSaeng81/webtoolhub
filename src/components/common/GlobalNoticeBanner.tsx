import React, { useState, useEffect } from 'react';
import { getGlobalBanner, type GlobalBannerConfig } from '../../utils/analytics';
import { Megaphone, AlertTriangle, Sparkles, CheckCircle2, X, ExternalLink } from 'lucide-react';

export const GlobalNoticeBanner: React.FC = () => {
  const [banner, setBanner] = useState<GlobalBannerConfig>(() => getGlobalBanner());
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => {
      setBanner(getGlobalBanner());
      setIsDismissed(false);
    };

    window.addEventListener('webtoolhub_banner_updated', handleUpdate);
    return () => window.removeEventListener('webtoolhub_banner_updated', handleUpdate);
  }, []);

  if (!banner.enabled || !banner.message || isDismissed) {
    return null;
  }

  const getStyle = () => {
    switch (banner.type) {
      case 'warning':
        return {
          bg: 'linear-gradient(90deg, rgba(239, 68, 68, 0.9), rgba(245, 158, 11, 0.9))',
          icon: <AlertTriangle size={18} />,
        };
      case 'success':
        return {
          bg: 'linear-gradient(90deg, rgba(16, 185, 129, 0.9), rgba(59, 130, 246, 0.9))',
          icon: <CheckCircle2 size={18} />,
        };
      case 'event':
        return {
          bg: 'linear-gradient(90deg, rgba(236, 72, 153, 0.9), rgba(139, 92, 246, 0.9))',
          icon: <Sparkles size={18} />,
        };
      default:
        return {
          bg: 'linear-gradient(90deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))',
          icon: <Megaphone size={18} />,
        };
    }
  };

  const styleConfig = getStyle();

  return (
    <div
      style={{
        background: styleConfig.bg,
        color: '#ffffff',
        padding: '0.6rem 1.5rem',
        fontSize: '0.88rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {styleConfig.icon}
        <span>{banner.message}</span>
        {banner.linkUrl && (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#ffffff',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginLeft: '0.3rem',
              fontWeight: 700,
            }}
          >
            {banner.linkText || '자세히 보기'} <ExternalLink size={12} />
          </a>
        )}
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8,
        }}
        title="닫기"
      >
        <X size={16} />
      </button>
    </div>
  );
};
