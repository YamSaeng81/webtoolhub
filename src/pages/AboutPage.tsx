import React from 'react';
import { ToolHeader } from '../components/common/ToolHeader';
import { AdBanner } from '../components/ads/AdBanner';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Sparkles, Globe, Lock, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    ko: {
      title: 'WebToolHub 서비스 소개 (About Us)',
      subTitle: '서버 업로드 0%! 100% 브라우저 인메모리 기반 무료 스마트 웹 유틸리티 허브',
      introTitle: 'WebToolHub는 어떤 서비스인가요?',
      introDesc:
        'WebToolHub(웹툴허브)는 사용자의 개인정보와 파일 보안을 최우선으로 생각하는 차세대 웹 유틸리티 플랫폼입니다. PDF 병합/압축, AI 이미지 배경 제거, GIF 짤 제작, 동영상/오디오 변환, QR 코드 생성 등 24가지 이상의 필수 웹 툴을 회원가입이나 서버 업로드 없이 100% 브라우저 메모리 상에서 무료로 제공합니다.',
      feature1Title: '🔒 100% 브라우저 보안 (No Server Upload)',
      feature1Desc: '모든 파일 변환 및 AI 처리가 사용자의 웹 브라우저 내에서만 실행되어 소중한 문서와 이미지, 동영상이 외부 서버로 절대 전송되지 않습니다.',
      feature2Title: '⚡ 초고속 0.1초 처리 (WebAssembly & Web Workers)',
      feature2Desc: '최신 WebAssembly(WASM) 및 Web Worker 기술을 탑재하여 대용량 4K 동영상이나 수십 장의 PDF도 딜레이 없이 초고속으로 처리합니다.',
      feature3Title: '🌐 5개 국어 글로벌 다국어 지원',
      feature3Desc: '한국어, 영어, 스페인어, 중국어, 일본어 등 5개 국어를 지원하여 전 세계 누구나 직관적이고 편리하게 사용할 수 있습니다.',
    },
    en: {
      title: 'About WebToolHub',
      subTitle: '0% Server Upload! 100% Browser In-Memory Free Smart Web Utility Hub',
      introTitle: 'What is WebToolHub?',
      introDesc:
        'WebToolHub is a next-generation web utility platform that prioritizes user privacy and document security. We offer 24+ essential tools including PDF merge/compress, AI background removal, GIF maker, video/audio converter, and QR generator for free, running 100% inside your browser.',
      feature1Title: '🔒 100% Browser Privacy (No Server Upload)',
      feature1Desc: 'All document conversion and AI processing run exclusively inside your web browser. Your private files are never uploaded to any external server.',
      feature2Title: '⚡ Lightning Fast 0.1s Performance (WebAssembly)',
      feature2Desc: 'Powered by WebAssembly (WASM) and Web Workers, handling large 4K videos or multiple PDFs instantly without lag.',
      feature3Title: '🌐 5 Languages Global i18n Support',
      feature3Desc: 'Supporting English, Korean, Spanish, Chinese, and Japanese for an intuitive global user experience.',
    },
    es: {
      title: 'Acerca de WebToolHub',
      subTitle: '¡0% de carga en servidor! Centro de utilidades web inteligentes gratuito',
      introTitle: '¿Qué es WebToolHub?',
      introDesc:
        'WebToolHub es una plataforma de utilidades web de próxima generación que prioriza la privacidad del usuario. Ofrecemos más de 24 herramientas esenciales como PDF, eliminación de fondo AI, creador de GIF y convertidor de video 100% en el navegador.',
      feature1Title: '🔒 100% Privacidad en el navegador',
      feature1Desc: 'Todo el procesamiento de archivos se ejecuta exclusivamente en su navegador.',
      feature2Title: '⚡ Rendimiento súper rápido',
      feature2Desc: 'Impulsado por WebAssembly para una conversión instantánea.',
      feature3Title: '🌐 Soporte global en 5 idiomas',
      feature3Desc: 'Compatible con español, inglés, coreano, chino y japonés.',
    },
    zh: {
      title: '关于 WebToolHub (About Us)',
      subTitle: '0% 服务器上传！100% 浏览器内存式免费智能 Web 工具中心',
      introTitle: '什么是 WebToolHub？',
      introDesc:
        'WebToolHub 是优先考虑用户隐私和文件安全的新一代 Web 工具平台。我们在浏览器内部 100% 免费提供 24+ 种必需工具，包括 PDF 合并/压缩、AI 背景消除、GIF 制作、视频/音频转换和 QR 码生成。',
      feature1Title: '🔒 100% 浏览器隐私保护 (无服务器上传)',
      feature1Desc: '所有文件转换和 AI 处理均仅在您的浏览器内运行。',
      feature2Title: '⚡ 0.1 秒极速性能 (WebAssembly)',
      feature2Desc: '搭载 WebAssembly (WASM) 技术，无延迟即时处理。',
      feature3Title: '🌐 5 种语言全球化支持',
      feature3Desc: '支持中文、英文、韩文、西班牙文和日文。',
    },
    ja: {
      title: 'WebToolHubについて (About Us)',
      subTitle: 'サーバーアップロード0%！100%ブラウザメモリベースの無料スマートWebユーティリティ',
      introTitle: 'WebToolHubとは？',
      introDesc:
        'WebToolHubは、ユーザーのプライバシーとセキュリティを最優先する次世代Webユーティリティプラットフォームです。PDF結合/圧縮、AI背景削除、GIF作成、動画/音声変換、QRコード生成など24種類以上の必須Webツールをブラウザ内で完全無料で提供します。',
      feature1Title: '🔒 100% ブラウザプライバシー (サーバー送信なし)',
      feature1Desc: 'すべての処理がブラウザ内のみで実行され、外部サーバーにファイルが送信されません。',
      feature2Title: '⚡ 超高速0.1秒処理 (WebAssembly搭載)',
      feature2Desc: '最新のWebAssembly技術で大容量動画やPDFも即座に処理。',
      feature3Title: '🌐 5ヶ国語グローバル対応',
      feature3Desc: '日本語、英語、韓国語、スペイン語、中国語に対応。',
    },
  }[language] || {
    title: 'About WebToolHub',
    subTitle: '0% Server Upload! 100% Browser In-Memory Free Smart Web Utility Hub',
    introTitle: 'What is WebToolHub?',
    introDesc:
      'WebToolHub is a next-generation web utility platform that prioritizes user privacy and document security. We offer 24+ essential tools including PDF merge/compress, AI background removal, GIF maker, video/audio converter, and QR generator for free, running 100% inside your browser.',
    feature1Title: '🔒 100% Browser Privacy (No Server Upload)',
    feature1Desc: 'All document conversion and AI processing run exclusively inside your web browser.',
    feature2Title: '⚡ Lightning Fast 0.1s Performance (WebAssembly)',
    feature2Desc: 'Powered by WebAssembly (WASM) and Web Workers, handling files instantly without lag.',
    feature3Title: '🌐 5 Languages Global i18n Support',
    feature3Desc: 'Supporting English, Korean, Spanish, Chinese, and Japanese.',
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ToolHeader toolId="about" title={content.title} description={content.subTitle} badgeText="소개" />

      <AdBanner slotId="about-top" />

      {/* 서비스 소개 본문 */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} /> {content.introTitle}
        </h2>
        <p style={{ fontSize: '1.02rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
          {content.introDesc}
        </p>
      </div>

      {/* 3대 핵심 특징 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{content.feature1Title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{content.feature1Desc}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{content.feature2Title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{content.feature2Desc}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{content.feature3Title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{content.feature3Desc}</p>
        </div>
      </div>

      {/* 보안 및 운영 철학 */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Lock size={20} /> WebToolHub의 운영 철학 (Security & Transparency)
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-main)' }}>
          저희 WebToolHub는 사용자가 업로드하는 문서나 이미지, 비디오 파일에 포함된 민감한 데이터를 절대로 수집하거나 저장하지 않습니다. 최신 HTML5 File API와 WebAssembly 기술을 기반으로 전 과정이 사용자의 단말기(노트북, 스마트폰) 내부 메모리에서 독립 실행됩니다.
        </p>
      </div>

      <AdBanner slotId="about-bottom" />
    </div>
  );
};
