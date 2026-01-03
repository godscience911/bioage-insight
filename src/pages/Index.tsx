import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeroSection } from '@/components/HeroSection';
import { SurveyForm } from '@/components/SurveyForm';
import { FaceScan } from '@/components/FaceScan';
import { ResultDashboard } from '@/components/ResultDashboard';
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

  const handleFaceScanComplete = useCallback((faceScore: number) => {
    if (!surveyData) return;

    const surveyScore = calculateScore(surveyData);
    
    // Combine survey score (60%) and face score (40%)
    const combinedScore = Math.round(surveyScore * 0.6 + faceScore * 0.4);
    
    // Calculate biological age
    // Higher score = younger biological age
    // Score of 100 = 5 years younger, Score of 50 = actual age, Score of 0 = 5 years older
    const ageAdjustment = Math.round((combinedScore - 50) / 10);
    const biologicalAge = surveyData.actualAge - ageAdjustment;

    setResult({
      biologicalAge: Math.max(18, biologicalAge),
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
    <div className="min-h-screen bg-background">
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
            <FaceScan onComplete={handleFaceScanComplete} onBack={handleBackToSurvey} />
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
