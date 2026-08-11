import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { trackPageView } from './utils/analytics';

// Pages Import
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

import { TextCounterPage } from './pages/text/TextCounterPage';
import { JsonFormatterPage } from './pages/text/JsonFormatterPage';
import { TextDiffPage } from './pages/text/TextDiffPage';

import { FeedbackPage } from './pages/community/FeedbackPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    // 페이지 라우팅 변경 시 통계 트래커(방문자 수 / PV) 실행
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

      // 📄 PDF
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

      // 🎬 MEDIA
      case '/media/video-to-mp3':
        return <VideoToMp3Page />;
      case '/media/audio-cutter':
        return <AudioCutterPage />;

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
