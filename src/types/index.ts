import type { Language } from '../config/i18n';

export type ToolCategory = 'pdf' | 'media' | 'image' | 'text' | 'community';

export interface ToolItem {
  id: string;
  title: string; // 기본 fallback 타이틀
  description: string; // 기본 fallback 설명
  titleMap: Record<Language, string>; // 5개 국어 동적 타이틀 Map
  descriptionMap: Record<Language, string>; // 5개 국어 동적 설명 Map
  category: ToolCategory;
  path: string;
  iconName: string;
  badgeText?: string;
  badgeTextMap?: Record<Language, string>;
  isNew?: boolean;
  isPopular?: boolean;
  metaKeywords: string[];
}

export interface AdUnitProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
  className?: string;
}

export interface PdfProcessingOptions {
  pageNumbers?: number[];
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  quality?: number;
}

export interface FeedbackPost {
  id: string;
  nickname: string;
  passwordHash: string;
  category: 'bug' | 'feature' | 'general';
  content: string;
  createdAt: string;
  likes: number;
}
