import React, { useState, useEffect } from 'react';
import { TOOLS_REGISTRY } from '../../config/toolsRegistry';
import { useLanguage } from '../../context/LanguageContext';
import { isToolEnabled } from '../../utils/analytics';
import {
  Home,
  FileText,
  Image as ImageIcon,
  Film,
  Type,
  MessageSquare,
  X,
  Layers,
  Minimize2,
  Scissors,
  RotateCw,
  ShieldCheck,
  FileImage,
  ScanText,
  Crop,
  RefreshCcw,
  Maximize2,
  Sparkles,
  Music,
  Video,
  AlignLeft,
  Code,
  FileCode,
} from 'lucide-react';
import type { ToolCategory } from '../../types';

interface MobileBottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, onNavigate }) => {
  const { language, t } = useLanguage();
  const [activeBottomSheet, setActiveBottomSheet] = useState<ToolCategory | null>(null);
  const [, setToggleUpdate] = useState<number>(0);

  useEffect(() => {
    const handleToggle = () => setToggleUpdate((p) => p + 1);
    window.addEventListener('webtoolhub_feature_toggle_updated', handleToggle);
    return () => window.removeEventListener('webtoolhub_feature_toggle_updated', handleToggle);
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Layers': return <Layers size={18} />;
      case 'Minimize2': return <Minimize2 size={18} />;
      case 'Scissors': return <Scissors size={18} />;
      case 'FileText': return <FileText size={18} />;
      case 'RotateCw': return <RotateCw size={18} />;
      case 'ShieldCheck': return <ShieldCheck size={18} />;
      case 'FileImage': return <FileImage size={18} />;
      case 'ScanText': return <ScanText size={18} />;
      case 'Crop': return <Crop size={18} />;
      case 'RefreshCcw': return <RefreshCcw size={18} />;
      case 'Maximize2': return <Maximize2 size={18} />;
      case 'Sparkles': return <Sparkles size={18} />;
      case 'Music': return <Music size={18} />;
      case 'Film': return <Film size={18} />;
      case 'Video': return <Video size={18} />;
      case 'AlignLeft': return <AlignLeft size={18} />;
      case 'Code': return <Code size={18} />;
      case 'FileCode': return <FileCode size={18} />;
      case 'MessageSquare': return <MessageSquare size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  // 5개 국어 1:1 동적 연동 라벨 맵 ⭐
  const tabLabels = {
    ko: { home: '홈', pdf: 'PDF', image: '이미지', media: '미디어', text: '텍스트', community: '소통' },
    en: { home: 'Home', pdf: 'PDF', image: 'Image', media: 'Media', text: 'Text', community: 'Feedback' },
    es: { home: 'Inicio', pdf: 'PDF', image: 'Imagen', media: 'Medios', text: 'Texto', community: 'Foro' },
    zh: { home: '首页', pdf: 'PDF', image: '图片', media: '媒体', text: '文本', community: '反馈' },
    ja: { home: 'ホーム', pdf: 'PDF', image: '画像', media: 'メディア', text: 'テキスト', community: '掲示板' },
  }[language] || { home: 'Home', pdf: 'PDF', image: 'Image', media: 'Media', text: 'Text', community: 'Feedback' };

  // 각 카테고리별 활성 도구 수 계산 ⭐
  const pdfEnabledCount = TOOLS_REGISTRY.filter((t) => t.category === 'pdf' && isToolEnabled(t.id)).length;
  const imageEnabledCount = TOOLS_REGISTRY.filter((t) => t.category === 'image' && isToolEnabled(t.id)).length;
  const mediaEnabledCount = TOOLS_REGISTRY.filter((t) => t.category === 'media' && isToolEnabled(t.id)).length;
  const textEnabledCount = TOOLS_REGISTRY.filter((t) => t.category === 'text' && isToolEnabled(t.id)).length;
  const communityEnabled = isToolEnabled('feedback-board');

  const rawNavItems: { key: string; label: string; icon: React.ReactNode; category?: ToolCategory; path?: string; visible: boolean }[] = [
    { key: 'home', label: tabLabels.home, icon: <Home size={20} />, path: '/', visible: true },
    { key: 'pdf', label: tabLabels.pdf, icon: <FileText size={20} />, category: 'pdf', visible: pdfEnabledCount > 0 },
    { key: 'image', label: tabLabels.image, icon: <ImageIcon size={20} />, category: 'image', visible: imageEnabledCount > 0 },
    { key: 'media', label: tabLabels.media, icon: <Film size={20} />, category: 'media', visible: mediaEnabledCount > 0 },
    { key: 'text', label: tabLabels.text, icon: <Type size={20} />, category: 'text', visible: textEnabledCount > 0 },
    { key: 'community', label: tabLabels.community, icon: <MessageSquare size={20} />, path: '/community/feedback', visible: communityEnabled },
  ];

  // 활성 툴이 0개인 카테고리는 모바일 탭 바에서도 완전히 숨김 ⭐
  const navItems = rawNavItems.filter((item) => item.visible);

  const categoryTitles = {
    pdf: t.pdfCategoryTitle,
    image: t.imageCategoryTitle,
    media: t.mediaCategoryTitle,
    text: t.textCategoryTitle,
    community: t.communityCategoryTitle,
  };

  const handleTabClick = (item: typeof navItems[0]) => {
    if (item.path) {
      setActiveBottomSheet(null);
      onNavigate(item.path);
    } else if (item.category) {
      if (activeBottomSheet === item.category) {
        setActiveBottomSheet(null);
      } else {
        setActiveBottomSheet(item.category);
      }
    }
  };

  const handleSubmenuSelect = (path: string) => {
    setActiveBottomSheet(null);
    onNavigate(path);
  };

  const activeCategoryTools = activeBottomSheet
    ? TOOLS_REGISTRY.filter((tool) => tool.category === activeBottomSheet && isToolEnabled(tool.id))
    : [];

  return (
    <>
      {/* 📱 1. 모바일 하단 고정 탭 바 (Mobile Bottom Nav Bar) ⭐ */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const isTabActive = item.path
            ? currentPath === item.path
            : activeBottomSheet === item.category;

          return (
            <button
              key={item.key}
              onClick={() => handleTabClick(item)}
              className={`mobile-tab-item ${isTabActive ? 'active' : ''}`}
            >
              <div className="tab-icon">{item.icon}</div>
              <span className="tab-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 📱 2. 모바일 하단 바텀 시트 소메뉴 팝업 (Mobile Submenu Bottom Sheet) ⭐ */}
      {activeBottomSheet && activeCategoryTools.length > 0 && (
        <div className="bottom-sheet-overlay" onClick={() => setActiveBottomSheet(null)}>
          <div className="bottom-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-handle" />
            
            <div className="bottom-sheet-header">
              <h3 className="bottom-sheet-title">
                {categoryTitles[activeBottomSheet]} <span className="sub-count">({activeCategoryTools.length})</span>
              </h3>
              <button className="bottom-sheet-close" onClick={() => setActiveBottomSheet(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="bottom-sheet-grid">
              {activeCategoryTools.map((tool) => {
                const isSelected = currentPath === tool.path;
                const localizedTitle = tool.titleMap[language] || tool.title;

                return (
                  <button
                    key={tool.id}
                    onClick={() => handleSubmenuSelect(tool.path)}
                    className={`bottom-sheet-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="item-icon-box">{renderIcon(tool.iconName)}</div>
                    <span className="item-title">{localizedTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
