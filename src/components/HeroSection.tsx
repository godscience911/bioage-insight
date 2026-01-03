import { motion } from 'framer-motion';
import { Activity, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStart: () => void;
}

export const HeroSection = ({ onStart }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto relative z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-secondary-foreground">AI 기반 생체 나이 분석</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
        >
          당신의{' '}
          <span className="text-gradient">진짜 생체 나이</span>
          <br />를 알고 계신가요?
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
        >
          AI가 분석하는 생활습관과 얼굴 특징점 분석으로
          <br className="hidden md:block" />
          당신만의 역노화 솔루션을 찾아보세요
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-hero text-primary-foreground px-8 py-6 text-lg font-semibold rounded-xl shadow-glow hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            무료로 분석 시작하기
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
        >
          {[
            { icon: Activity, text: '2분 소요' },
            { icon: Sparkles, text: 'AI 정밀 분석' },
            { icon: Activity, text: '맞춤 솔루션' },
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <feature.icon className="w-4 h-4 text-primary" />
              <span>{feature.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating DNA Helix illustration */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="flex gap-1 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-b from-primary to-accent rounded-full"
              style={{ height: `${20 + i * 10}px` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
