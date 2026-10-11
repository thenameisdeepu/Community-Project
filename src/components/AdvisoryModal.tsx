import React from 'react';

interface AdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvisoryModal: React.FC<AdvisoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white max-w-lg w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/30 relative animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eaedff]">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#ffdcc3] text-[#743d00] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </span>
            <div>
              <span className="font-mono text-[10px] text-[#6e3900] uppercase font-bold tracking-wider">
                Official Campus Notice #N-88
              </span>
              <h3 className="font-sans font-bold text-base text-[#131b2e]">
                Main Library Block Water Pipeline Maintenance
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#131b2e]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-3 font-sans text-xs text-[#444653] leading-relaxed">
          <p>
            Due to scheduled high-pressure pipe reinforcement along the North Utility Corridor,
            water distribution to Main Library Block and adjacent Study Quad B is temporarily
            suspended until <strong>4:00 PM today</strong>.
          </p>

          <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff]">
            <h5 className="font-mono text-xs font-semibold text-[#00288e] mb-1">
              Active Relief Measures:
            </h5>
            <ul className="list-disc pl-4 space-y-1">
              <li>Emergency water dispensing tankers positioned at Cafeteria Plaza North.</li>
              <li>Washrooms in Science Wing (1st Floor) and Student Center remain fully operational.</li>
              <li>Plumbing Crew #108 on-site completing hydraulic pressure test.</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#00288e] text-white rounded-lg text-xs font-semibold hover:bg-[#1e40af]"
          >
            Dismiss Advisory
          </button>
        </div>
      </div>
    </div>
  );
};
