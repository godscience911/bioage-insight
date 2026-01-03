export interface SurveyData {
  sleepHours: string;
  exerciseFrequency: string;
  dietQuality: string;
  waterIntake: string;
  stressLevel: number;
  actualAge: number;
}

export interface SurveyResult {
  biologicalAge: number;
  actualAge: number;
  difference: number;
  score: number;
  recommendations: Recommendation[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}
