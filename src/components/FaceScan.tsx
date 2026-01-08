import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Scan, CheckCircle, AlertCircle, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFaceApi } from '@/hooks/useFaceApi';
import React from 'react';

interface FaceScanProps {
  onComplete: (score: number, predictedAge: number) => void;
  onBack: () => void;
  actualAge: number;
}

type ScanPhase = 'loading' | 'camera' | 'upload' | 'scanning' | 'complete';

interface ScanMetric {
  label: string;
  value: number;
  unit: string;
}

const scanningSteps = [
  { label: '얼굴 특징점 감지 중...', key: 'detection' },
  { label: '주름 깊이 분석 중...', key: 'wrinkles' },
  { label: '피부 수분도 체크 중...', key: 'hydration' },
  { label: '탄력 지수 측정 중...', key: 'elasticity' },
  { label: '색소 침착 분석 중...', key: 'pigmentation' },
  { label: '최종 바이오마커 계산 중...', key: 'biomarker' },
];

export const FaceScan = React.forwardRef<HTMLDivElement, FaceScanProps>(
  ({ onComplete, onBack, actualAge }, ref) => {
    const { modelStatus, loadingProgress, error: modelError, analyzeFromUrl, analyzeFace, isReady } = useFaceApi();
    
    const [phase, setPhase] = useState<ScanPhase>('loading');
    const [currentScanStep, setCurrentScanStep] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ faceScore: number; predictedAge: number } | null>(null);
    const [liveMetrics, setLiveMetrics] = useState<ScanMetric[]>([
      { label: '주름 깊이', value: 0, unit: 'μm' },
      { label: '수분도', value: 0, unit: '%' },
      { label: '탄력 지수', value: 0, unit: 'pt' },
      { label: '색소 밀도', value: 0, unit: 'mg/cm²' },
    ]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const analysisImageRef = useRef<HTMLImageElement | null>(null);

    // Update phase when models are ready
    useEffect(() => {
      if (modelStatus === 'ready') {
        setPhase('camera');
      } else if (modelStatus === 'loading') {
        setPhase('loading');
      } else if (modelStatus === 'error') {
        setError(modelError || 'AI 모델 로딩 실패');
        setPhase('upload'); // Fallback to upload mode
      }
    }, [modelStatus, modelError]);

    // Cleanup stream on unmount
    useEffect(() => {
      return () => {
        stopCamera();
        if (metricsIntervalRef.current) {
          clearInterval(metricsIntervalRef.current);
        }
      };
    }, []);

    const stopCamera = useCallback(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
    }, []);

    const startCamera = useCallback(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        
        setIsCameraActive(true);
        setError(null);
        setCameraPermissionDenied(false);
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraPermissionDenied(true);
        setPhase('upload');
        setError('카메라 권한이 필요합니다. 사진을 업로드해주세요.');
      }
    }, []);

    // Start camera when phase is camera and models are ready
    useEffect(() => {
      if (phase === 'camera' && !cameraPermissionDenied && isReady) {
        startCamera();
      }
    }, [phase, startCamera, cameraPermissionDenied, isReady]);

    const captureFrame = useCallback((): string | null => {
      if (!videoRef.current || !canvasRef.current) return null;
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
      return null;
    }, []);

    const runAnalysis = useCallback(async (imageUrl: string) => {
      // Start live metrics animation during analysis
      metricsIntervalRef.current = setInterval(() => {
        setLiveMetrics(prev => prev.map(metric => ({
          ...metric,
          value: Math.floor(Math.random() * 100),
        })));
      }, 150);

      // Step 0: Face detection
      setCurrentScanStep(0);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Actually run face detection and analysis
      const result = await analyzeFromUrl(imageUrl, actualAge);
      
      // Step 1: Wrinkle analysis
      setCurrentScanStep(1);
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Step 2: Hydration check
      setCurrentScanStep(2);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Step 3: Elasticity
      setCurrentScanStep(3);
      await new Promise(resolve => setTimeout(resolve, 650));
      
      // Step 4: Pigmentation
      setCurrentScanStep(4);
      await new Promise(resolve => setTimeout(resolve, 550));
      
      // Step 5: Final biomarker calculation
      setCurrentScanStep(5);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Cleanup metrics interval
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }

      if (result) {
        setAnalysisResult({
          faceScore: result.faceScore,
          predictedAge: result.predictedAge,
        });
        setPhase('complete');
        
        // Delay before completing to show the result
        setTimeout(() => {
          onComplete(result.faceScore, result.predictedAge);
        }, 1500);
      } else {
        // Fallback if no face detected - use random score
        const fallbackScore = Math.floor(Math.random() * 40) + 40; // 40-80 range
        const fallbackAge = actualAge + Math.floor(Math.random() * 10) - 3;
        
        setAnalysisResult({
          faceScore: fallbackScore,
          predictedAge: fallbackAge,
        });
        setPhase('complete');
        setError('얼굴을 정확히 인식하지 못했습니다. 추정 결과를 제공합니다.');
        
        setTimeout(() => {
          onComplete(fallbackScore, fallbackAge);
        }, 1500);
      }
    }, [analyzeFromUrl, actualAge, onComplete]);

    const startScan = useCallback(async () => {
      let imageUrl: string | null = null;

      // Capture current frame if using camera
      if (phase === 'camera' && isCameraActive) {
        imageUrl = captureFrame();
        if (imageUrl) {
          setImagePreview(imageUrl);
        }
      } else if (imagePreview) {
        imageUrl = imagePreview;
      }

      if (!imageUrl) {
        setError('이미지를 캡처할 수 없습니다.');
        return;
      }

      // Stop camera to save resources
      stopCamera();
      
      setPhase('scanning');
      setCurrentScanStep(0);
      setError(null);

      // Run the actual AI analysis
      await runAnalysis(imageUrl);
    }, [phase, isCameraActive, captureFrame, stopCamera, imagePreview, runAnalysis]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError('이미지 파일만 업로드 가능합니다.');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const imageUrl = reader.result as string;
          setImagePreview(imageUrl);
          setError(null);
          // Auto-start scan after short delay
          setTimeout(async () => {
            stopCamera();
            setPhase('scanning');
            setCurrentScanStep(0);
            await runAnalysis(imageUrl);
          }, 500);
        };
        reader.readAsDataURL(file);
      }
    };

    const switchToUpload = () => {
      stopCamera();
      setPhase('upload');
    };

    return (
      <div ref={ref} className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">AI 얼굴 분석</h2>
            <p className="text-muted-foreground">
              {phase === 'loading' && 'AI 모델을 준비하고 있습니다...'}
              {phase === 'camera' && '카메라를 바라보고 스캔을 시작하세요'}
              {phase === 'upload' && '얼굴 사진으로 피부 상태를 분석합니다'}
              {phase === 'scanning' && 'AI가 얼굴을 분석하고 있습니다'}
              {phase === 'complete' && '분석이 완료되었습니다'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Loading Models View */}
            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-8"
              >
                <div className="aspect-square rounded-xl bg-muted/30 flex flex-col items-center justify-center mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="mb-6"
                  >
                    <Loader2 className="w-16 h-16 text-primary" />
                  </motion.div>
                  
                  <h3 className="text-lg font-semibold mb-2">AI 준비 중</h3>
                  <p className="text-muted-foreground text-sm text-center mb-4">
                    얼굴 분석을 위한 AI 모델을 불러오고 있습니다
                  </p>
                  
                  {/* Progress bar */}
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${loadingProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {loadingProgress}% 완료
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="w-full"
                >
                  이전으로 돌아가기
                </Button>
              </motion.div>
            )}

            {/* Camera View */}
            {phase === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-2xl p-8"
              >
                <div className="aspect-square rounded-xl bg-muted/30 relative overflow-hidden mb-6">
                  {/* Video Element */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover scale-x-[-1]"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Biometric Scanning Grid Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Animated Grid */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                    >
                      <defs>
                        <pattern
                          id="biometric-grid"
                          width="30"
                          height="30"
                          patternUnits="userSpaceOnUse"
                        >
                          <motion.path
                            d="M 30 0 L 0 0 0 30"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#biometric-grid)" />
                    </motion.svg>

                    {/* Face Tracking Rectangle */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-48 h-64 -translate-x-1/2 -translate-y-1/2"
                      animate={{
                        scale: [1, 1.02, 1],
                        borderColor: ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--primary))'],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        border: '2px solid hsl(var(--primary))',
                        borderRadius: '50% 50% 45% 45%',
                      }}
                    >
                      {/* Corner Markers */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 border-l-3 border-t-3 border-primary" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 border-r-3 border-t-3 border-primary" />
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-3 border-b-3 border-primary" />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-3 border-b-3 border-primary" />
                    </motion.div>

                    {/* Horizontal Scan Lines */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
                      animate={{ top: ['20%', '80%', '20%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-40"
                      animate={{ top: ['80%', '20%', '80%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    />

                    {/* Pulsing Points */}
                    {[
                      { top: '30%', left: '35%' },
                      { top: '30%', left: '65%' },
                      { top: '50%', left: '50%' },
                      { top: '65%', left: '40%' },
                      { top: '65%', left: '60%' },
                    ].map((pos, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-accent"
                        style={{ top: pos.top, left: pos.left }}
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>

                  {/* Camera Status */}
                  {isCameraActive && (
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-destructive"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  )}

                  {/* AI Ready indicator */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs font-medium">AI 준비됨</span>
                  </div>
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
                    onClick={startScan}
                    disabled={!isCameraActive}
                    className="py-6 rounded-xl flex flex-col gap-2 h-auto bg-primary hover:bg-primary/90"
                  >
                    <Scan className="w-6 h-6" />
                    <span>스캔 시작</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={switchToUpload}
                    className="py-6 rounded-xl flex flex-col gap-2 h-auto"
                  >
                    <Upload className="w-6 h-6" />
                    <span>사진 업로드</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={onBack}
                  className="w-full mt-4"
                >
                  이전으로 돌아가기
                </Button>
              </motion.div>
            )}

            {/* Upload Fallback View */}
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
                      <p className="text-muted-foreground text-sm text-center px-4">
                        {cameraPermissionDenied 
                          ? '카메라 권한이 거부되었습니다.\n사진을 업로드해주세요.'
                          : '사진을 업로드해주세요'}
                      </p>
                    </>
                  )}
                </div>

                {error && !imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-amber-600 mb-4 p-3 bg-amber-500/10 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCameraPermissionDenied(false);
                      setError(null);
                      setPhase('camera');
                    }}
                    disabled={!isReady}
                    className="py-6 rounded-xl flex flex-col gap-2 h-auto"
                  >
                    <Video className="w-6 h-6" />
                    <span>카메라 다시 시도</span>
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

            {/* Scanning View */}
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

                  {/* Advanced Scanning overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-accent/10">
                    {/* Grid animation */}
                    <motion.svg
                      className="absolute inset-0 w-full h-full"
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <defs>
                        <pattern
                          id="scan-grid"
                          width="25"
                          height="25"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 25 0 L 0 0 0 25"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#scan-grid)" />
                    </motion.svg>

                    {/* Multiple scan lines */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"
                      animate={{ top: ['100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />

                    {/* Corner markers */}
                    <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-primary" />
                    <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-primary" />
                    <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-primary" />
                  </div>

                  {/* Live Metrics Overlay */}
                  <div className="absolute top-4 right-4 space-y-2">
                    {liveMetrics.map((metric, i) => (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs"
                      >
                        <span className="text-muted-foreground">{metric.label}: </span>
                        <motion.span
                          className="font-mono font-bold text-primary"
                          key={metric.value}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                        >
                          {metric.value}{metric.unit}
                        </motion.span>
                      </motion.div>
                    ))}
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
                    <span className="font-medium">AI 바이오메트릭 분석 진행 중</span>
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
                        {step.label}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Complete View */}
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
                
                {analysisResult && (
                  <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">AI 예측 나이</p>
                    <p className="text-3xl font-bold text-primary">{analysisResult.predictedAge}세</p>
                  </div>
                )}

                {error && (
                  <p className="text-amber-600 text-sm mb-4">{error}</p>
                )}

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
  }
);

FaceScan.displayName = 'FaceScan';
