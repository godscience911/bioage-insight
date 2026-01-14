import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Timer, Activity, Droplets, Sun, RefreshCw, Share2, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react';
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

// Threads icon component (not available in lucide-react)
const ThreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.023.88-.73 2.132-1.13 3.528-1.13l.45.007c.904.02 1.696.143 2.374.368.002-.572-.053-1.1-.165-1.576-.23-.982-.678-1.737-1.329-2.244-.715-.556-1.71-.862-2.878-.886l-.011-2.12c1.59.03 2.95.483 4.042 1.347.94.744 1.613 1.752 2.006 3.002.34 1.082.498 2.334.469 3.73.474.294.883.63 1.226 1.006.652.716 1.1 1.628 1.333 2.71.247 1.148.182 2.51-.477 3.788-.798 1.545-2.182 2.792-4.002 3.6-1.549.687-3.382 1.022-5.466 1v-.003zm.282-7.877c-.703 0-1.296.14-1.716.405-.474.3-.71.73-.686 1.244.024.476.229.876.595 1.158.442.34 1.09.519 1.87.519h.09c1.056-.057 1.86-.418 2.392-1.08.382-.476.627-1.09.733-1.838-.64-.254-1.426-.396-2.345-.407h-.173l-.76-.001z"/>
  </svg>
);

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

    // Web Share API helper for mobile native sharing
    const tryNativeShare = async (title: string, text: string, url: string): Promise<boolean> => {
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return true;
        } catch (err) {
          // User cancelled or share failed
          return false;
        }
      }
      return false;
    };

    const handleKakaoShare = async () => {
      // Try Kakao SDK first
      if (typeof window !== 'undefined' && (window as any).Kakao) {
        const Kakao = (window as any).Kakao;
        if (Kakao.isInitialized()) {
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
          return;
        }
      }

      // Fallback: Try native share API on mobile
      const shared = await tryNativeShare('AI 생체나이 측정 결과', shareText, shareUrl);
      if (!shared) {
        // Try kakao talk scheme on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          const kakaoScheme = `kakaotalk://msg/text/${encodeURIComponent(shareText + '\n' + shareUrl)}`;
          window.location.href = kakaoScheme;
          setTimeout(() => {
            toast({
              title: "카카오톡으로 이동 중...",
              description: "앱이 열리지 않으면 카카오톡을 설치해주세요.",
            });
          }, 1000);
        } else {
          navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast({
            title: "링크가 복사되었습니다!",
            description: "카카오톡에 붙여넣기 하여 공유하세요.",
          });
        }
      }
    };

    const handleInstagramShare = async () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Instagram doesn't have a direct share scheme, but we can open the app
        // and use clipboard for sharing
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        
        // Try to open Instagram app
        const instagramUrl = 'instagram://app';
        window.location.href = instagramUrl;
        
        toast({
          title: "텍스트가 복사되었습니다!",
          description: "인스타그램에서 스토리나 DM에 붙여넣기 하세요.",
        });
      } else {
        // Desktop: copy and redirect to Instagram web
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        window.open('https://www.instagram.com/', '_blank');
        toast({
          title: "텍스트가 복사되었습니다!",
          description: "인스타그램에서 붙여넣기 하여 공유하세요.",
        });
      }
    };

    const handleFacebookShare = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
      
      if (isMobile) {
        // Try Facebook app scheme first
        const fbAppUrl = `fb://share/?quote=${encodeURIComponent(shareText)}&href=${encodeURIComponent(shareUrl)}`;
        window.location.href = fbAppUrl;
        
        // Fallback to web after a short delay
        setTimeout(() => {
          window.open(facebookUrl, '_blank');
        }, 500);
      } else {
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      }
    };

    const handleTwitterShare = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const tweetText = `🧬 AI 생체나이 측정 결과!\n실제 나이: ${actualAge}세\n생체 나이: ${biologicalAge}세\n${isYounger ? `${Math.abs(difference)}살 더 젊어요! 🎉` : `관리가 필요해요! 💪`}\n건강 점수: ${score}/100`;
      const twitterWebUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
      
      if (isMobile) {
        // Try X/Twitter app scheme
        const twitterAppUrl = `twitter://post?message=${encodeURIComponent(tweetText + '\n' + shareUrl)}`;
        window.location.href = twitterAppUrl;
        
        setTimeout(() => {
          window.open(twitterWebUrl, '_blank');
        }, 500);
      } else {
        window.open(twitterWebUrl, '_blank', 'width=600,height=400');
      }
    };

    const handleThreadsShare = async () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const threadsText = `🧬 AI 생체나이 측정 결과!\n실제 나이: ${actualAge}세 | 생체 나이: ${biologicalAge}세\n${isYounger ? `${Math.abs(difference)}살 더 젊어요! 🎉` : `관리가 필요해요! 💪`}\n건강 점수: ${score}/100\n\n${shareUrl}`;
      
      if (isMobile) {
        // Try Threads app scheme (uses Instagram's infrastructure)
        const threadsUrl = `barcelona://create?text=${encodeURIComponent(threadsText)}`;
        window.location.href = threadsUrl;
        
        setTimeout(() => {
          // Fallback: try web intent
          const threadsWebUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsText)}`;
          window.open(threadsWebUrl, '_blank');
        }, 500);
      } else {
        // Desktop: Threads web intent
        const threadsWebUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(threadsText)}`;
        window.open(threadsWebUrl, '_blank', 'width=600,height=600');
      }
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
          <div className="grid grid-cols-5 gap-2">
            <Button
              onClick={handleKakaoShare}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-[#FEE500] hover:bg-[#FDD835] text-[#3C1E1E]"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">카카오톡</span>
            </Button>
            <Button
              onClick={handleInstagramShare}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
            >
              <Instagram className="w-5 h-5" />
              <span className="text-xs">인스타</span>
            </Button>
            <Button
              onClick={handleFacebookShare}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white"
            >
              <Facebook className="w-5 h-5" />
              <span className="text-xs">페이스북</span>
            </Button>
            <Button
              onClick={handleTwitterShare}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-black hover:bg-gray-800 text-white"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-xs">X</span>
            </Button>
            <Button
              onClick={handleThreadsShare}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-black hover:bg-gray-800 text-white"
            >
              <ThreadsIcon className="w-5 h-5" />
              <span className="text-xs">쓰레드</span>
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
