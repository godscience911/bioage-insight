import { motion } from 'framer-motion';
import React from 'react';

interface GaugeChartProps {
  biologicalAge: number;
  actualAge: number;
}

export const GaugeChart = React.forwardRef<HTMLDivElement, GaugeChartProps>(
  ({ biologicalAge, actualAge }, ref) => {
  const difference = actualAge - biologicalAge;
  const isYounger = difference > 0;
  
  // Calculate angle for the gauge (0-180 degrees)
  // Map biological age to position (assuming range 20-80)
  const minAge = 20;
  const maxAge = 80;
  const normalizedBio = Math.min(Math.max(biologicalAge, minAge), maxAge);
  const normalizedActual = Math.min(Math.max(actualAge, minAge), maxAge);
  
  const bioAngle = ((normalizedBio - minAge) / (maxAge - minAge)) * 180;
  const actualAngle = ((normalizedActual - minAge) / (maxAge - minAge)) * 180;

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <svg viewBox="0 0 200 120" className="w-full">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="50%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" />
          </linearGradient>
        </defs>

        {/* Colored arc */}
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Age labels */}
        <text x="20" y="115" className="fill-muted-foreground text-xs">{minAge}</text>
        <text x="180" y="115" className="fill-muted-foreground text-xs" textAnchor="end">{maxAge}</text>

        {/* Actual age marker */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.circle
            cx="100"
            cy="100"
            r="6"
            className="fill-muted-foreground"
            initial={{ rotate: -90, originX: '100px', originY: '100px' }}
            animate={{ rotate: actualAngle - 90 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{
              transform: `rotate(${actualAngle - 90}deg) translateY(-80px)`,
              transformOrigin: '100px 100px',
            }}
          />
        </motion.g>

        {/* Biological age needle */}
        <motion.g
          initial={{ rotate: -90 }}
          animate={{ rotate: bioAngle - 90 }}
          transition={{ duration: 1.5, delay: 0.3, type: 'spring', stiffness: 50 }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="hsl(var(--foreground))"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="8" className="fill-foreground" />
        </motion.g>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="text-4xl font-bold text-gradient">{biologicalAge}세</div>
          <div className="text-sm text-muted-foreground">생체 나이</div>
        </motion.div>
      </div>

      {/* Comparison badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className={`mx-auto mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          isYounger
            ? 'bg-accent/20 text-accent'
            : 'bg-destructive/20 text-destructive'
        }`}
      >
        <span className="font-semibold">
          {isYounger ? '실제보다 ' : '실제보다 '}
          {Math.abs(difference)}세 {isYounger ? '젊음' : '노화'}
        </span>
      </motion.div>
    </div>
  );
});

GaugeChart.displayName = 'GaugeChart';
