import React from 'react';
import { TOOLS_REGISTRY } from '../../config/toolsRegistry';
import { AdBanner } from '../ads/AdBanner';
import { useLanguage } from '../../context/LanguageContext';
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
} from 'lucide-react';
import type { ToolCategory } from '../../types';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { language, t } = useLanguage();

  // 모든 툴의 아이콘 1:1 고유 렌더링 (중복 0%) ⭐
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
      case 'AlignLeft': return <AlignLeft size={18} />;
      case 'Code': return <Code size={18} />;
      case 'FileCode': return <FileCode size={18} />;
      case 'MessageSquare': return <MessageSquare size={18} />;
      default: return <Sparkles size={18} />;
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

  return (
    <aside className="sidebar-container" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1.25rem', flexShrink: 0 }}>
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t.navTitle}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {categories.map((catKey) => {
            const categoryTools = TOOLS_REGISTRY.filter((tItem) => tItem.category === catKey);

            return (
              <div key={catKey}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.4rem' }}>
                  {categoryTitles[catKey]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {categoryTools.map((tool) => {
                    const isActive = currentPath === tool.path;
                    const localizedTitle = tool.titleMap[language] || tool.title;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => onNavigate(tool.path)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          background: isActive ? 'var(--accent-primary)' : 'transparent',
                          color: isActive ? '#ffffff' : 'var(--text-main)',
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 600 : 400,
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'var(--transition-fast)',
                        }}
                      >
                        {renderIcon(tool.iconName)}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {localizedTitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AdBanner slotId="sidebar-ad-1" format="rectangle" style={{ minHeight: '250px' }} />
    </aside>
  );
};
