import React from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { Shield, Lock, Eye, FileText, Globe, Mail } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="privacy-policy"
        title="개인정보처리방침 (Privacy Policy)"
        description="WebToolHub(웹툴허브)는 사용자의 개인정보와 파일 보안을 최우선으로 보호하며, 관련 법령 및 구글 애드센스 개인정보 정책을 철저히 준수합니다."
        badgeText="법적 필수 고지"
      />

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.8' }}>
        
        {/* 요약 카드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Lock size={28} color="#10b981" />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>서버 업로드 0%</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>파일이 외부 서버로 전송되지 않습니다.</p>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Shield size={28} color="var(--accent-primary)" />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>100% 인메모리 연산</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>브라우저 메모리 안에서만 즉시 처리</p>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Eye size={28} color="#ec4899" />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>회원가입 불필요</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>이름, 전화번호, 이메일 미수집</p>
            </div>
          </div>
        </div>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--accent-primary)" /> 1. 총칙 및 개인정보의 수집 범위
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            WebToolHub (이하 "서비스", 도메인: <code>https://yhdeabba.com</code>)는 이용자의 프라이버시를 매우 소중하게 생각합니다.
            본 서비스는 회원가입이나 로그인을 일체 요구하지 않으며, 이용자의 주민등록번호, 결제 정보, 연락처 등 고유식별정보를 절대 수집하거나 저장하지 않습니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="#10b981" /> 2. 파일 처리 및 제로 서버 스토리지(Zero Server Storage) 원칙
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            이용자가 PDF, 이미지, 오디오, 비디오, 텍스트 도구를 사용할 때 선택하는 모든 파일은 WebAssembly(WASM) 및 HTML5 Canvas 등 최신 브라우저 클라이언트 기술을 통해
            <strong> 100% 이용자의 기기(PC/스마트폰) 내부 메모리 상에서만 즉시 처리</strong>됩니다.
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            작업 중인 파일은 서비스 운영자의 중앙 서버나 제3자의 원격 서버로 단 1바이트도 전송되거나 저장되지 않으며, 변환이 완료되거나 브라우저 창을 닫는 즉시 기기 메모리에서 영구적으로 소멸됩니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#6366f1" /> 3. 구글 애드센스(Google AdSense) 및 제3자 쿠키(Cookie) 정책
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            본 사이트는 무료 웹 유틸리티 서비스의 안정적인 운영과 서버 호스팅 비용 충당을 위해 Google LLC가 제공하는 광고 게재 서비스인 <strong>Google AdSense</strong>를 이용할 수 있습니다.
          </p>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Google을 포함한 제3자 벤더는 쿠키(Cookie)를 사용하여 사용자의 이전 웹사이트 방문 기록을 바탕으로 광고를 게재합니다.</li>
            <li>Google의 광고 쿠키 사용으로 Google 및 파트너는 사용자의 본 사이트 또는 다른 사이트 방문 정보를 기반으로 적절한 광고를 사용자에게 게재할 수 있습니다.</li>
            <li>
              사용자는 Google의 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>광고 설정 페이지</a>를 방문하여 개인 맞춤 광고 설정을 해제(Opt-out)할 수 있습니다.
            </li>
            <li>
              또한 <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>www.aboutads.info</a>를 방문하여 제3자 벤더의 개인 맞춤 광고용 쿠키 사용을 선택 해제할 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="#ec4899" /> 4. 브라우저 로컬 스토리지(LocalStorage) 이용 안내
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            본 서비스는 이용자의 웹 편의를 돕기 위해 이용자의 브라우저 로컬 저장소(LocalStorage)에 언어 설정(한국어, 영어, 스페인어, 일본어, 중국어), 다크모드 테마, 익명 피드백 게시글 데이터만을 로컬에 보관합니다.
            이 데이터는 운영자의 서버로 수집되지 않으며 이용자가 언제든지 브라우저 캐시를 지워 초기화할 수 있습니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} color="var(--accent-primary)" /> 5. 개인정보 보호책임자 및 문의처
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            서비스 이용 중 발생하는 개인정보 보호 관련 민원 및 건의사항은 아래의 고객지원 채널을 통해 신속하게 답변해 드립니다.
          </p>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.8rem' }}>
            <p style={{ fontSize: '0.9rem' }}>• <strong>서비스명</strong>: WebToolHub (웹툴허브)</p>
            <p style={{ fontSize: '0.9rem' }}>• <strong>대표 도메인</strong>: https://yhdeabba.com</p>
            <p style={{ fontSize: '0.9rem' }}>• <strong>공식 문의 이메일</strong>: yh.de.abba@gmail.com</p>
            <p style={{ fontSize: '0.9rem' }}>• <strong>시행 일자</strong>: 2026년 8월 1일 (최종 갱신: 2026년 9월 9일)</p>
          </div>
        </section>

      </div>
    </div>
  );
};
