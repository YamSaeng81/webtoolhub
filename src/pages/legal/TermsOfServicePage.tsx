import React from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { FileCheck, ShieldAlert, Scale, CheckCircle2, HelpCircle } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ToolHeader
        toolId="terms-of-service"
        title="서비스 이용약관 (Terms of Service)"
        description="WebToolHub(웹툴허브) 웹 유틸리티 포털 이용에 관한 기본 조건과 규정을 안내합니다."
        badgeText="이용 안내 규정"
      />

      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.8' }}>
        
        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={20} color="var(--accent-primary)" /> 1. 목적 및 약관의 효력
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            본 약관은 WebToolHub (이하 "서비스", 도메인: <code>https://yhdeabba.com</code>)가 제공하는 모든 브라우저 기반 온라인 유틸리티 도구(PDF, 이미지, 미디어, 텍스트 변환 등)의 이용 조건 및 절차에 관한 기본적인 사항을 규정함을 목적으로 합니다.
            이용자가 본 서비스를 이용하는 것은 본 약관의 내용을 숙지하고 동의한 것으로 간주됩니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#10b981" /> 2. 서비스의 제공 및 무상 이용 원칙
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            WebToolHub는 별도의 회원가입, 신용카드 등록, 유료 결제 없이 누구나 자유롭게 이용할 수 있는 100% 완전 무료 서비스입니다.
            서비스는 24시간 연중무휴 제공을 원칙으로 하나, 시스템 유지보수나 서버 점검 등의 사유로 일시 중단될 수 있습니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={20} color="#6366f1" /> 3. 지적재산권 및 이용자의 저작권 보호
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            이용자가 변환하거나 가공하기 위해 웹툴에 업로드하는 모든 문서, 사진, 오디오, 비디오 파일의 지적재산권 및 저작권은 전적으로 이용자 본인에게 귀속됩니다.
            WebToolHub는 어떠한 경우에도 이용자의 원본 파일에 대한 소유권을 주장하지 않으며, 제3자에게 배포하거나 공유하지 않습니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="#ef4444" /> 4. 면책 조항 (Disclaimer of Warranties)
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            본 서비스는 최신 웹 표준 기술을 사용하여 안정적인 변환을 보장하기 위해 최선을 다하고 있습니다.
            그러나 서비스는 "있는 그대로(AS IS)" 제공되며, 특정 기기의 메모리 부족, 손상된 파일 규격 등으로 인한 변환 실패, 데이터 유실에 대해 법적으로 허용되는 최대 한도 내에서 어떠한 보증도 하지 않습니다.
            중요한 원본 문서는 작업 전 반드시 별도의 백업본을 유지하시기 바랍니다.
          </p>
        </section>

        <section>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={20} color="var(--accent-primary)" /> 5. 고객 지원 및 문의
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            서비스 이용 약관에 대한 의문점이나 버그 신고, 신규 도구 건의는 공식 이메일 <code>yh.de.abba@gmail.com</code> 또는 사이트 내 '소통 & 피드백 게시판'을 통해 언제든지 접수하실 수 있습니다.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            공고일자: 2026년 8월 1일 | 시행일자: 2026년 8월 1일 (개정일자: 2026년 9월 9일)
          </p>
        </section>

      </div>
    </div>
  );
};
