import React, { useState, useEffect } from 'react';
import { Wrench, Sun, Moon, Search, Layers, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../config/i18n';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onSearch }) => {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('/')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
          id="brand-logo"
        >
          <div style={{ background: 'var(--accent-gradient)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Wrench size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em' }}>
              Web<span className="gradient-text">ToolHub</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t.brandSub}
            </span>
          </div>
        </div>

        {/* Global Tool Search Bar */}
        <div style={{ flex: 1, maxWidth: '420px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          
          {/* Language Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
            <Globe size={16} color="var(--accent-primary)" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
              id="language-selector"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code} style={{ background: 'var(--bg-primary)', color: 'var(--text-main)' }}>
                  {opt.flag} {opt.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => onNavigate('/')}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
          >
            <Layers size={16} />
            <span>{t.allTools}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%', justifyContent: 'center' }}
            title="테마 전환"
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

      </div>
    </header>
  );
};
