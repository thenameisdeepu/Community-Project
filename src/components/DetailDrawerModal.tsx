import React, { useState } from 'react';
import { Issue, Language } from '../types';

interface DetailDrawerModalProps {
  issue: Issue | null;
  onClose: () => void;
  lang: Language;
}

export const DetailDrawerModal: React.FC<DetailDrawerModalProps> = ({
  issue,
  onClose,
}) => {
  const [urgentNote, setUrgentNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteSent, setNoteSent] = useState(false);

  if (!issue) return null;

  const handleSendNote = () => {
    if (!urgentNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setShowNoteInput(false);
      setUrgentNote('');
    }, 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white max-w-lg w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/30 relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#eaedff] text-[#00288e] font-semibold">
              {issue.id}
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                issue.status === 'Resolved & Closed'
                  ? 'bg-[#82f5c1]/30 text-[#006c4a]'
                  : issue.status === 'Awaiting Signoff'
                  ? 'bg-[#ffdcc3] text-[#6e3900]'
                  : 'bg-[#dde1ff] text-[#00288e]'
              }`}
            >
              {issue.status}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#131b2e] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Issue Title & Description */}
        <div className="mb-4 shrink-0">
          <h3 className="font-sans font-bold text-lg text-[#131b2e] mb-1">
            {issue.title}
          </h3>
          <p className="font-sans text-xs text-[#757684] leading-relaxed">
            {issue.description}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-sans text-[#444653]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#757684]">
                location_on
              </span>
              {issue.location}
            </span>
            {issue.assignedCrew && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#00288e]">
                <span className="material-symbols-outlined text-[15px]">engineering</span>
                {issue.assignedCrew}
              </span>
            )}
          </div>
        </div>

        {/* Step Timeline */}
        <div className="border-l-2 border-[#e2e7ff] pl-4 space-y-4 mb-6 ml-2 overflow-y-auto pr-1">
          {issue.timeline && issue.timeline.length > 0 ? (
            issue.timeline.map((event, idx) => (
              <div key={idx} className="relative">
                <span
                  className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full ${
                    event.active
                      ? 'bg-[#00288e] ring-4 ring-[#dde1ff]'
                      : event.completed
                      ? 'bg-[#006c4a]'
                      : 'bg-[#c4c5d5]'
                  }`}
                ></span>
                <span className="font-mono text-[10px] text-[#757684] block">
                  {event.time}
                </span>
                <span className="font-sans text-xs font-semibold text-[#131b2e] block mt-0.5">
                  {event.title}
                </span>
                {event.subtitle && (
                  <span className="font-sans text-[11px] text-[#444653] block">
                    {event.subtitle}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs text-[#757684]">No events recorded yet.</div>
          )}
        </div>

        {/* Urgent Note Form */}
        {showNoteInput && (
          <div className="mb-4 p-3 bg-[#f2f3ff] rounded-lg shrink-0">
            <label className="font-mono text-xs text-[#131b2e] font-semibold block mb-1">
              Send Priority Update to Dispatcher:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urgentNote}
                onChange={(e) => setUrgentNote(e.target.value)}
                placeholder="e.g. Water leak spreading into classroom next door..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#c4c5d5] text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#00288e]"
              />
              <button
                type="button"
                onClick={handleSendNote}
                className="px-3 py-1.5 bg-[#00288e] text-white rounded-lg text-xs font-semibold"
              >
                Send
              </button>
            </div>
            {noteSent && (
              <p className="text-[11px] text-[#006c4a] font-semibold mt-1">
                ✓ Priority note dispatched to on-call duty manager!
              </p>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 bg-[#f2f3ff] -mx-6 -mb-6 p-4 rounded-b-xl border-t border-[#eaedff] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-[#c4c5d5]/60 font-sans text-xs font-medium text-[#131b2e] hover:bg-[#eaedff] transition-colors"
          >
            Close Inspector
          </button>
          <button
            type="button"
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="px-3.5 py-1.5 rounded-lg bg-[#1e40af] hover:bg-[#00288e] font-sans text-xs font-semibold text-white shadow-xs transition-colors"
          >
            Send Urgent Note
          </button>
        </div>
      </div>
    </div>
  );
};
