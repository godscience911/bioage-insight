import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Moon, Dumbbell, Utensils, Droplets, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ProgressBar } from './ProgressBar';
import type { SurveyData } from '@/types/survey';

interface SurveyFormProps {
  onComplete: (data: SurveyData) => void;
  onBack: () => void;
}

const questions = [
  {
    id: 'sleepHours',
    icon: Moon,
    title: '하루 평균 수면 시간',
    subtitle: '충분한 수면은 세포 재생에 필수적입니다',
    type: 'select',
    options: [
      { value: '4', label: '4시간 미만', score: 20 },
      { value: '5', label: '4~5시간', score: 40 },
      { value: '6', label: '5~6시간', score: 60 },
      { value: '7', label: '7~8시간', score: 100 },
      { value: '9', label: '9시간 이상', score: 70 },
    ],
  },
  {
    id: 'exerciseFrequency',
    icon: Dumbbell,
    title: '주당 운동 횟수',
    subtitle: '규칙적인 운동은 생체 나이를 낮춥니다',
    type: 'select',
    options: [
      { value: '0', label: '거의 안함', score: 20 },
      { value: '1', label: '1~2회', score: 50 },
      { value: '3', label: '3~4회', score: 90 },
      { value: '5', label: '5회 이상', score: 100 },
    ],
  },
  {
    id: 'dietQuality',
    icon: Utensils,
    title: '가공식품 섭취 빈도',
    subtitle: '식단은 노화 속도에 직접적인 영향을 미칩니다',
    type: 'select',
    options: [
      { value: 'daily', label: '매일', score: 20 },
      { value: 'often', label: '주 4~5회', score: 40 },
      { value: 'sometimes', label: '주 2~3회', score: 70 },
      { value: 'rarely', label: '거의 안먹음', score: 100 },
    ],
  },
  {
    id: 'waterIntake',
    icon: Droplets,
    title: '하루 물 섭취량',
    subtitle: '수분 섭취는 피부 탄력 유지에 중요합니다',
    type: 'select',
    options: [
      { value: '500', label: '500ml 미만', score: 20 },
      { value: '1000', label: '500ml~1L', score: 50 },
      { value: '1500', label: '1L~1.5L', score: 80 },
      { value: '2000', label: '2L 이상', score: 100 },
    ],
  },
  {
    id: 'stressLevel',
    icon: Brain,
    title: '스트레스 지수',
    subtitle: '만성 스트레스는 세포 노화를 가속화합니다',
    type: 'slider',
    min: 1,
    max: 10,
  },
];

export const SurveyForm = ({ onComplete, onBack }: SurveyFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({
    sleepHours: '',
    exerciseFrequency: '',
    dietQuality: '',
    waterIntake: '',
    stressLevel: 5,
  });
  const [age, setAge] = useState<string>('');
  const [ageError, setAgeError] = useState<string>('');

  // Validate age input - only digits, 1-120 range
  const validateAge = (input: string): { isValid: boolean; error: string } => {
    const trimmed = input.trim();
    if (!trimmed) return { isValid: false, error: '' };
    if (!/^\d+$/.test(trimmed)) return { isValid: false, error: '숫자만 입력해주세요' };
    const num = parseInt(trimmed, 10);
    if (num < 1 || num > 120) return { isValid: false, error: '1~120 사이의 나이를 입력해주세요' };
    return { isValid: true, error: '' };
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 3 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setAge(value);
    
    if (value) {
      const { error } = validateAge(value);
      setAgeError(error);
    } else {
      setAgeError('');
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleSliderChange = (value: number[]) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value[0] }));
  };

  const handleNext = () => {
    if (isLastStep) {
      const { isValid, error } = validateAge(age);
      if (!isValid) {
        setAgeError(error || '나이를 입력해주세요');
        return;
      }
      onComplete({
        ...answers,
        actualAge: parseInt(age.trim(), 10),
      } as SurveyData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isFirstStep) {
      onBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = currentQuestion.type === 'slider' || answers[currentQuestion.id] !== '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        <ProgressBar currentStep={currentStep + 1} totalSteps={questions.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                <currentQuestion.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
                <p className="text-sm text-muted-foreground">{currentQuestion.subtitle}</p>
              </div>
            </div>

            {currentQuestion.type === 'select' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                      answers[currentQuestion.id] === option.value
                        ? 'border-primary bg-secondary'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'slider' && (
              <div className="space-y-6">
                <div className="py-8">
                  <Slider
                    value={[answers[currentQuestion.id] as number]}
                    onValueChange={handleSliderChange}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-accent font-medium">낮음</span>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary">
                      {answers[currentQuestion.id]}
                    </span>
                    <span className="text-muted-foreground ml-1">/10</span>
                  </div>
                  <span className="text-sm text-destructive font-medium">높음</span>
                </div>
              </div>
            )}

            {isLastStep && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-6 border-t border-border"
              >
                <label className="block text-sm font-medium mb-2">
                  실제 나이를 입력해주세요
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={age}
                  onChange={handleAgeChange}
                  placeholder="예: 35"
                  maxLength={3}
                  className={`w-full p-4 rounded-xl border-2 bg-card focus:outline-none transition-colors text-lg font-semibold ${
                    ageError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                  }`}
                />
                {ageError && (
                  <p className="text-sm text-destructive mt-2">{ageError}</p>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            className="flex-1 py-6 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            이전
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed || (isLastStep && !validateAge(age).isValid)}
            className="flex-1 py-6 rounded-xl bg-gradient-hero text-primary-foreground hover:opacity-90"
          >
            {isLastStep ? '분석 시작' : '다음'}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
