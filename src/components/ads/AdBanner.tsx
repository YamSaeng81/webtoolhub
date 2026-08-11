import React from 'react';
import type { AdUnitProps } from '../../types';

export const AdBanner: React.FC<AdUnitProps> = ({
  slotId = '0000000000',
  format = 'auto',
  style,
  className = '',
}) => {
  return (
    <div className={`adsense-unit ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
      <div className="adsense-placeholder-content">
        <span>📢 Google AdSense Banner Area ({format.toUpperCase()})</span>
      </div>
    </div>
  );
};
