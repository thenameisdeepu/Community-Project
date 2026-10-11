import React, { useState } from 'react';
import { Issue, Language } from '../types';
import { translations } from '../data/translations';

interface ResidentVerificationCardProps {
  issue: Issue;
  lang: Language;
  onConfirmResolution: (id: string, rating: number, comments: string) => void;
  onReopenIssue: (id: string, reason: string) => void;
}

export const ResidentVerificationCard: React.FC<ResidentVerificationCardProps> = ({
  issue,
  lang,
  onConfirmResolution,
  onReopenIssue,
}) => {
  const [rating, setRating] = useState<number>(4);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');

  const t = translations[lang];

  const ratingDescriptions = ['1/5 Poor', '2/5 Fair', '3/5 Adequate', '4/5 Good', '5/5 Excellent'];
  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirmResolution(issue.id, rating, comments);
  };

  const handleReopenSubmit = () => {
    const finalReason = reopenReason || 'Resident verified that illumination remains dim or flickering.';
    onReopenIssue(issue.id, finalReason);
    setShowReopenModal(false);
  };

  if (isConfirmed) {
    return (
      <section
        id="resident-verification-module"
        className="mb-8 bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#82f5c1]/60 transition-all"
      >
        <div className="flex flex-col items-center justify-center text-center gap-3 py-4">
          <div className="w-14 h-14 rounded-full bg-[#82f5c1]/40 text-[#006c4a] flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[32px]">verified</span>
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-[#006c4a] bg-[#82f5c1]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Verification Confirmed
            </span>
            <h3 className="font-sans font-bold text-xl text-[#006c4a] mt-2">
              Civic Signoff Recorded • Quality Index Updated
            </h3>
            <p className="font-sans text-sm text-[#444653] max-w-lg mt-1">
              Ticket <strong className="font-mono text-[#00288e]">{issue.id}</strong> marked as verified by Resident Dr. A. Sharma with a {rating}-star rating. Crew performance logged in Greenwood Pilot Registry.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-xs text-[#757684]">Rating recorded:</span>
            <div className="flex text-[#ffdcc3]">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-[18px] ${
                    star <= rating ? 'text-[#743d00]' : 'text-gray-300'
                  }`}
                >
                  star
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="resident-verification-module"
        className="mb-8 bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-[#c4c5d5]/30 transition-all"
      >
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          {/* Left: Case Details & Field Evidence Images */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded font-mono text-xs bg-[#ffdad6] text-[#93000a] font-semibold">
                {t.actionNeeded}
              </span>
              <span className="font-mono text-xs bg-[#eaedff] px-2 py-0.5 rounded text-[#1e40af] font-semibold">
                {issue.id}
              </span>
              <span className="font-sans text-xs text-[#757684]">
                Submitted {issue.submittedTime} • {issue.division || 'Campus Safety Division'}
              </span>
            </div>

            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#131b2e] mb-1.5 leading-snug">
              {issue.title}
            </h2>
            <p className="font-sans text-sm text-[#444653] mb-5 leading-relaxed">
              {issue.description}
            </p>

            {/* Before & After Verification Photo Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1: Incident Photo */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-[#444653] flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                  Incident Photo (Submitted)
                </span>
                <div className="relative h-44 rounded-lg overflow-hidden bg-[#eaedff] shadow-inner group">
                  <img
                    src={issue.incidentPhoto}
                    alt="Night photo of streetlight"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#283044]/80 text-[#eef0ff] px-2 py-0.5 rounded font-mono text-[11px] backdrop-blur-xs">
                    12 Oct • 21:14
                  </div>
                </div>
              </div>

              {/* Photo 2: Field Repair Proof */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-[#006c4a] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                  Field Repair Proof (Crew Dispatch #104)
                </span>
                <div className="relative h-44 rounded-lg overflow-hidden bg-[#eaedff] shadow-inner group">
                  <img
                    src={issue.repairProofPhoto}
                    alt="Day photo of serviced LED luminaire"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#006c4a] text-white px-2 py-0.5 rounded font-mono text-[11px] font-medium shadow-xs">
                    Today • 11:20 AM • LED Module Replaced
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Work Notes */}
            <div className="mt-4 p-3 bg-[#f2f3ff] rounded-lg flex items-start gap-3 border border-[#dae2fd]/60">
              <span className="material-symbols-outlined text-[#006c4a] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="text-xs font-sans text-[#444653] leading-relaxed">
                <strong className="font-semibold text-[#131b2e]">Electrician Crew Note:</strong>{' '}
                "{issue.crewNote || 'Replaced burnt 70W ballast and installed IP66 rated low-draw warm LED unit. Checked grounding circuit across Pole #C-12. Operational test passed.'}"
              </div>
            </div>
          </div>

          {/* Right: Resident Interactive Verification Form */}
          <div className="w-full lg:w-80 shrink-0 bg-[#f2f3ff] p-5 rounded-xl flex flex-col justify-between border border-[#c4c5d5]/30 shadow-xs">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-[#00288e] tracking-wider block mb-1">
                {t.communitySignoff}
              </span>
              <h3 className="font-sans font-bold text-lg text-[#131b2e] mb-1.5">
                {t.didFixResolve}
              </h3>
              <p className="font-sans text-xs text-[#444653] mb-4 leading-normal">
                {t.didFixDesc}
              </p>

              {/* 5-Star Rating Widget */}
              <div className="mb-4">
                <label className="font-mono text-xs text-[#131b2e] block mb-1.5 font-semibold">
                  {t.serviceQualitySpeed}
                </label>
                <div className="flex items-center gap-1 text-[#6e3900]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} Star`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <span
                        className={`material-symbols-outlined text-[24px] ${
                          star <= activeRating ? 'text-[#743d00]' : 'text-gray-300'
                        }`}
                      >
                        {star <= activeRating ? 'star' : 'star_border'}
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 font-mono text-xs text-[#444653]">
                    {ratingDescriptions[activeRating - 1]}
                  </span>
                </div>
              </div>

              {/* Optional Comments Textarea */}
              <div className="mb-4">
                <label
                  htmlFor="verification-notes"
                  className="font-mono text-xs text-[#131b2e] block mb-1 font-semibold"
                >
                  {t.residentComments}
                </label>
                <textarea
                  id="verification-notes"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={t.commentsPlaceholder}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white text-xs font-sans text-[#131b2e] placeholder:text-[#757684] focus:outline-none focus:ring-1 focus:ring-[#00288e] border border-[#c4c5d5]/60"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-sans text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{t.confirmResolvedBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-[#eaedff] text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a] font-sans text-xs font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>{t.reportStillUnfixedBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/40 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">
                  report_problem
                </span>
                <h3 className="font-sans font-bold text-base text-[#131b2e]">
                  Reopen Work Order #{issue.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="text-[#757684] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <p className="font-sans text-xs text-[#444653] mb-3 leading-normal">
              Please specify why this infrastructure item is still unserviceable. An urgent re-inspection will be escalated to the supervisor desk.
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Light was flickering again at night, or pole alignment is off..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] text-xs font-sans text-[#131b2e] border border-[#c4c5d5] focus:ring-1 focus:ring-[#00288e] focus:outline-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-sans text-[#444653] hover:bg-[#eaedff]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenSubmit}
                className="px-4 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-sans font-semibold hover:bg-[#93000a] transition-all"
              >
                Escalate & Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
