import React, { useState, useEffect } from 'react';
import { TOOLS_REGISTRY } from '../config/toolsRegistry';
import { AdBanner } from '../components/ads/AdBanner';
import { PrivacyBadge } from '../components/common/PrivacyBadge';
import { useLanguage } from '../context/LanguageContext';
import { isToolEnabled } from '../utils/analytics';
import {
  Layers,
  Minimize2,
  Scissors,
  FileText,
  RotateCw,
  ShieldCheck,
  FileImage,
  ScanText,
  Crop,
  RefreshCcw,
  Maximize2,
  Sparkles,
  Music,
  AlignLeft,
  Code,
  FileCode,
  MessageSquare,
  Film,
  Video,
  Shield,
  Zap,
  Lock,
  ArrowRight,
} from 'lucide-react';
import type { ToolCategory } from '../types';

interface HomeProps {
  onNavigate: (path: string) => void;
  searchQuery?: string;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, searchQuery = '' }) => {
  const { language, t } = useLanguage();
  const [, setToggleUpdate] = useState<number>(0);

  useEffect(() => {
    const handleToggle = () => setToggleUpdate((p) => p + 1);
    window.addEventListener('webtoolhub_feature_toggle_updated', handleToggle);
    return () => window.removeEventListener('webtoolhub_feature_toggle_updated', handleToggle);
  }, []);

  // 활성화된 도구만 검색 및 목록에 포함 ⭐ (비활성화 도구 완전 숨김)
  const filteredTools = TOOLS_REGISTRY.filter(
    (tool) =>
      isToolEnabled(tool.id) &&
      (tool.titleMap[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.descriptionMap[language]?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.metaKeywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers size={24} />;
      case 'Minimize2': return <Minimize2 size={24} />;
      case 'Scissors': return <Scissors size={24} />;
      case 'FileText': return <FileText size={24} />;
      case 'RotateCw': return <RotateCw size={24} />;
      case 'ShieldCheck': return <ShieldCheck size={24} />;
      case 'FileImage': return <FileImage size={24} />;
      case 'ScanText': return <ScanText size={24} />;
      case 'Crop': return <Crop size={24} />;
      case 'RefreshCcw': return <RefreshCcw size={24} />;
      case 'Maximize2': return <Maximize2 size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      case 'Music': return <Music size={24} />;
      case 'Film': return <Film size={24} />;
      case 'Video': return <Video size={24} />;
      case 'AlignLeft': return <AlignLeft size={24} />;
      case 'Code': return <Code size={24} />;
      case 'FileCode': return <FileCode size={24} />;
      case 'MessageSquare': return <MessageSquare size={24} />;
      default: return <Sparkles size={24} />;
    }
  };

  const categories: ToolCategory[] = ['pdf', 'image', 'media', 'text', 'community'];

  const categoryTitles = {
    pdf: t.pdfCategoryTitle,
    image: t.imageCategoryTitle,
    media: t.mediaCategoryTitle,
    text: t.textCategoryTitle,
    community: t.communityCategoryTitle,
  };

  const categoryDescs = {
    pdf: t.pdfCategoryDesc,
    image: t.imageCategoryDesc,
    media: t.mediaCategoryDesc,
    text: t.textCategoryDesc,
    community: t.communityCategoryDesc,
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hero Section */}
      <section className="glass-panel" style={{ padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <PrivacyBadge text={t.privacyBadge} />
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.25 }}>
          {t.heroTitle} <span className="gradient-text">{t.heroHighlight}</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '700px', lineHeight: 1.6 }}>
          {t.heroDesc}
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16} color="var(--accent-primary)" /> {t.featSpeed}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={16} color="#10b981" /> {t.featSecurity}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={16} color="#ec4899" /> {t.featFree}
          </span>
        </div>
      </section>

      {/* Top Banner AdSense */}
      <AdBanner slotId="home-top-ad" format="auto" />

      {/* Tools Catalog */}
      {searchQuery ? (
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            🔍 "{searchQuery}" ({filteredTools.length})
          </h2>
          {filteredTools.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
              검색 조건에 맞는 활성 도구가 없습니다.
            </div>
          ) : (
            <div className="tools-grid">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="glass-panel tool-card"
                  onClick={() => onNavigate(tool.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tool-icon">{renderIcon(tool.iconName)}</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {tool.titleMap[language] || tool.title}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1 }}>
                    {tool.descriptionMap[language] || tool.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                    Open Tool <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        categories.map((catKey) => {
          // 활성화된 도구만 필터링 ⭐
          const categoryTools = TOOLS_REGISTRY.filter(
            (tItem) => tItem.category === catKey && isToolEnabled(tItem.id)
          );

          // 카테고리 내 활성화된 도구가 0개면 대메뉴 섹션 자체를 완전히 숨김 ⭐
          if (categoryTools.length === 0) return null;

          return (
            <section key={catKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {categoryTitles[catKey]}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{categoryDescs[catKey]}</p>
              </div>

              <div className="tools-grid">
                {categoryTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="glass-panel tool-card"
                    onClick={() => onNavigate(tool.path)}
                    style={{ cursor: 'pointer' }}
                  >
                    {tool.isPopular && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'var(--accent-gradient)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        Popular
                      </span>
                    )}
                    {tool.isNew && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        NEW
                      </span>
                    )}
                    <div className="tool-icon">{renderIcon(tool.iconName)}</div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {tool.titleMap[language] || tool.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1 }}>
                      {tool.descriptionMap[language] || tool.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.5rem' }}>
                      Open Tool <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}

      {/* In-feed Bottom AdSense */}
      <AdBanner slotId="home-bottom-ad" format="auto" />

    </div>
  );
};
