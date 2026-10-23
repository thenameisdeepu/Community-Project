import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/30 relative animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#eaedff]">
          <h3 className="font-sans font-bold text-base text-[#131b2e] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00288e] text-[20px]">
              keyboard
            </span>
            Accessibility & Hotkeys
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#131b2e] rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-2.5 font-sans text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff]">
            <span className="text-[#131b2e] font-medium">Report New Issue</span>
            <kbd className="px-2.5 py-1 rounded bg-white font-mono text-[11px] text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/40">
              N
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff]">
            <span className="text-[#131b2e] font-medium">Quick Filter: Needs Action</span>
            <kbd className="px-2.5 py-1 rounded bg-white font-mono text-[11px] text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/40">
              V
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff]">
            <span className="text-[#131b2e] font-medium">Toggle Language (EN / ಕನ್ನಡ)</span>
            <kbd className="px-2.5 py-1 rounded bg-white font-mono text-[11px] text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/40">
              L
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff]">
            <span className="text-[#131b2e] font-medium">Toggle Dark / Light Theme</span>
            <kbd className="px-2.5 py-1 rounded bg-white font-mono text-[11px] text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/40">
              D
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff]">
            <span className="text-[#131b2e] font-medium">Toggle Collapsible Sidebar</span>
            <kbd className="px-2.5 py-1 rounded bg-white font-mono text-[11px] text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/40">
              Ctrl + B
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f2f3ff]">
            <span className="text-[#131b2e] font-medium">Close Modals / Overlays</span>
            <kbd className="px-2.5 py-1 rounded bg-white font-mono text-[11px] text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/40">
              Esc
            </kbd>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00288e] text-white text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
