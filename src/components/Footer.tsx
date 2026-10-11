import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface FooterProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onLangChange }) => {
  const t = translations[lang];

  return (
    <footer className="w-full bg-white border-t border-[#c4c5d5]/30 shadow-[0_1px_8px_rgba(0,0,0,0.03)] py-4 mt-auto">
      <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Accreditation and Standards Badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-sans text-[#757684]">
          <span className="font-mono text-[11px]">{t.accreditedText}</span>
          <span className="text-[#c4c5d5] hidden sm:inline">•</span>
          <span className="font-sans text-[11px]">{t.pilotInitiativeText}</span>
          <span className="text-[#c4c5d5] hidden sm:inline">•</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#006c4a] text-[16px]">
              verified
            </span>
            <span className="font-mono text-[11px] text-[#006c4a] font-semibold">
              {t.wcagText}
            </span>
          </div>
        </div>

        {/* Language switch & Audit stamp */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#f2f3ff] px-2.5 py-1 rounded-lg font-mono text-[11px] text-[#444653]">
            <span className="material-symbols-outlined text-[15px] text-[#757684]">
              language
            </span>
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={`hover:text-[#00288e] transition-colors ${
                lang === 'en' ? 'font-bold text-[#00288e]' : ''
              }`}
            >
              EN
            </button>
            <span className="text-[#c4c5d5]">/</span>
            <button
              type="button"
              onClick={() => onLangChange('kn')}
              className={`hover:text-[#00288e] transition-colors ${
                lang === 'kn' ? 'font-bold text-[#00288e]' : ''
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          <span className="font-mono text-[11px] text-[#757684]">
            {t.auditStamp}
          </span>
        </div>
      </div>
    </footer>
  );
};
