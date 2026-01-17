import { motion } from 'framer-motion';
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle, Scale, RefreshCw, MessageSquare, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: FileText,
      title: '제1조 (목적)',
      content: `본 약관은 BioAge Insight(이하 "서비스")를 제공하는 회사(이하 "회사")와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.`
    },
    {
      icon: CheckCircle,
      title: '제2조 (서비스의 내용)',
      content: `BioAge Insight는 다음과 같은 서비스를 제공합니다:

• AI 기반 얼굴 분석을 통한 생체 나이 추정
• 건강 습관 설문을 통한 생활 패턴 분석
• 개인화된 건강 인사이트 및 개선 제안
• 생체 나이 변화 추적 및 리포트

본 서비스는 의료 진단이나 치료를 목적으로 하지 않으며, 전문적인 의료 상담을 대체할 수 없습니다.`
    },
    {
      icon: AlertTriangle,
      title: '제3조 (서비스 이용의 제한)',
      content: `다음 각 호에 해당하는 경우 서비스 이용이 제한될 수 있습니다:

• 타인의 정보를 도용하여 가입한 경우
• 서비스의 정상적인 운영을 방해하는 행위
• 관련 법령을 위반하는 행위
• 서비스를 상업적 목적으로 무단 이용하는 경우
• 기타 본 약관을 위반하는 경우`
    },
    {
      icon: Scale,
      title: '제4조 (이용자의 의무)',
      content: `이용자는 다음 사항을 준수해야 합니다:

• 가입 시 정확한 정보를 제공할 것
• 타인의 개인정보를 침해하지 않을 것
• 서비스를 불법적인 목적으로 사용하지 않을 것
• 회사의 지적재산권을 존중할 것
• 본 약관 및 관련 법령을 준수할 것`
    },
    {
      icon: XCircle,
      title: '제5조 (면책 조항)',
      content: `회사는 다음의 경우 책임을 지지 않습니다:

• AI 분석 결과의 의학적 정확성에 대한 보장
• 천재지변, 서버 장애 등 불가항력으로 인한 서비스 중단
• 이용자의 귀책사유로 발생한 손해
• 이용자 간 또는 이용자와 제3자 간의 분쟁

본 서비스에서 제공하는 생체 나이 분석 결과는 참고용이며, 건강에 관한 중요한 결정은 반드시 전문 의료진과 상담하시기 바랍니다.`
    },
    {
      icon: RefreshCw,
      title: '제6조 (서비스 변경 및 중단)',
      content: `회사는 다음의 경우 서비스를 변경하거나 중단할 수 있습니다:

• 서비스 개선 및 업데이트
• 시스템 점검 및 유지보수
• 회사의 경영상 중대한 사유가 있는 경우

서비스 변경 또는 중단 시 사전에 공지하며, 불가피한 경우 사후 통지할 수 있습니다.`
    },
    {
      icon: MessageSquare,
      title: '제7조 (분쟁 해결)',
      content: `서비스 이용과 관련하여 분쟁이 발생한 경우:

• 우선적으로 상호 협의를 통해 해결합니다
• 협의가 이루어지지 않을 경우 관할 법원에 소를 제기할 수 있습니다
• 준거법은 대한민국 법으로 합니다`
    },
    {
      icon: Gavel,
      title: '제8조 (약관의 개정)',
      content: `회사는 필요한 경우 본 약관을 개정할 수 있습니다:

• 개정 약관은 시행일 7일 전 공지합니다
• 중요한 변경사항은 30일 전 공지합니다
• 이용자가 개정 약관에 동의하지 않을 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다
• 시행일 이후 서비스를 계속 이용할 경우 개정 약관에 동의한 것으로 간주합니다`
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
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">서비스 이용약관</h1>
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
              본 약관은 BioAge Insight 서비스의 이용에 관한 기본적인 사항을 규정합니다. 
              서비스를 이용하시기 전에 본 약관을 주의 깊게 읽어주시기 바랍니다. 
              서비스를 이용하시면 본 약관에 동의한 것으로 간주됩니다.
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

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">중요 안내</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  BioAge Insight에서 제공하는 생체 나이 분석 결과는 AI 기술을 기반으로 한 추정치이며, 
                  의학적 진단이나 조언으로 사용되어서는 안 됩니다. 건강에 관한 중요한 결정은 
                  반드시 전문 의료진과 상담하시기 바랍니다.
                </p>
              </div>
            </div>
          </motion.div>
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
