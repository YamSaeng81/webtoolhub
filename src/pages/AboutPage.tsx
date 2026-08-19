import React from 'react';
import { ToolHeader } from '../components/common/ToolHeader';
import { AdBanner } from '../components/ads/AdBanner';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Sparkles,
  Globe,
  Zap,

  CheckCircle2,
  HelpCircle,
  Layers,
  Cpu,
} from 'lucide-react';

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
  }[language === 'ko' ? 'ko' : 'en'] || {
    title: 'About WebToolHub',
    subTitle: '0% Server Upload! 100% Browser In-Memory Free Smart Web Utility Hub',
    introTitle: 'What is WebToolHub?',
    introDesc:
      'WebToolHub is a next-generation web utility platform that prioritizes user privacy and document security.',
    feature1Title: '🔒 100% Browser Privacy (No Server Upload)',
    feature1Desc: 'All document conversion and AI processing run exclusively inside your web browser.',
    feature2Title: '⚡ Lightning Fast 0.1s Performance (WebAssembly)',
    feature2Desc: 'Powered by WebAssembly (WASM) and Web Workers.',
    feature3Title: '🌐 5 Languages Global i18n Support',
    feature3Desc: 'Supporting English, Korean, Spanish, Chinese, and Japanese.',
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <ToolHeader toolId="about" title={content.title} description={content.subTitle} badgeText="소개" />

      <AdBanner slotId="about-top" />

      {/* 서비스 소개 본문 */}
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={24} /> {content.introTitle}
        </h2>
        <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
          {content.introDesc}
        </p>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
          기존의 많은 온라인 변환 사이트들은 사용자의 문서를 중앙 서버로 전송받아 변환한 후 다시 내려주는 방식을 사용합니다. 이 과정에서 개인정보 침해, 기업 기밀 누출, 서버 지연 및 용량 제한 등의 문제가 발생했습니다. WebToolHub는 이러한 한계를 극복하기 위해 최신 웹 표준 기술(WebAssembly, ONNX WebRuntime, HTML5 Canvas)을 활용하여 모든 연산을 클라이언트 엣지 디바이스에서 직접 수행하는 완전히 새로운 아키텍처를 도입했습니다.
        </p>
      </div>

      {/* 3대 핵심 특징 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{content.feature1Title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{content.feature1Desc}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{content.feature2Title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{content.feature2Desc}</p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{content.feature3Title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{content.feature3Desc}</p>
        </div>
      </div>

      {/* 📊 기존 서버 방식 vs WebToolHub 비교표 */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={20} /> 기존 서버 업로드 방식 vs WebToolHub 비교
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.8rem 1rem' }}>비교 항목</th>
                <th style={{ padding: '0.8rem 1rem', color: '#ef4444' }}>기존 웹 툴 사이트 (일반 방식)</th>
                <th style={{ padding: '0.8rem 1rem', color: '#10b981' }}>WebToolHub (차세대 인메모리 방식)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>🔒 파일 보안성</td>
                <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>외부 서버로 업로드되어 유출 위험 존재</td>
                <td style={{ padding: '0.8rem 1rem', color: '#10b981', fontWeight: 700 }}>100% 브라우저 가상 메모리에서만 처리 (외부 유출 0%)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>⚡ 처리 속도</td>
                <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>업로드 및 다운로드 네트워크 통신 지연 발생</td>
                <td style={{ padding: '0.8rem 1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>업로드 없이 내 PC/모바일 CPU로 0.1초 즉시 변환</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>💾 파일 용량 제한</td>
                <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>서버 트래픽 비용 문제로 10MB~50MB 제한 및 유료 결제 유도</td>
                <td style={{ padding: '0.8rem 1rem', color: '#10b981', fontWeight: 700 }}>용량 제한 없는 평생 100% 완전 무료</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700 }}>👤 회원가입 여부</td>
                <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>이메일 가입 및 결제 카드 등록 요구</td>
                <td style={{ padding: '0.8rem 1rem', color: '#10b981', fontWeight: 700 }}>로그인 / 회원가입 전혀 없이 무제한 즉시 사용</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ⚙️ WebAssembly & 브라우저 샌드박스 기술 아키텍처 설명 */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
          <Cpu size={20} /> WebToolHub의 핵심 기술 아키텍처 (Technology Stack)
        </h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
          WebToolHub는 C/C++ 및 Rust로 작성된 고성능 저수준 바이너리 라이브러리를 웹 표준 바이너리인 <strong>WebAssembly(WASM)</strong>로 컴파일하여 브라우저에서 직접 구동합니다. 또한 복잡한 이미지 누끼 분리 작업에는 <strong>ONNX WebRuntime</strong> 신경망 가속 엔진을 탑재하여 브라우저의 WebGL/WebGPU 가속을 이끌어냅니다. 이 모든 작업은 메인 UI 스레드를 방해하지 않도록 백그라운드 <strong>Web Workers</strong> 환경에서 멀티스레딩으로 매끄럽게 처리됩니다.
        </p>
      </div>

      {/* 자주 묻는 질문 FAQ */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={20} color="var(--accent-primary)" /> WebToolHub 플랫폼 관련 자주 묻는 질문 (FAQ)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--accent-primary)" /> Q. 정말로 서버에 파일이 업로드되지 않나요?
            </span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '0.4rem', paddingLeft: '1.4rem' }}>
              네, 사실입니다! 브라우저의 개발자 도구(F12) 네트워크(Network) 탭을 열어보시면, 100MB짜리 PDF나 동영상을 변환할 때도 외부 서버로 파일이 POST/PUT 전송되지 않고 순수 브라우저 메모리 안에서만 처리되는 것을 직접 기술적으로 검증하실 수 있습니다.
            </p>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--accent-primary)" /> Q. 서비스 이용료는 평생 무료인가요?
            </span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '0.4rem', paddingLeft: '1.4rem' }}>
              네. WebToolHub는 서버 인프라 유지 비용이 거의 들지 않는 혁신적인 분산 엣지 구조로 설계되었기 때문에 사용자에게 비용을 청구할 필요가 없습니다. 모든 도구는 언제나 100% 무료로 개방됩니다.
            </p>
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="var(--accent-primary)" /> Q. 새로운 도구나 기능 제안은 어떻게 하나요?
            </span>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '0.4rem', paddingLeft: '1.4rem' }}>
              상단 및 하단 메뉴의 <strong>[소통 & 피드백]</strong> 게시판 또는 <strong>[Contact Us]</strong> 문의하기 페이지를 통해 의견을 남겨주시면 관리자가 실시간으로 확인하여 적극적으로 반영하고 있습니다.
            </p>
          </div>
        </div>
      </div>

      <AdBanner slotId="about-bottom" />
    </div>
  );
};
