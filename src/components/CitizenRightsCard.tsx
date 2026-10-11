import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

interface CitizenRightsCardProps {
  lang: Language;
}

export const CitizenRightsCard: React.FC<CitizenRightsCardProps> = ({ lang }) => {
  const [showCharterModal, setShowCharterModal] = useState(false);
  const t = translations[lang];

  return (
    <>
      <div className="bg-[#00288e] text-white rounded-xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[20px] text-[#dde1ff]">
            policy
          </span>
          <h4 className="font-sans font-bold text-base text-white">
            {t.citizenRightsTitle}
          </h4>
        </div>

        <p className="font-sans text-xs text-white/90 mb-4 leading-relaxed">
          {t.citizenRightsDesc}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-white/20">
          <span className="font-mono text-[10px] text-[#dde1ff]">
            {t.pilotProtocol}
          </span>
          <button
            type="button"
            onClick={() => setShowCharterModal(true)}
            className="font-sans text-xs underline text-white hover:text-[#dde1ff] transition-colors"
          >
            {t.reviewCharter}
          </button>
        </div>
      </div>

      {/* Service Charter Modal */}
      {showCharterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/40 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00288e] text-[22px]">
                  verified_user
                </span>
                <h3 className="font-sans font-bold text-base text-[#131b2e]">
                  Greenwood Campus Civic Charter
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCharterModal(false)}
                className="text-[#757684] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs text-[#444653] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-[#f2f3ff] rounded-lg">
                <strong className="text-[#00288e] block mb-1">
                  Section 1: 15-Minute Triage Guarantee
                </strong>
                Every submitted safety or utility hazard receives initial verification and dispatch triage within 15 minutes by Campus Operations.
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-lg">
                <strong className="text-[#00288e] block mb-1">
                  Section 2: Resident Sovereign Verification
                </strong>
                No field work order is marked officially closed until confirmed by the resident who logged the ticket, accompanied by photographic proof.
              </div>

              <div className="p-3 bg-[#f2f3ff] rounded-lg">
                <strong className="text-[#00288e] block mb-1">
                  Section 3: Automatic Provost Escalation
                </strong>
                If high-severity hazards remain in active status past 24 hours, notification is routed directly to the Provost Operations Directorate with priority audit status.
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCharterModal(false)}
                className="px-4 py-2 bg-[#00288e] text-white rounded-lg text-xs font-semibold hover:bg-[#1e40af]"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
