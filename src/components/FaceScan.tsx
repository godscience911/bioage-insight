import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, AlertCircle, Camera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import * as faceapi from 'face-api.js';

interface FaceScanProps {
  onComplete: (score: number, predictedAge: number) => void;
  onBack: () => void;
  actualAge: number;
}

const scanningSteps = [
  '얼굴 특징점 감지 중...',
  '피부 상태 분석 중...',
  '주름 깊이 측정 중...',
  '생체 나이 계산 중...',
];

export const FaceScan = React.forwardRef<HTMLDivElement, FaceScanProps>(
  ({ onComplete, onBack, actualAge }, ref) => {
    const [phase, setPhase] = useState<'init' | 'camera' | 'scanning' | 'complete'>('init');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [modelLoadProgress, setModelLoadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [cameraReady, setCameraReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // 모델 로딩
    useEffect(() => {
      const loadModels = async () => {
        try {
          const MODEL_URL = '/models';
          setModelLoadProgress(10);
          
          await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
          setModelLoadProgress(40);
          
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          setModelLoadProgress(70);
          
          await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
          setModelLoadProgress(100);
          
          setModelsLoaded(true);
        } catch (err) {
          console.error('Model loading error:', err);
          setError('AI 모델 로드 실패. 페이지를 새로고침해주세요.');
        }
      };
      loadModels();
    }, []);

    // 카메라 시작
    const startCamera = useCallback(async () => {
      setError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // 비디오가 로드될 때까지 대기
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => {
                setCameraReady(true);
                setPhase('camera');
              })
              .catch((err) => {
                console.error('Video play error:', err);
                setError('비디오 재생에 실패했습니다.');
              });
          };
        }
      } catch (err: any) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError') {
          setError('카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
        } else if (err.name === 'NotFoundError') {
          setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
        } else {
          setError(`카메라 오류: ${err.message}`);
        }
      }
    }, []);

    // 카메라 정리
    useEffect(() => {
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
    }, []);

    // AI 분석 실행
    const analyzeFace = async () => {
      if (!videoRef.current) throw new Error('카메라가 준비되지 않았습니다.');
      
      const result = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withAgeAndGender();

      if (!result) throw new Error('얼굴을 인식하지 못했습니다. 정면을 바라봐주세요.');

      const predictedAge = Math.round(result.age);
      const ageDifference = actualAge - predictedAge;
      
      // 점수 계산: 예측 나이가 실제보다 어릴수록 높은 점수
      let score: number;
      if (ageDifference >= 10) {
        score = 100;
      } else if (ageDifference >= 5) {
        score = 90 + (ageDifference - 5);
      } else if (ageDifference >= 0) {
        score = 70 + ageDifference * 4;
      } else if (ageDifference >= -5) {
        score = 70 + ageDifference * 6;
      } else if (ageDifference >= -10) {
        score = 40 + (ageDifference + 5) * 6;
      } else {
        score = Math.max(20, 40 + (ageDifference + 10) * 2);
      }

      return { score: Math.round(score), predictedAge };
    };

    // 스캔 시작
    const startScan = useCallback(async () => {
      if (!modelsLoaded || !cameraReady) return;
      
      setPhase('scanning');
      setCurrentStep(0);
      setError(null);

      // 단계별 애니메이션
      for (let i = 0; i < scanningSteps.length - 1; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentStep(i + 1);
      }

      try {
        const { score, predictedAge } = await analyzeFace();
        setPhase('complete');
        
        setTimeout(() => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          onComplete(score, predictedAge);
        }, 1500);
      } catch (err: any) {
        setError(err.message);
        setPhase('camera');
      }
    }, [modelsLoaded, cameraReady, actualAge, onComplete]);

    return (
      <div ref={ref} className="min-h-screen flex items-center justify-center p-4">
        {/* 숨겨진 비디오 엘리먼트 - 항상 렌더링되어야 함 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={phase === 'init' ? 'hidden' : 'hidden'}
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        />

        <AnimatePresence mode="wait">
          {phase === 'init' && (
            <motion.div 
              key="init"
              className="glass-card rounded-2xl p-8 max-w-md w-full text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">AI 얼굴 분석</h2>
              <p className="text-muted-foreground mb-6">
                카메라로 얼굴을 스캔하여 생체 나이를 분석합니다
              </p>

              {!modelsLoaded ? (
                <div className="space-y-3">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${modelLoadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">AI 엔진 준비 중... {modelLoadProgress}%</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button onClick={startCamera} className="w-full py-6 text-lg">
                    <Camera className="mr-2" /> 카메라 시작
                  </Button>
                  <Button variant="ghost" onClick={onBack} className="w-full">
                    <ArrowLeft className="mr-2 w-4 h-4" /> 이전으로
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm text-left">{error}</span>
                </div>
              )}
            </motion.div>
          )}

          {(phase === 'camera' || phase === 'scanning' || phase === 'complete') && (
            <motion.div 
              key="camera-view"
              className="glass-card rounded-2xl p-6 max-w-lg w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* 카메라 뷰 */}
              <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden mb-6">
                {/* 실제 비디오 피드 */}
                <video
                  autoPlay
                  playsInline
                  muted
                  ref={(el) => {
                    if (el && streamRef.current) {
                      el.srcObject = streamRef.current;
                    }
                  }}
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* 중앙 정렬된 원형 가이드 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border-4 border-primary/60"
                    animate={phase === 'scanning' ? {
                      borderColor: ['hsl(var(--primary) / 0.6)', 'hsl(var(--primary))', 'hsl(var(--primary) / 0.6)'],
                      scale: [1, 1.02, 1],
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>

                {/* 스캔 그리드 오버레이 */}
                {phase === 'scanning' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                      className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 relative"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {/* 스캔 라인 */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      
                      {/* 코너 마커 */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />
                    </motion.div>
                  </div>
                )}

                {/* 완료 오버레이 */}
                <AnimatePresence>
                  {phase === 'complete' && (
                    <motion.div
                      className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                      >
                        <CheckCircle className="w-20 h-20 text-primary" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 상태 텍스트 */}
              <div className="text-center mb-6">
                <AnimatePresence mode="wait">
                  {phase === 'camera' && (
                    <motion.p
                      key="ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-muted-foreground"
                    >
                      얼굴을 원 안에 맞추고 스캔을 시작하세요
                    </motion.p>
                  )}
                  {phase === 'scanning' && (
                    <motion.p
                      key={`step-${currentStep}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-primary font-medium"
                    >
                      {scanningSteps[currentStep]}
                    </motion.p>
                  )}
                  {phase === 'complete' && (
                    <motion.p
                      key="complete"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-primary font-bold"
                    >
                      분석 완료!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* 버튼 */}
              <div className="space-y-3">
                {phase === 'camera' && (
                  <>
                    <Button 
                      onClick={startScan} 
                      className="w-full py-6 text-lg"
                      disabled={!cameraReady}
                    >
                      <Scan className="mr-2" /> 스캔 시작
                    </Button>
                    <Button variant="ghost" onClick={onBack} className="w-full">
                      <ArrowLeft className="mr-2 w-4 h-4" /> 이전으로
                    </Button>
                  </>
                )}
                {phase === 'scanning' && (
                  <Button disabled className="w-full py-6">
                    분석 중...
                  </Button>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm text-left">{error}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FaceScan.displayName = 'FaceScan';
