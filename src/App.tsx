import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Sidebar } from './components/layout/Sidebar';
import { Home } from './pages/Home';

// PDF Tools
import { ImageToPdfPage } from './pages/pdf/ImageToPdfPage';
import { PdfToImagePage } from './pages/pdf/PdfToImagePage';
import { ExtractPdfPage } from './pages/pdf/ExtractPdfPage';
import { CropPdfPage } from './pages/pdf/CropPdfPage';
import { OcrPdfPage } from './pages/pdf/OcrPdfPage';
import { PdfProtectPage } from './pages/pdf/PdfProtectPage';

// Image Tools
import { ImageCompressPage } from './pages/image/ImageCompressPage';
import { ImageConvertPage } from './pages/image/ImageConvertPage';
import { ImageResizePage } from './pages/image/ImageResizePage';
import { FaviconGeneratorPage } from './pages/image/FaviconGeneratorPage';

// Media Tools
import { VideoToMp3Page } from './pages/media/VideoToMp3Page';
import { AudioCutterPage } from './pages/media/AudioCutterPage';

// Text Tools
import { TextCounterPage } from './pages/text/TextCounterPage';
import { JsonFormatterPage } from './pages/text/JsonFormatterPage';
import { TextDiffPage } from './pages/text/TextDiffPage';

// Community Tools
import { FeedbackPage } from './pages/community/FeedbackPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/':
      case '/index.html':
        return <Home onNavigate={handleNavigate} searchQuery={searchQuery} />;
      
      // PDF Tools
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

      // Image Tools
      case '/image/compress':
        return <ImageCompressPage />;
      case '/image/convert':
        return <ImageConvertPage />;
      case '/image/resize':
        return <ImageResizePage />;
      case '/image/favicon-generator':
        return <FaviconGeneratorPage />;

      // Media Tools
      case '/media/video-to-mp3':
        return <VideoToMp3Page />;
      case '/media/audio-cutter':
        return <AudioCutterPage />;

      // Text Tools
      case '/text/counter':
        return <TextCounterPage />;
      case '/text/json-formatter':
        return <JsonFormatterPage />;
      case '/text/diff':
        return <TextDiffPage />;

      // Community Tools
      case '/community/feedback':
        return <FeedbackPage />;

      default:
        return <Home onNavigate={handleNavigate} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="app-container">
      <Header
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="main-layout">
        <main className="content-area">{renderCurrentPage()}</main>
        <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />
      </div>

      <Footer />
    </div>
  );
};

export default App;
