import { useState, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';

type ModelLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface FaceAnalysisResult {
  predictedAge: number;
  gender: string;
  genderProbability: number;
  expressions: faceapi.FaceExpressions | null;
  faceScore: number;
}

const MODEL_URL = '/models';

export const useFaceApi = () => {
  const [modelStatus, setModelStatus] = useState<ModelLoadStatus>('idle');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelStatus('loading');
        setLoadingProgress(10);

        // Load SSD MobileNet for face detection
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        setLoadingProgress(40);

        // Load face landmarks model
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setLoadingProgress(70);

        // Load age and gender model
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        setLoadingProgress(100);

        setModelStatus('ready');
        setError(null);
      } catch (err) {
        console.error('Failed to load face-api models:', err);
        setModelStatus('error');
        setError('AI 모델을 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      }
    };

    loadModels();
  }, []);

  // Analyze face from image element or video element
  const analyzeFace = useCallback(async (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    actualAge: number
  ): Promise<FaceAnalysisResult | null> => {
    if (modelStatus !== 'ready') {
      console.warn('Models not ready');
      return null;
    }

    try {
      // Detect face with landmarks and age/gender
      const detection = await faceapi
        .detectSingleFace(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withAgeAndGender();

      if (!detection) {
        console.warn('No face detected');
        return null;
      }

      const { age: predictedAge, gender, genderProbability } = detection;

      // Calculate face score based on predicted age vs actual age
      // If predicted age is younger than actual = high score
      // If predicted age is older than actual = low score
      const ageDifference = actualAge - predictedAge;
      
      // Score mapping:
      // +10 years younger (or more) predicted = 100 score
      // Same age predicted = 70 score
      // +20 years older predicted = 40 score
      // +40 years older predicted = 20 score
      let faceScore: number;
      
      if (ageDifference >= 10) {
        // Looking 10+ years younger than actual age
        faceScore = 100;
      } else if (ageDifference >= 5) {
        // Looking 5-10 years younger
        faceScore = 90 + (ageDifference - 5) * 2;
      } else if (ageDifference >= 0) {
        // Looking 0-5 years younger
        faceScore = 70 + ageDifference * 4;
      } else if (ageDifference >= -10) {
        // Looking 0-10 years older
        faceScore = 70 + ageDifference * 3; // 70 to 40
      } else if (ageDifference >= -30) {
        // Looking 10-30 years older
        faceScore = 40 + (ageDifference + 10) * 1; // 40 to 20
      } else {
        // Looking 30+ years older
        faceScore = Math.max(20, 20 + (ageDifference + 30) * 0.5);
      }

      // Clamp score between 20 and 100
      faceScore = Math.max(20, Math.min(100, Math.round(faceScore)));

      return {
        predictedAge: Math.round(predictedAge),
        gender,
        genderProbability,
        expressions: null,
        faceScore,
      };
    } catch (err) {
      console.error('Face analysis failed:', err);
      return null;
    }
  }, [modelStatus]);

  // Analyze face from image URL or data URL
  const analyzeFromUrl = useCallback(async (
    imageUrl: string,
    actualAge: number
  ): Promise<FaceAnalysisResult | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        const result = await analyzeFace(img, actualAge);
        resolve(result);
      };
      img.onerror = () => {
        console.error('Failed to load image');
        resolve(null);
      };
      img.src = imageUrl;
    });
  }, [analyzeFace]);

  return {
    modelStatus,
    loadingProgress,
    error,
    analyzeFace,
    analyzeFromUrl,
    isReady: modelStatus === 'ready',
  };
};
