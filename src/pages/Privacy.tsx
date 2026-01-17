import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Bell, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Eye,
      title: '1. 수집하는 개인정보',
      content: `BioAge Insight는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:

• 소셜 로그인 정보: 이메일 주소, 프로필 사진, 이름
• 건강 관련 정보: 수면 시간, 운동 빈도, 식습관, 스트레스 수준 등 설문 응답
• 생체 데이터: AI 얼굴 분석을 통해 추정된 생체 나이
• 서비스 이용 기록: 접속 일시, 이용 기록, 기기 정보`
    },
    {
      icon: Database,
      title: '2. 개인정보의 이용 목적',
      content: `수집된 개인정보는 다음의 목적으로 이용됩니다:

• 생체 나이 분석 서비스 제공 및 개인화된 건강 인사이트 제공
• 회원 식별 및 서비스 이용 권한 관리
• 서비스 개선 및 신규 기능 개발을 위한 통계 분석
• 고객 문의 대응 및 공지사항 전달`
    },
    {
      icon: Lock,
      title: '3. 개인정보의 보관 및 보호',
      content: `BioAge Insight는 개인정보 보호를 위해 다음과 같은 조치를 취합니다:

• 모든 데이터는 암호화되어 안전하게 저장됩니다
• 접근 권한은 필요한 최소한의 인원에게만 부여됩니다
• 정기적인 보안 점검 및 취약점 분석을 실시합니다
• 개인정보는 서비스 이용 기간 동안 보관되며, 탈퇴 시 즉시 파기됩니다`
    },
    {
      icon: UserCheck,
      title: '4. 개인정보의 제3자 제공',
      content: `BioAge Insight는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우는 예외로 합니다:

• 이용자가 사전에 동의한 경우
• 법령에 의해 요구되는 경우
• 서비스 제공에 필요한 경우 (예: 결제 처리)`
    },
    {
      icon: Bell,
      title: '5. 이용자의 권리',
      content: `이용자는 언제든지 다음의 권리를 행사할 수 있습니다:

• 개인정보 열람 요청
• 개인정보 정정 및 삭제 요청
• 개인정보 처리 정지 요청
• 동의 철회 및 회원 탈퇴

위 권리 행사는 앱 내 설정 또는 고객센터를 통해 가능합니다.`
    },
    {
      icon: Trash2,
      title: '6. 개인정보의 파기',
      content: `개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우, 해당 개인정보는 지체 없이 파기됩니다:

• 전자적 파일: 복구 불가능한 방법으로 영구 삭제
• 출력물: 분쇄 또는 소각 처리`
    },
    {
      icon: Mail,
      title: '7. 개인정보 보호책임자',
      content: `개인정보 처리에 관한 문의사항이 있으시면 아래로 연락해 주시기 바랍니다:

• 이메일: privacy@bioage-insight.com
• 운영시간: 평일 09:00 - 18:00`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">개인정보처리방침</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Intro */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <p className="text-muted-foreground leading-relaxed">
              BioAge Insight(이하 "서비스")는 이용자의 개인정보를 중요시하며, 
              「개인정보 보호법」 등 관련 법령을 준수하고 있습니다. 
              본 개인정보처리방침은 서비스가 수집하는 개인정보와 그 이용 방법, 
              보호 조치에 대해 안내합니다.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              시행일: 2024년 1월 1일 | 최종 수정일: 2024년 1월 1일
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 BioAge Insight. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
