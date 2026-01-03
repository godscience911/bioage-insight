import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Scan, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceScanProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type ScanPhase = 'upload' | 'scanning' | 'complete';

const scanningSteps = [
  '얼굴 감지 중...',
  '피부 특징 분석 중...',
  '주름 패턴 분석 중...',
  '피부 탄력 측정 중...',
  '색소 분포 분석 중...',
  '최종 결과 계산 중...',
];

export const FaceScan = ({ onComplete, onBack }: FaceScanProps) => {
  const [phase, setPhase] = useState<ScanPhase>('upload');
  const [currentScanStep, setCurrentScanStep] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateScan = useCallback(() => {
    setPhase('scanning');
    setCurrentScanStep(0);

    const interval = setInterval(() => {
      setCurrentScanStep((prev) => {
        if (prev >= scanningSteps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setPhase('complete');
            // Generate random face scan score (40-100)
            const faceScore = Math.floor(Math.random() * 60) + 40;
            setTimeout(() => onComplete(faceScore), 1500);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  }, [onComplete]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setError(null);
        setTimeout(simulateScan, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    // Simulate camera capture with a placeholder
    setImagePreview('/placeholder.svg');
    setTimeout(simulateScan, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">AI 얼굴 분석</h2>
          <p className="text-muted-foreground">
            얼굴 사진을 업로드하여 피부 상태를 분석합니다
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Face preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Camera className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      사진을 업로드해주세요
                    </p>
                  </>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-destructive mb-4 p-3 bg-destructive/10 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleCameraCapture}
                  className="py-6 rounded-xl flex flex-col gap-2 h-auto"
                >
                  <Camera className="w-6 h-6" />
                  <span>카메라 촬영</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-6 rounded-xl flex flex-col gap-2 h-auto"
                >
                  <Upload className="w-6 h-6" />
                  <span>사진 업로드</span>
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                variant="ghost"
                onClick={onBack}
                className="w-full mt-4"
              >
                이전으로 돌아가기
              </Button>
            </motion.div>
          )}

          {phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="aspect-square rounded-xl bg-muted/30 relative overflow-hidden mb-6">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Face preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Scanning overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-accent/20">
                  {/* Scan line animation */}
                  <motion.div
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />

                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern
                          id="grid"
                          width="40"
                          height="40"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Corner markers */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary" />
                </div>

                {/* Pulsing center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-24 h-24 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Scan className="w-5 h-5 text-primary animate-pulse-glow" />
                  <span className="font-medium">AI 분석 진행 중</span>
                </div>

                <div className="space-y-2">
                  {scanningSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: index <= currentScanStep ? 1 : 0.3,
                        x: 0,
                      }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-2 text-sm ${
                        index <= currentScanStep
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index < currentScanStep
                            ? 'bg-accent'
                            : index === currentScanStep
                            ? 'bg-primary animate-pulse'
                            : 'bg-muted'
                        }`}
                      />
                      {step}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 text-accent" />
              </motion.div>

              <h3 className="text-xl font-bold mb-2">분석 완료!</h3>
              <p className="text-muted-foreground">
                결과를 확인하는 중입니다...
              </p>

              <motion.div
                className="mt-6"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
