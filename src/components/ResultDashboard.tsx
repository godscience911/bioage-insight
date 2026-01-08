import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Timer, Activity, Droplets, Sun, RefreshCw, Share2, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GaugeChart } from './GaugeChart';
import { toast } from '@/hooks/use-toast';
import type { SurveyResult, Recommendation } from '@/types/survey';

interface ResultDashboardProps {
  result: SurveyResult;
  onRestart: () => void;
}

const allRecommendations: Recommendation[] = [
  {
    id: '1',
    title: '비타민 D 섭취',
    description: '하루 2000IU의 비타민 D 섭취로 세포 재생과 면역력을 강화하세요.',
    icon: 'pill',
    priority: 'high',
  },
  {
    id: '2',
    title: '간헐적 단식',
    description: '16:8 간헐적 단식으로 세포 자가포식을 활성화하고 노화를 늦추세요.',
    icon: 'timer',
    priority: 'high',
  },
  {
    id: '3',
    title: '유산소 운동 강화',
    description: '주 3회 이상 30분 걷기나 조깅으로 심폐 기능을 개선하세요.',
    icon: 'activity',
    priority: 'medium',
  },
  {
    id: '4',
    title: '수분 섭취 늘리기',
    description: '하루 2L 이상의 물을 마셔 피부 탄력과 해독 기능을 높이세요.',
    icon: 'droplets',
    priority: 'medium',
  },
  {
    id: '5',
    title: '자외선 차단',
    description: 'SPF 50+ 자외선 차단제를 매일 사용하여 광노화를 예방하세요.',
    icon: 'sun',
    priority: 'low',
  },
];

const iconMap: Record<string, React.ElementType> = {
  pill: Pill,
  timer: Timer,
  activity: Activity,
  droplets: Droplets,
  sun: Sun,
};

const priorityColors = {
  high: 'border-destructive/50 bg-destructive/5',
  medium: 'border-primary/50 bg-primary/5',
  low: 'border-accent/50 bg-accent/5',
};

const priorityLabels = {
  high: { text: '높음', color: 'text-destructive' },
  medium: { text: '중간', color: 'text-primary' },
  low: { text: '낮음', color: 'text-accent' },
};

export const ResultDashboard = React.forwardRef<HTMLDivElement, ResultDashboardProps>(
  ({ result, onRestart }, ref) => {
    const { biologicalAge, actualAge, score } = result;
    const difference = actualAge - biologicalAge;
    const isYounger = difference > 0;

    // Select recommendations based on score
    const recommendations = allRecommendations.slice(0, 3);

    // Share text for SNS
    const shareText = `🧬 AI 생체나이 측정 결과!\n\n실제 나이: ${actualAge}세\n생체 나이: ${biologicalAge}세\n${isYounger ? `무려 ${Math.abs(difference)}살이나 젊습니다! 🎉` : `관리가 필요해요! 💪`}\n\n건강 점수: ${score}/100\n\n나도 측정해보기 👇`;
    const shareUrl = window.location.origin;

    const handleKakaoShare = () => {
      // Kakao SDK share (requires Kakao SDK initialization)
      if (typeof window !== 'undefined' && (window as any).Kakao) {
        const Kakao = (window as any).Kakao;
        if (!Kakao.isInitialized()) {
          toast({
            title: "카카오톡 공유",
            description: "카카오 SDK가 초기화되지 않았습니다. 링크를 복사해서 공유해주세요.",
          });
          navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          return;
        }
        Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: 'AI 생체나이 측정 결과',
            description: `생체 나이: ${biologicalAge}세 | 건강 점수: ${score}점`,
            imageUrl: `${shareUrl}/og-image.png`,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '나도 측정하기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({
          title: "링크가 복사되었습니다!",
          description: "카카오톡에 붙여넣기 하여 공유하세요.",
        });
      }
    };

    const handleInstagramShare = () => {
      // Instagram doesn't support direct web sharing, copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: "텍스트가 복사되었습니다!",
        description: "인스타그램 스토리나 DM에 붙여넣기 하세요.",
      });
    };

    const handleFacebookShare = () => {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    return (
      <div ref={ref} className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">분석 결과</h2>
          <p className="text-muted-foreground">
            AI가 분석한 당신의 생체 나이입니다
          </p>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 mb-6"
        >
          <GaugeChart biologicalAge={biologicalAge} actualAge={actualAge} />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-2xl font-bold">{actualAge}세</div>
              <div className="text-sm text-muted-foreground">실제 나이</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-gradient">{biologicalAge}세</div>
              <div className="text-sm text-muted-foreground">생체 나이</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className={`text-2xl font-bold ${isYounger ? 'text-accent' : 'text-destructive'}`}>
                {isYounger ? '-' : '+'}{Math.abs(difference)}세
              </div>
              <div className="text-sm text-muted-foreground">차이</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">건강 점수</h3>
              <p className="text-sm text-muted-foreground">
                생활습관 기반 종합 점수
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-muted-foreground">/100</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-hero"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold mb-4">
            당신을 위한 3가지 역노화 솔루션
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec, index) => {
              const Icon = iconMap[rec.icon];
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`glass-card rounded-xl p-5 border-l-4 ${priorityColors[rec.priority]}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      {Icon && <Icon className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <span className={`text-xs font-medium ${priorityLabels[rec.priority].color}`}>
                          우선순위: {priorityLabels[rec.priority].text}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* SNS Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">결과 공유하기</h3>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleKakaoShare}
              className="flex-1 gap-2 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E]"
            >
              <MessageCircle className="w-5 h-5" />
              카카오톡
            </Button>
            <Button
              onClick={handleInstagramShare}
              className="flex-1 gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
            >
              <Instagram className="w-5 h-5" />
              인스타그램
            </Button>
            <Button
              onClick={handleFacebookShare}
              className="flex-1 gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white"
            >
              <Facebook className="w-5 h-5" />
              페이스북
            </Button>
          </div>
        </motion.div>

        {/* Restart Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button
            onClick={onRestart}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            다시 측정하기
          </Button>
        </motion.div>
      </div>
    </div>
  );
});

ResultDashboard.displayName = 'ResultDashboard';
