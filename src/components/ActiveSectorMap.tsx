import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface ActiveSectorMapProps {
  lang: Language;
  onSelectZone?: (zoneName: string) => void;
}

export const ActiveSectorMap: React.FC<ActiveSectorMapProps> = ({ lang, onSelectZone }) => {
  const [activePin, setActivePin] = useState<string | null>(null);
  const t = translations[lang];

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-[#c4c5d5]/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00288e] text-[20px]">
            map
          </span>
          <h3 className="font-sans font-bold text-base text-[#131b2e]">
            {t.activeSectorMap}
          </h3>
        </div>
        <span className="font-mono text-[10px] text-[#006c4a] font-semibold bg-[#82f5c1]/30 px-2 py-0.5 rounded">
          {t.geofenceBadge}
        </span>
      </div>

      <div
        className="w-full h-48 bg-cover bg-center rounded-lg relative overflow-hidden shadow-inner border border-[#c4c5d5]/20"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBW6hFWaD9NM4iVMzaJiGom_STQZple4R-Uf28LOSF-bxmPiBh-33JJ9-lslNPfdPA1FLpFJAmgBGrwAwd1YNOXBXD8RbOh4N7F_thAEwNA_YBMR2hZURRUKNpq9ZRSP4zcBsFpQexiHEq3wF_Itqb4SvI0ZuppdZA22Czi5HtEusafuMiZ1lslkGnnPUZcySV_fXZUyVgvTSdfqt4657eSrGjvdWJQkTpN-snveFB2ZgJV4fj4mbtQHQ')`,
        }}
      >
        {/* Synthetic Map Overlay Layer */}
        <div className="absolute inset-0 bg-[#00288e]/10 pointer-events-none"></div>

        {/* Hot Issue Pin 1: Science Wing */}
        <button
          type="button"
          onClick={() => {
            setActivePin('Science Wing');
            if (onSelectZone) onSelectZone('Science Wing');
          }}
          className="absolute top-4 left-6 bg-white hover:bg-[#faf8ff] px-2.5 py-1 rounded shadow-md flex items-center gap-1.5 font-mono text-[10px] text-[#131b2e] border border-red-200 transition-all hover:scale-105 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
          <span className="font-semibold">Science Wing (1 Hot Issue)</span>
        </button>

        {/* Verified Fix Pin 2: Hostel Block C */}
        <button
          type="button"
          onClick={() => {
            setActivePin('Hostel Block C');
            if (onSelectZone) onSelectZone('Hostel Block C');
          }}
          className="absolute bottom-4 right-8 bg-white hover:bg-[#faf8ff] px-2.5 py-1 rounded shadow-md flex items-center gap-1.5 font-mono text-[10px] text-[#131b2e] border border-emerald-200 transition-all hover:scale-105 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]"></span>
          <span className="font-semibold">Hostel Block C (Verified Fix)</span>
        </button>

        {/* Interactive Zone Tooltip */}
        {activePin && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#131b2e]/95 text-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg backdrop-blur-xs flex items-center gap-2">
            <span>Sector selected: {activePin}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePin(null);
              }}
              className="text-gray-300 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
