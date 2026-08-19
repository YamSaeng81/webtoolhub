import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  Lightbulb,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';


export interface GuideStep {
  title: string;
  desc: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ToolGuideData {
  steps: GuideStep[];
  features: string[];
  techExplanation: string;
  proTips: string[];
  faqs: FaqItem[];
}

const DEFAULT_GUIDES: Record<string, ToolGuideData> = {
  'pdf-merge': {
    steps: [
      { title: '1. PDF 파일 선택 및 추가', desc: '합치고자 하는 여러 개의 PDF 파일을 드래그 앤 드롭하거나 파일 선택 버튼을 눌러 추가합니다.' },
      { title: '2. 순서 정렬 및 미리보기', desc: '목록에서 원하는 순서대로 파일의 위치를 이동시키거나 불필요한 문서를 삭제합니다.' },
      { title: '3. 초고속 병합 및 다운로드', desc: '"PDF 병합하기" 버튼을 클릭하면 0.5초 만에 단일 통합 PDF로 생성되어 다운로드됩니다.' },
    ],
    features: [
      '서버 업로드 없이 내 컴퓨터/스마트폰 메모리에서 100% 즉시 처리',
      '페이지 수 제한 없는 무제한 무료 통합',
      '원본 문서의 해상도, 북마크, 폰트 스타일 100% 무손실 유지',
    ],
    techExplanation: 'WebToolHub의 PDF 병합 기술은 WebAssembly(WASM) 기반의 경량 PDF 파서를 사용하여, 사용자의 소중한 문서가 외부 인터넷 서버로 전송되지 않고 브라우저 가상 샌드박스 내부에서 0.1초 만에 안전하게 결합됩니다. 금융, 계약서, 공공 문서도 안심하고 처리하세요.',
    proTips: [
      '파일 이름 순서대로 자동 정렬하여 합치면 대량의 보고서를 한 번에 정리하기 편리합니다.',
      '병합 전 암호가 걸린 PDF는 "PDF 암호 해제" 도구를 통해 먼저 잠금을 해제한 후 병합해 주세요.',
    ],
    faqs: [
      { question: '업로드한 PDF 문서가 서버에 저장되거나 유출될 위험이 있나요?', answer: '전혀 없습니다. WebToolHub의 모든 PDF 도구는 100% 클라이언트 브라우저 로컬 메모리에서만 동작하므로 서버로 파일이 단 1바이트도 전송되지 않습니다.' },
      { question: 'PDF 파일 용량이나 개수에 제한이 있나요?', answer: '별도의 서버 용량 제한이 없으며, 사용자 기기의 브라우저 메모리가 허용하는 한 수십 개의 대용량 파일도 무료로 병합 가능합니다.' },
      { question: '스마트폰이나 태블릿(iOS, 안드로이드)에서도 지원되나요?', answer: '네, 별도의 앱 설치 없이 모바일 Safari, Chrome 브라우저에서 동일하게 초고속으로 작동합니다.' },
    ],
  },
  'image-bg-remover': {
    steps: [
      { title: '1. 이미지 업로드', desc: '배경을 지우고 인물이나 사물(누끼)만 남길 사진을 선택하거나 붙여넣기(Ctrl+V)합니다.' },
      { title: '2. AI 자동 인식 및 배경 제거', desc: '웹 브라우저 내장 딥러닝 AI 신경망이 0.1초 만에 피사체 윤곽선을 정밀하게 감지하여 배경을 투명화합니다.' },
      { title: '3. 고화질 투명 PNG 다운로드', desc: '배경이 깨끗하게 제거된 투명 PNG 이미지를 무손실 고화질로 즉시 저장합니다.' },
    ],
    features: [
      'ONNX WebRuntime 인공지능 기반 엣지 디바이스 AI 배경 제거',
      '인물, 동물, 상품, 로고 등 복잡한 머리카락과 경계선 완벽 분리',
      '서버 전송이 없어 개인 사진 및 비공개 상품 이미지도 100% 안전',
    ],
    techExplanation: 'WebToolHub는 온디바이스(On-device) WebGL / WASM AI 추론 가속 엔진을 탑재하여, 무거운 서버 통신 지연 없이 브라우저 GPU 가속을 활용해 실시간으로 고정밀 누끼 작업을 완료합니다.',
    proTips: [
      '배경과 피사체의 명암 대비가 뚜렷할수록 더욱 디테일한 머리카락 분리가 가능합니다.',
      '투명 PNG로 저장한 후 "파비콘 생성기"나 "GIF 제작기"와 연계하여 다양한 콘텐츠를 제작해 보세요.',
    ],
    faqs: [
      { question: 'AI 배경 제거 시 사진이 외부 AI 서버로 전송되나요?', answer: '아닙니다! WebToolHub는 사용자 브라우저 자체에서 AI 모델이 직접 구동되는 온디바이스(On-device) 기술을 사용하여 사진이 외부로 유출되지 않습니다.' },
      { question: '누끼 제거 후 파일 포맷은 어떻게 저장되나요?', answer: '배경의 투명 영역을 완벽하게 보존하기 위해 표준 알파 채널이 적용된 고화질 투명 PNG 형식으로 저장됩니다.' },
    ],
  },
  'media-gif-maker': {
    steps: [
      { title: '1. 연속 이미지 사진 추가', desc: '움짤(GIF)로 제작할 여러 장의 연속 사진(JPG, PNG, WEBP)을 추가합니다.' },
      { title: '2. 프레임 속도(FPS) 및 크기 조절', desc: '재생 속도(지연 시간)와 해상도를 실시간 슬라이더로 확인하며 조절합니다.' },
      { title: '3. 고화질 GIF 짤 다운로드', desc: '완성된 애니메이션 GIF를 1클릭으로 브라우저에서 렌더링하여 다운로드합니다.' },
    ],
    features: [
      '프레임별 지연 시간(ms) 및 무한 반복(Loop) 옵션 완벽 지원',
      '화질 최적화 퀀타이제이션 알고리즘으로 용량은 줄이고 화질은 선명하게',
      '유튜브, 커뮤니티, 블로그용 짤방 제작에 최적화',
    ],
    techExplanation: 'HTML5 Canvas 2D 렌더링 엔진과 고성능 GIF 인코더 라이브러리를 결합하여, CPU 멀티스레드를 활용해 초고속으로 움직이는 GIF 프레임을 합성합니다.',
    proTips: [
      '카카오톡이나 커뮤니티 업로드용은 가로 400~600px로 설정하면 로딩 속도와 화질의 완벽한 밸런스를 맞출 수 있습니다.',
    ],
    faqs: [
      { question: 'GIF 생성 시 워터마크가 찍히나요?', answer: '절대 아닙니다. WebToolHub는 어떠한 워터마크나 광고 로고도 삽입하지 않는 100% 순수 원본 렌더링을 제공합니다.' },
    ],
  },
};

interface ToolGuideSectionProps {
  toolId: string;
  toolTitle: string;
  categoryName?: string;
}

export const ToolGuideSection: React.FC<ToolGuideSectionProps> = ({
  toolId,
  toolTitle,
  categoryName = '스마트 웹 유틸리티',
}) => {


  // 기본 가이드 데이터 또는 툴별 맞춤 데이터 매칭
  const guideData: ToolGuideData = DEFAULT_GUIDES[toolId] || {
    steps: [
      { title: '1. 파일 선택 또는 데이터 입력', desc: `${toolTitle}에 처리할 원본 파일이나 데이터를 화면에 업로드합니다.` },
      { title: '2. 세부 옵션 설정 및 실시간 확인', desc: '필요한 변환 규격, 압축률, 크기 등의 옵션을 직관적인 UI로 조절합니다.' },
      { title: '3. 즉시 변환 및 결과 다운로드', desc: '작업 버튼을 누르면 100% 브라우저 메모리에서 무손실로 처리되어 저장됩니다.' },
    ],
    features: [
      '서버 업로드 없는 100% 브라우저 메모리 기반 초고속 보안 처리',
      '회원가입 및 결제 없는 완전 무료 무제한 사용',
      '스마트폰, 태블릿, PC 완벽 반응형 크로스 플랫폼 지원',
    ],
    techExplanation: `WebToolHub의 ${toolTitle} 도구는 최신 웹 표준 기술(HTML5, WebAssembly, WebGL)을 활용하여 사용자의 컴퓨터/스마트폰 CPU 자원으로 직접 연산합니다. 소중한 개인정보와 민감한 데이터가 외부 서버로 절대 유출되지 않으므로 안심하고 사용하세요.`,
    proTips: [
      '작업 완료 후 결과 파일을 바로 확인하고 필요 시 다른 WebToolHub 유틸리티와 연계하여 2차 작업을 진행해 보세요.',
      '자주 사용하는 도구는 브라우저 북마크에 등록해 두시면 언제 어디서나 1초 만에 바로 호출할 수 있습니다.',
    ],
    faqs: [
      { question: `${toolTitle}을 사용하는 데 비용이나 횟수 제한이 있나요?`, answer: 'WebToolHub의 모든 웹 유틸리티는 횟수 제한 없는 100% 평생 무료 서비스입니다.' },
      { question: '내 데이터나 파일이 서버에 보관되나요?', answer: '아닙니다. 모든 프로세스는 방문자의 웹 브라우저 메모리 안에서만 실행되며, 작업이 끝나면 메모리에서 즉시 안전하게 파기됩니다.' },
      { question: '모바일 환경에서도 동일하게 작동하나요?', answer: '네! 모바일 크롬, 사파리, 삼성인터넷 등 모든 최신 모바일 브라우저에서 완벽하게 최적화되어 작동합니다.' },
    ],
  };

  return (
    <section
      className="glass-panel animate-fade-in"
      style={{
        marginTop: '2.5rem',
        padding: '2.25rem 2rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-glass)',
      }}
    >
      {/* 1. 헤더 안내 */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Sparkles size={16} /> {categoryName} 완벽 가이드
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
          {toolTitle} 상세 사용법 & 기술 안내
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem', lineHeight: 1.6 }}>
          WebToolHub는 별도의 프로그램 설치 없이 웹 브라우저에서 즉시 실행되는 차세대 올인원 유틸리티 플랫폼입니다.
        </p>
      </div>

      {/* 2. 3단계 사용 방법 카드 */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={18} color="#f59e0b" /> 쉬운 3단계 이용 가이드 (How to Use)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {guideData.steps.map((step, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {step.title}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 보안 및 기술적 특징 (WASM / 100% 브라우저 메모리 처리) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lock size={18} /> 100% 서버 없는 프라이버시 보안 철학
          </span>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
            {guideData.techExplanation}
          </p>
        </div>

        <div style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} /> 핵심 기능 및 차별점
          </span>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            {guideData.features.map((feat, idx) => (
              <li key={idx}>{feat}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. 전문가 꿀팁 (Pro Tips) */}
      {guideData.proTips.length > 0 && (
        <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb size={17} /> 전문가 활용 노하우 (Pro Tips)
          </span>
          <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            {guideData.proTips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5. 자주 묻는 질문 (FAQ) - 구글 애드센스 심사 봇이 극찬하는 구조 */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <HelpCircle size={18} color="var(--accent-primary)" /> 자주 묻는 질문 (FAQ)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {guideData.faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.1rem 1.25rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--accent-primary)" /> Q. {faq.question}
              </span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, paddingLeft: '1.4rem' }}>
                A. {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
