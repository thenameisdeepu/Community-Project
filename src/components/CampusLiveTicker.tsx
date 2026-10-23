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
    <div className="bg-white dark:bg-[#151E2E] rounded-xl p-4 sm:p-5 shadow-xs border border-[#c4c5d5]/30 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#006c4a] dark:bg-emerald-400 animate-ping"></span>
          <h3 className="font-sans font-bold text-base text-[#131b2e] dark:text-slate-100">
            {t.campusLiveTicker}
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 bg-[#f2f3ff] dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
          {t.liveFeed}
        </span>
      </div>

      <p className="font-sans text-xs text-[#757684] dark:text-slate-400 mb-4 leading-normal">
        {t.tickerDesc}
      </p>

      {/* Feed stream list */}
      <div className="flex flex-col gap-2.5">
        {items.length === 0 ? (
          <div className="p-6 text-center bg-[#f8f9ff] dark:bg-slate-800/40 rounded-lg border border-dashed border-[#c4c5d5]/50 dark:border-slate-700">
            <span className="material-symbols-outlined text-[28px] text-[#757684]/50 dark:text-slate-500 mb-1">
              rss_feed
            </span>
            <p className="font-sans text-xs font-semibold text-[#131b2e] dark:text-slate-200">
              {lang === 'kn' ? 'ಯಾವುದೇ ಲೈವ್ ನವೀಕರಣಗಳಿಲ್ಲ' : 'No live activity yet.'}
            </p>
            <p className="font-sans text-[11px] text-[#757684] dark:text-slate-400 mt-0.5">
              {lang === 'kn'
                ? 'ಸಕ್ರಿಯ ಸಿಬ್ಬಂದಿ ರವಾನೆಗಳು ಮತ್ತು ಕ್ಷೇತ್ರ ದುರಸ್ತಿಗಳು ಇಲ್ಲಿ ನೈಜ ಸಮಯದಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.'
                : 'Real-time dispatch orders and field contractor activity will stream here.'}
            </p>
          </div>
        ) : (
          items.map((item) => {
            let badgeColor = 'text-[#006c4a] dark:text-emerald-400';
            let iconBg = 'bg-[#82f5c1]/30 dark:bg-emerald-950/60 text-[#006c4a] dark:text-emerald-300';

            if (item.type === 'dispatch') {
              badgeColor = 'text-[#00288e] dark:text-blue-400';
              iconBg = 'bg-[#dde1ff] dark:bg-blue-950/60 text-[#00288e] dark:text-blue-300';
            } else if (item.type === 'scheduled') {
              badgeColor = 'text-[#6e3900] dark:text-amber-400';
              iconBg = 'bg-[#ffdcc3] dark:bg-amber-950/60 text-[#6e3900] dark:text-amber-300';
            }

            return (
              <div
                key={item.id}
                className="p-2.5 bg-[#f2f3ff] dark:bg-slate-800/60 rounded-lg flex items-start gap-3 hover:bg-[#eaedff] dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#dae2fd] dark:hover:border-slate-700"
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
                    <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
                      {item.timeAgo}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#131b2e] dark:text-slate-100 font-semibold truncate mt-0.5">
                    {item.title}
                  </p>
                  <span className="font-sans text-[11px] text-[#757684] dark:text-slate-400 block truncate">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
