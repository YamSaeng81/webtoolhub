import React, { useState, useEffect } from 'react';
import { Wrench, Sun, Moon, Search, Layers, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../config/i18n';
import { trackSearchQuery } from '../../utils/analytics';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearch?: (query: string) => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onSearch, onToggleMobileMenu, isMobileMenuOpen }) => {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 검색어 트래킹 디바운스 (1.5초 후 트래킹)
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      trackSearchQuery(searchQuery);
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearch) onSearch(q);
  };

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          id="brand-logo"
        >
          <div style={{ background: 'var(--accent-gradient)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
            <Wrench size={20} />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
              Web<span className="gradient-text">ToolHub</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t.brandSub}
            </span>
          </div>
        </div>

        {/* Global Tool Search Bar (Desktop) */}
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }} className="desktop-search">
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Language Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <Globe size={15} color="var(--accent-primary)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
              id="language-selector"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code} style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
                  {opt.flag} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => onNavigate('/')}
            className="btn-secondary desktop-only-btn"
            style={{ borderRadius: 'var(--radius-full)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <Layers size={15} />
            <span>{t.allTools}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ width: '36px', height: '36px', minHeight: '36px', padding: 0, borderRadius: '50%', justifyContent: 'center', flexShrink: 0 }}
            title="테마 전환"
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 🍔 모바일 전용 햄버거 메뉴 버튼 ⭐ */}
          <button
            onClick={onToggleMobileMenu}
            className="btn-secondary mobile-hamburger-btn"
            style={{ width: '36px', height: '36px', minHeight: '36px', padding: 0, borderRadius: 'var(--radius-sm)', justifyContent: 'center', flexShrink: 0 }}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>
    </header>
  );
};
