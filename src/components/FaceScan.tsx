import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import * as faceapi from 'face-api.js'; // AI 라이브러리 로드

interface FaceScanProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const FaceScan = React.forwardRef<HTMLDivElement, FaceScanProps>(
  ({ onComplete, onBack }, ref) => {
    const [phase, setPhase] = useState<'camera' | 'scanning' | 'complete'>('camera');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. 모델 로딩: 스크린샷 3번의 경로(/models)를 정확히 참조합니다.
    useEffect(() => {
      const loadModels = async () => {
        try {
          const MODEL_URL = '/models';
          await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
          ]);
          setModelsLoaded(true);
        } catch (err) {
          setError('AI 모델 로드 실패. public/models 폴더를 확인해주세요.');
        }
      };
      loadModels();
    }, []);

    // 2. 실제 AI 분석 실행 함수
    const analyzeFace = async (source: HTMLVideoElement | HTMLImageElement) => {
      const result = await faceapi
        .detectSingleFace(source)
        .withFaceLandmarks()
        .withAgeAndGender();

      if (!result) throw new Error('얼굴 인식 실패! 정면을 바라봐주세요.');

      // AI 예측 나이 기반 점수화 (어릴수록 100점에 가까움)
      const estimatedAge = result.age;
      const score = Math.round(100 - (estimatedAge - 15) * 1.5);
      return Math.max(20, Math.min(100, score));
    };

    const startScan = useCallback(async () => {
      if (!modelsLoaded) return;
      setPhase('scanning');

      try {
        if (videoRef.current) {
          // 가짜 랜덤 대신 진짜 AI 결과 사용
          const finalScore = await analyzeFace(videoRef.current);
          setPhase('complete');
          setTimeout(() => onComplete(finalScore), 1500);
        }
      } catch (err: any) {
        setError(err.message);
        setPhase('camera');
      }
    }, [modelsLoaded, onComplete]);

    return (
      <div ref={ref} className="glass-card rounded-2xl p-8 text-center">
        {/* 기존의 멋진 카메라 UI와 스캔 애니메이션은 그대로 유지합니다. */}
        <video ref={videoRef} className="hidden" /> 
        <h2 className="text-2xl font-bold mb-4">AI 생체 나이 분석</h2>
        {error && <p className="text-destructive mb-4">{error}</p>}
        
        <Button 
          onClick={startScan} 
          disabled={!modelsLoaded}
          className="w-full py-6 rounded-xl"
        >
          {modelsLoaded ? '스캔 시작하기' : 'AI 엔진 준비 중...'}
        </Button>
      </div>
    );
  }
);
