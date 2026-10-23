import React from 'react';
import { CampusStats, Language } from '../types';
import { translations } from '../data/translations';

interface CampusResolutionIndexProps {
  stats: CampusStats;
  lang: Language;
}

export const CampusResolutionIndex: React.FC<CampusResolutionIndexProps> = ({ stats, lang }) => {
  const t = translations[lang];

  const hasSla = stats.onTimeSlaRate != null;
  const hasFirstResponse = stats.avgFirstResponseMinutes != null;
  const hasAvgResolution = stats.avgResolutionHours != null;
  const hasSatisfaction = stats.citizenSatisfaction != null;

  // Circumference for r=14 is 2 * PI * 14 ≈ 87.96
  const circumference = 87.96;
  const slaPercentage = hasSla ? Math.max(0, Math.min(100, stats.onTimeSlaRate!)) : 0;
  const dashOffset = hasSla ? circumference - (circumference * slaPercentage) / 100 : circumference;

  return (
    <div className="bg-white dark:bg-[#151E2E] rounded-xl p-4 sm:p-5 shadow-xs border border-[#c4c5d5]/30 dark:border-slate-800 transition-colors">
      <h4 className="font-sans font-bold text-base text-[#131b2e] dark:text-slate-100 mb-1">
        {t.resolutionIndexTitle}
      </h4>
      <p className="font-sans text-xs text-[#757684] dark:text-slate-400 mb-4">
        {t.resolutionIndexDesc}
      </p>

      {/* Inline SVG Performance Gauge */}
      <div className="flex items-center justify-between p-3.5 bg-[#f2f3ff] dark:bg-slate-800/60 rounded-lg mb-4 border border-[#eaedff] dark:border-slate-700">
        <div className="flex flex-col">
          <span className="font-sans text-2xl font-bold text-[#00288e] dark:text-blue-400 leading-tight">
            {hasSla ? `${stats.onTimeSlaRate}%` : 'N/A'}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {hasSla ? t.onTimeSlaFixes : (lang === 'kn' ? 'SLA ದತ್ತಾಂಶವಿಲ್ಲ' : 'Awaiting SLA data')}
          </span>
        </div>

        {/* Gauge SVG */}
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-[#e2e7ff] dark:text-slate-700"
              cx="18"
              cy="18"
              fill="none"
              r="14"
              stroke="currentColor"
              strokeWidth="3.2"
            />
            {hasSla && (
              <circle
                className="text-[#006c4a] dark:text-emerald-400 transition-all duration-500 ease-out"
                cx="18"
                cy="18"
                fill="none"
                r="14"
                stroke="currentColor"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${dashOffset}`}
                strokeLinecap="round"
                strokeWidth="3.2"
              />
            )}
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold ${
            hasSla ? 'text-[#006c4a] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {hasSla ? '✓' : '—'}
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#444653] dark:text-slate-300">{t.avgFirstResponse}</span>
          <span className="font-mono text-[#131b2e] dark:text-slate-100 font-bold">
            {hasFirstResponse ? `${stats.avgFirstResponseMinutes} Minutes` : 'N/A'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#444653] dark:text-slate-300">{t.avgResolution}</span>
          <span className="font-mono text-[#131b2e] dark:text-slate-100 font-bold">
            {hasAvgResolution ? `${stats.avgResolutionHours} Hours` : 'N/A'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#444653] dark:text-slate-300">{t.citizenSatisfaction}</span>
          <span className={`font-mono font-bold ${
            hasSatisfaction ? 'text-[#006c4a] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {hasSatisfaction ? `${stats.citizenSatisfaction} / 5.0` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
