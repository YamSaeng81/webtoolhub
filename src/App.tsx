import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Home } from './pages/Home';
import { trackPageView } from './utils/analytics';

// Pages Import
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

import { MergePdfPage } from './pages/pdf/MergePdfPage';
import { CompressPdfPage } from './pages/pdf/CompressPdfPage';
import { RotatePdfPage } from './pages/pdf/RotatePdfPage';
import { ImageToPdfPage } from './pages/pdf/ImageToPdfPage';
import { PdfToImagePage } from './pages/pdf/PdfToImagePage';
import { ExtractPdfPage } from './pages/pdf/ExtractPdfPage';
import { CropPdfPage } from './pages/pdf/CropPdfPage';
import { OcrPdfPage } from './pages/pdf/OcrPdfPage';
import { PdfProtectPage } from './pages/pdf/PdfProtectPage';

import { ImageBgRemoverPage } from './pages/image/ImageBgRemoverPage';
import { QrGeneratorPage } from './pages/image/QrGeneratorPage';
import { ImageCompressPage } from './pages/image/ImageCompressPage';
import { ImageConvertPage } from './pages/image/ImageConvertPage';
import { ImageResizePage } from './pages/image/ImageResizePage';
import { FaviconGeneratorPage } from './pages/image/FaviconGeneratorPage';

import { GifMakerPage } from './pages/media/GifMakerPage';
import { VideoToMp3Page } from './pages/media/VideoToMp3Page';
import { AudioCutterPage } from './pages/media/AudioCutterPage';
import { VideoCutterPage } from './pages/media/VideoCutterPage';
import { AudioConvertPage } from './pages/media/AudioConvertPage';
import { VideoConvertPage } from './pages/media/VideoConvertPage';

import { TextCounterPage } from './pages/text/TextCounterPage';
import { JsonFormatterPage } from './pages/text/JsonFormatterPage';
import { TextDiffPage } from './pages/text/TextDiffPage';

import { FeedbackPage } from './pages/community/FeedbackPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return window.location.pathname;
    }
    return '/';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname !== currentPath) {
      window.history.pushState({}, '', currentPath);
    }
    trackPageView(currentPath);
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home onNavigate={handleNavigate} searchQuery={searchQuery} />;

      // 애드센스 필수 요구사항 페이지 ⭐
      case '/about':
        return <AboutPage />;
      case '/contact':
        return <ContactPage />;

      // 📄 PDF Tools (총 9개 라우트)
      case '/pdf/merge':
        return <MergePdfPage />;
      case '/pdf/compress':
        return <CompressPdfPage />;
      case '/pdf/rotate':
        return <RotatePdfPage />;
      case '/pdf/image-to-pdf':
        return <ImageToPdfPage />;
      case '/pdf/pdf-to-image':
        return <PdfToImagePage />;
      case '/pdf/extract':
        return <ExtractPdfPage />;
      case '/pdf/crop':
        return <CropPdfPage />;
      case '/pdf/ocr':
        return <OcrPdfPage />;
      case '/pdf/protect':
        return <PdfProtectPage />;

      // 🖼️ IMAGE
      case '/image/bg-remover':
        return <ImageBgRemoverPage />;
      case '/image/qr-generator':
        return <QrGeneratorPage />;
      case '/image/compress':
        return <ImageCompressPage />;
      case '/image/convert':
        return <ImageConvertPage />;
      case '/image/resize':
        return <ImageResizePage />;
      case '/image/favicon-generator':
        return <FaviconGeneratorPage />;

      // 🎬 MEDIA
      case '/media/gif-maker':
        return <GifMakerPage />;
      case '/media/video-to-mp3':
        return <VideoToMp3Page />;
      case '/media/audio-cutter':
        return <AudioCutterPage />;
      case '/media/video-cutter':
        return <VideoCutterPage />;
      case '/media/audio-convert':
        return <AudioConvertPage />;
      case '/media/video-convert':
        return <VideoConvertPage />;

      // 🔤 TEXT
      case '/text/counter':
        return <TextCounterPage />;
      case '/text/json-formatter':
        return <JsonFormatterPage />;
      case '/text/diff':
        return <TextDiffPage />;

      // 💬 COMMUNITY
      case '/community/feedback':
        return <FeedbackPage />;

      default:
        return <Home onNavigate={handleNavigate} searchQuery={searchQuery} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Header
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onSearch={setSearchQuery}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="main-layout">
        <Sidebar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="content-area">
          {renderPage()}
        </main>
      </div>

      <Footer onNavigate={handleNavigate} />

      <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />
    </div>
  );
}
