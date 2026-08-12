import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { trackPageView } from './utils/analytics';

// Pages Import
import { MergePdfPage } from './pages/pdf/MergePdfPage';
import { CompressPdfPage } from './pages/pdf/CompressPdfPage';
import { RotatePdfPage } from './pages/pdf/RotatePdfPage';
import { ImageToPdfPage } from './pages/pdf/ImageToPdfPage';
import { PdfToImagePage } from './pages/pdf/PdfToImagePage';
import { ExtractPdfPage } from './pages/pdf/ExtractPdfPage';
import { CropPdfPage } from './pages/pdf/CropPdfPage';
import { OcrPdfPage } from './pages/pdf/OcrPdfPage';
import { PdfProtectPage } from './pages/pdf/PdfProtectPage';

import { ImageCompressPage } from './pages/image/ImageCompressPage';
import { ImageConvertPage } from './pages/image/ImageConvertPage';
import { ImageResizePage } from './pages/image/ImageResizePage';
import { FaviconGeneratorPage } from './pages/image/FaviconGeneratorPage';

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
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <Home onNavigate={handleNavigate} searchQuery={searchQuery} />;

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
      case '/image/compress':
        return <ImageCompressPage />;
      case '/image/convert':
        return <ImageConvertPage />;
      case '/image/resize':
        return <ImageResizePage />;
      case '/image/favicon-generator':
        return <FaviconGeneratorPage />;

      // 🎬 MEDIA (신규 3종 포함 총 5개 라우트) ⭐
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
      <Header currentPath={currentPath} onNavigate={handleNavigate} onSearch={setSearchQuery} />

      <div style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
        <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />

        <main style={{ flex: 1, minWidth: 0 }}>
          {renderPage()}
        </main>
      </div>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
