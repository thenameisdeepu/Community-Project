import React from 'react';
import { NeighbrlyWordmark } from './NeighbrlyWordmark';

interface NeighbrlyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  tagline?: string;
  variant?: 'horizontal' | 'vertical';
  dotColor?: string;
}

export const NeighbrlyLogo: React.FC<NeighbrlyLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  tagline,
  variant = 'horizontal',
  dotColor = '#22c55e',
}) => {
  const sizeMap = {
    sm: {
      box: 'w-7 h-7 sm:w-8 sm:h-8',
      text: 'text-base',
      sub: 'text-[9px]',
    },
    md: {
      box: 'w-9 h-9 sm:w-10 sm:h-10',
      text: 'text-lg sm:text-xl',
      sub: 'text-[10px]',
    },
    lg: {
      box: 'w-14 h-14 sm:w-16 sm:h-16',
      text: 'text-2xl sm:text-3xl',
      sub: 'text-xs',
    },
    xl: {
      box: 'w-20 h-20 sm:w-24 sm:h-24',
      text: 'text-3xl sm:text-4xl',
      sub: 'text-sm',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center ${
        variant === 'vertical' ? 'flex-col text-center gap-2' : 'flex-row gap-2.5'
      } ${className}`}
    >
      {/* Neighbrly N-Shaped House Emblem */}
      <div className={`relative ${currentSize.box} shrink-0 flex items-center justify-center`}>
        <svg
          className="w-full h-full drop-shadow-xs"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Green Gradient */}
            <linearGradient id="neighbrlyGreenGrad" x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#2ad37a" />
              <stop offset="35%" stopColor="#22c55e" />
              <stop offset="75%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#006c4a" />
            </linearGradient>

            {/* Deep Navy Gradient */}
            <linearGradient id="neighbrlyNavyGrad" x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#142442" />
              <stop offset="100%" stopColor="#0a1526" />
            </linearGradient>
          </defs>

          {/* Left Navy Pillar with Roof Peak & Overhang */}
          <path
            d="M 24.5 75.5 C 24.5 78 26.5 80 29 80 H 33.5 C 35.5 80 36.5 78.5 36.5 76.5 V 45 L 50.5 34 V 28.5 L 38 19 C 36.5 18 34.5 18 33 19 L 24.5 27 Z"
            fill="url(#neighbrlyNavyGrad)"
          />

          {/* Right Emerald Green Pillar with Roof Peak */}
          <path
            d="M 50.5 28.5 L 63 19 C 64.5 18 66.5 18 68 19 L 76.5 27 V 75.5 C 76.5 78 74.5 80 72 80 H 64 V 63.5 L 55 63.5 L 63.5 54.5 V 45 L 50.5 34 Z"
            fill="url(#neighbrlyGreenGrad)"
          />

          {/* Dark Green Fold Shadow Notch */}
          <polygon points="55,63.5 64,63.5 64,54.5" fill="#023c26" />

          {/* 2x2 Navy Window Panes inside the White House Negative Space */}
          <rect x="45" y="47.5" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
          <rect x="51.6" y="47.5" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
          <rect x="45" y="54.1" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
          <rect x="51.6" y="54.1" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
        </svg>
      </div>

      {/* Brand Wordmark & Tagline with Green 'i' Dot */}
      {showText && (
        <div className={`flex flex-col ${variant === 'vertical' ? 'items-center text-center' : 'text-left'}`}>
          <NeighbrlyWordmark
            className={`font-sans font-extrabold ${currentSize.text} tracking-tight leading-none text-[#00288e] dark:text-[#93b4ff]`}
            dotColor={dotColor}
          />

          {tagline && (
            <span
              className={`font-sans ${currentSize.sub} text-[#444653] dark:text-slate-400 font-medium mt-0.5 tracking-normal whitespace-nowrap`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
