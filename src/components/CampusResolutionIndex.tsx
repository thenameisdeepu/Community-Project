import React from 'react';
import { CampusStats, Language } from '../types';
import { translations } from '../data/translations';

interface CampusResolutionIndexProps {
  stats: CampusStats;
  lang: Language;
}

export const CampusResolutionIndex: React.FC<CampusResolutionIndexProps> = ({ stats, lang }) => {
  const t = translations[lang];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-[#c4c5d5]/30">
      <h4 className="font-sans font-bold text-base text-[#131b2e] mb-1">
        {t.resolutionIndexTitle}
      </h4>
      <p className="font-sans text-xs text-[#757684] mb-4">
        {t.resolutionIndexDesc}
      </p>

      {/* Inline SVG Performance Gauge */}
      <div className="flex items-center justify-between p-3.5 bg-[#f2f3ff] rounded-lg mb-4 border border-[#eaedff]">
        <div className="flex flex-col">
          <span className="font-sans text-2xl font-bold text-[#00288e] leading-tight">
            {stats.onTimeSlaRate}%
          </span>
          <span className="font-mono text-[10px] text-[#757684]">
            {t.onTimeSlaFixes}
          </span>
        </div>

        {/* Gauge SVG */}
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-[#e2e7ff]"
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="currentColor"
              strokeWidth="3.2"
            />
            <circle
              className="text-[#006c4a]"
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="currentColor"
              strokeDasharray="87.96"
              strokeDashoffset="2.8"
              strokeLinecap="round"
              strokeWidth="3.2"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-[#006c4a]">
            ✓
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#444653]">{t.avgFirstResponse}</span>
          <span className="font-mono text-[#131b2e] font-bold">
            {stats.avgFirstResponseMinutes} Minutes
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#444653]">{t.avgResolution}</span>
          <span className="font-mono text-[#131b2e] font-bold">
            {stats.avgResolutionHours} Hours
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#444653]">{t.citizenSatisfaction}</span>
          <span className="font-mono text-[#006c4a] font-bold">
            {stats.citizenSatisfaction} / 5.0
          </span>
        </div>
      </div>
    </div>
  );
};
