import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection';
import { SurveyForm } from '@/components/SurveyForm';
import { FaceScan } from '@/components/FaceScan';
import { ResultDashboard } from '@/components/ResultDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { SurveyData, SurveyResult } from '@/types/survey';

type AppStep = 'hero' | 'survey' | 'faceScan' | 'result';

const calculateScore = (data: SurveyData): number => {
  const scoreMap: Record<string, Record<string, number>> = {
    sleepHours: { '4': 20, '5': 40, '6': 60, '7': 100, '9': 70 },
    exerciseFrequency: { '0': 20, '1': 50, '3': 90, '5': 100 },
    dietQuality: { daily: 20, often: 40, sometimes: 70, rarely: 100 },
    waterIntake: { '500': 20, '1000': 50, '1500': 80, '2000': 100 },
  };

  let totalScore = 0;

  // Sleep score
  totalScore += scoreMap.sleepHours[data.sleepHours] || 50;
  
  // Exercise score
  totalScore += scoreMap.exerciseFrequency[data.exerciseFrequency] || 50;
  
  // Diet score
  totalScore += scoreMap.dietQuality[data.dietQuality] || 50;
  
  // Water score
  totalScore += scoreMap.waterIntake[data.waterIntake] || 50;
  
  // Stress score (inverted - lower stress = higher score)
  totalScore += (11 - data.stressLevel) * 10;

  // Average score (5 categories)
  return Math.round(totalScore / 5);
};

const Index = () => {
  const [step, setStep] = useState<AppStep>('hero');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [result, setResult] = useState<SurveyResult | null>(null);

  const handleStartSurvey = useCallback(() => {
    setStep('survey');
  }, []);

  const handleSurveyComplete = useCallback((data: SurveyData) => {
    setSurveyData(data);
    setStep('faceScan');
  }, []);

  const handleFaceScanComplete = useCallback((faceScore: number, predictedAge: number) => {
    if (!surveyData) return;

    const surveyScore = calculateScore(surveyData);
    
    // Face score weight: 70%, survey score: 30%
    const combinedScore = Math.round(surveyScore * 0.3 + faceScore * 0.7);
    
    // Use AI predicted age directly as the biological age
    // Then apply minor adjustments based on survey score
    const surveyAdjustment = (surveyScore - 50) / 50 * 3; // ±3 years based on lifestyle
    const biologicalAge = Math.round(predictedAge - surveyAdjustment);

    setResult({
      biologicalAge: Math.max(18, Math.min(120, biologicalAge)),
      actualAge: surveyData.actualAge,
      difference: surveyData.actualAge - biologicalAge,
      score: combinedScore,
      recommendations: [],
    });
    setStep('result');
  }, [surveyData]);

  const handleRestart = useCallback(() => {
    setStep('hero');
    setSurveyData(null);
    setResult(null);
  }, []);

  const handleBackToHero = useCallback(() => {
    setStep('hero');
  }, []);

  const handleBackToSurvey = useCallback(() => {
    setStep('survey');
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle - Fixed Position */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ThemeToggle />
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection onStart={handleStartSurvey} />
          </motion.div>
        )}

        {step === 'survey' && (
          <motion.div
            key="survey"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <SurveyForm onComplete={handleSurveyComplete} onBack={handleBackToHero} />
          </motion.div>
        )}

        {step === 'faceScan' && (
          <motion.div
            key="faceScan"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <FaceScan 
              onComplete={handleFaceScanComplete} 
              onBack={handleBackToSurvey}
              actualAge={surveyData?.actualAge || 30}
            />
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ResultDashboard result={result} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
