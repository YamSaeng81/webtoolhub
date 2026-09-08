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

  const isNumericSlot = /^\d{10,}$/.test(slotId);

  useEffect(() => {
    if (!adsEnabled || !isNumericSlot) return;
    trackAdImpression(slotId);
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // 광고 푸시 예외 핸들링
    }
  }, [slotId, adsEnabled, isNumericSlot]);


  // 🛡️ 구글 애드센스 정책 준수 및 심사 통과 보호 로직:
  // slotId가 구글 공식 10자리 숫자 ID(/^\d{10,}$/)가 아니면, 빈 공백 박스 및 "게시자 콘텐츠 없는 화면에 광고 게재" 위반을 막기 위해 렌더링하지 않음!
  if (!adsEnabled || !isNumericSlot) {
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
