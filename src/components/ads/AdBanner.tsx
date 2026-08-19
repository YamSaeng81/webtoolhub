import React, { useState, useEffect } from 'react';
import type { AdUnitProps } from '../../types';
import { trackAdImpression, trackAdClick, getAdsEnabled } from '../../utils/analytics';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdBanner: React.FC<AdUnitProps> = ({
  slotId = 'default-slot',
  format = 'auto',
  style,
  className,
}) => {
  const [adsEnabled, setAdsEnabledState] = useState<boolean>(() => getAdsEnabled());

  useEffect(() => {
    const handleAdsToggle = () => {
      setAdsEnabledState(getAdsEnabled());
    };

    window.addEventListener('webtoolhub_ads_toggle_updated', handleAdsToggle);
    return () => {
      window.removeEventListener('webtoolhub_ads_toggle_updated', handleAdsToggle);
    };
  }, []);

  useEffect(() => {
    if (!adsEnabled) return;
    trackAdImpression(slotId);
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // 광고 푸시 예외 핸들링
    }
  }, [slotId, adsEnabled]);

  // 관리자가 광고를 비활성화한 경우 렌더링하지 않음 ⭐
  if (!adsEnabled) {
    return null;
  }

  return (
    <div
      className={`ad-container ${className || ''}`}
      onClick={() => trackAdClick(slotId)}
      style={{
        margin: '1rem 0',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Google AdSense 실전 광고 유닛 (게시자 ID: ca-pub-8444978612329175) */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: '90px' }}
        data-ad-client="ca-pub-8444978612329175"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
        📢 ADVERTISEMENT (Google AdSense)
      </span>
    </div>
  );
};
