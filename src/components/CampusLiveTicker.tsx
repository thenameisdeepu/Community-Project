import React from 'react';
import { TickerItem, Language } from '../types';
import { translations } from '../data/translations';

interface CampusLiveTickerProps {
  items: TickerItem[];
  lang: Language;
}

export const CampusLiveTicker: React.FC<CampusLiveTickerProps> = ({ items, lang }) => {
  const t = translations[lang];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-[#c4c5d5]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-ping"></span>
          <h3 className="font-sans font-bold text-base text-[#131b2e]">
            {t.campusLiveTicker}
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#757684] bg-[#f2f3ff] px-2 py-0.5 rounded font-bold">
          {t.liveFeed}
        </span>
      </div>

      <p className="font-sans text-xs text-[#757684] mb-4 leading-normal">
        {t.tickerDesc}
      </p>

      {/* Feed stream list */}
      <div className="flex flex-col gap-2.5">
        {items.map((item) => {
          let badgeColor = 'text-[#006c4a]';
          let iconBg = 'bg-[#82f5c1]/30 text-[#006c4a]';

          if (item.type === 'dispatch') {
            badgeColor = 'text-[#00288e]';
            iconBg = 'bg-[#dde1ff] text-[#00288e]';
          } else if (item.type === 'scheduled') {
            badgeColor = 'text-[#6e3900]';
            iconBg = 'bg-[#ffdcc3] text-[#6e3900]';
          }

          return (
            <div
              key={item.id}
              className="p-2.5 bg-[#f2f3ff] rounded-lg flex items-start gap-3 hover:bg-[#eaedff] transition-colors border border-transparent hover:border-[#dae2fd]"
            >
              <div
                className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5 shadow-2xs`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {item.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] font-bold ${badgeColor}`}>
                    {item.statusLabel}
                  </span>
                  <span className="font-mono text-[10px] text-[#757684]">
                    {item.timeAgo}
                  </span>
                </div>
                <p className="font-sans text-xs text-[#131b2e] font-semibold truncate mt-0.5">
                  {item.title}
                </p>
                <span className="font-sans text-[11px] text-[#757684] block truncate">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
