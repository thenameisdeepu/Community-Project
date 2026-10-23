import React, { useState } from 'react';
import { Issue, Language } from '../types';
import {
  translations,
  translateIssueTitle,
  translateIssueDescription,
} from '../data/translations';

interface ResidentVerificationCardProps {
  issue: Issue;
  lang: Language;
  onConfirmResolution: (id: string, rating: number, comments: string) => void;
  onReopenIssue: (id: string, reason: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const ResidentVerificationCard: React.FC<ResidentVerificationCardProps> = ({
  issue,
  lang,
  onConfirmResolution,
  onReopenIssue,
  onClose,
  isModal = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState<string>('');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [showReopenModal, setShowReopenModal] = useState<boolean>(false);
  const [reopenReason, setReopenReason] = useState<string>('');

  const t = translations[lang];
  const ratingDescriptions = t.starRatings;
  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleConfirm = () => {
    setIsConfirmed(true);
    onConfirmResolution(issue.id, rating, comments);
  };

  const handleReopenSubmit = () => {
    const finalReason =
      reopenReason ||
      (lang === 'kn'
        ? 'ಪರಿಹಾರವು ತೃಪ್ತಿಕರವಾಗಿಲ್ಲ ಅಥವಾ ಸಮಸ್ಯೆ ಇನ್ನೂ ಮುಂದುವರಿದಿದೆ ಎಂದು ನಿವಾಸಿ ವರದಿ ಮಾಡಿದ್ದಾರೆ.'
        : 'Resident reported that remediation was incomplete or problem persists.');
    onReopenIssue(issue.id, finalReason);
    setShowReopenModal(false);
  };

  const cardContent = (
    <>
      {isConfirmed ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-8 px-4">
          <div className="w-16 h-16 rounded-full bg-[#82f5c1]/40 text-[#006c4a] flex items-center justify-center shadow-inner animate-in zoom-in-75 duration-200">
            <span className="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <div>
            <span className="font-mono text-xs font-semibold text-[#006c4a] bg-[#82f5c1]/30 px-3 py-1 rounded-full uppercase tracking-wider">
              {lang === 'kn' ? 'ಪರಿಶೀಲನೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Verification Confirmed'}
            </span>
            <h3 className="font-sans font-bold text-xl text-[#006c4a] mt-2">
              {lang === 'kn'
                ? 'ಸಮುದಾಯ ಅನುಮೋದನೆ ದಾಖಲಾಗಿದೆ • ಗುಣಮಟ್ಟ ಸೂಚ್ಯಂಕ ನವೀಕರಿಸಲಾಗಿದೆ'
                : 'Civic Signoff Recorded • Quality Index Updated'}
            </h3>
            <p className="font-sans text-sm text-[#444653] max-w-lg mt-1">
              {lang === 'kn'
                ? `ದೂರು #${issue.id} ಅನ್ನು ${rating}-ಸ್ಟಾರ್ ರೇಟಿಂಗ್‌ನೊಂದಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.`
                : `Complaint #${issue.id} marked as verified with a ${rating}-star rating. Service resolution logged in CommUnity Registry.`}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-mono text-xs text-[#757684]">
              {lang === 'kn' ? 'ದಾಖಲಾದ ರೇಟಿಂಗ್:' : 'Rating recorded:'}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-[22px] ${
                    star <= rating ? 'text-amber-500 fill-1 drop-shadow-xs' : 'text-gray-300'
                  }`}
                >
                  {star <= rating ? 'star' : 'star_border'}
                </span>
              ))}
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-lg bg-[#006c4a] text-white font-sans text-xs font-semibold hover:bg-[#005137] transition-all shadow-sm"
            >
              {lang === 'kn' ? 'ಮುಕ್ತಾಯಗೊಳಿಸಿ / ಮುಚ್ಚಿ' : 'Close / Return to Dashboard'}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 p-4 sm:p-6">
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
                {lang === 'kn'
                  ? `ದಾಖಲಿಸಿದವರು: ${issue.reportedBy || 'ನಿವಾಸಿ'}`
                  : `Reported by: ${issue.reportedBy || 'Resident'}`}
                {issue.division && ` • ${issue.division}`}
              </span>
            </div>

            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#131b2e] mb-1.5 leading-snug">
              {translateIssueTitle(issue, lang)}
            </h2>
            <p className="font-sans text-sm text-[#444653] mb-5 leading-relaxed">
              {translateIssueDescription(issue, lang)}
            </p>

            {/* Before & After Verification Photo Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Photo 1: Incident Photo */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-[#444653] flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                  {t.incidentPhotoSubmitted}
                </span>
                <div className="relative h-44 rounded-lg overflow-hidden bg-[#eaedff] shadow-inner group">
                  {issue.incidentPhoto ? (
                    <img
                      src={issue.incidentPhoto}
                      alt="Incident intake evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#757684] p-4 text-center">
                      <span className="material-symbols-outlined text-[32px] mb-1 text-[#c4c5d5]">
                        image_not_supported
                      </span>
                      <span className="text-[11px] font-mono">
                        {lang === 'kn' ? 'ಫೋಟೋ ಲಗತ್ತಿಸಲಾಗಿಲ್ಲ' : 'Initial photo not attached'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-[#283044]/80 text-[#eef0ff] px-2 py-0.5 rounded font-mono text-[11px] backdrop-blur-xs">
                    {issue.submittedTime ? issue.submittedTime : 'Original Report'}
                  </div>
                </div>
              </div>

              {/* Photo 2: Field Repair Proof */}
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs text-[#006c4a] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                  {t.fieldRepairProofTitle}
                </span>
                <div className="relative h-44 rounded-lg overflow-hidden bg-[#eaedff] shadow-inner group">
                  {issue.repairProofPhoto ? (
                    <img
                      src={issue.repairProofPhoto}
                      alt="Serviced repair proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#006c4a] p-4 text-center bg-[#82f5c1]/10">
                      <span className="material-symbols-outlined text-[38px] mb-1 text-[#006c4a]">
                        task_alt
                      </span>
                      <span className="text-[11px] font-mono font-semibold">
                        {lang === 'kn' ? 'ಕ್ಷೇತ್ರ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Work Order Completed & Signed by Crew'}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-[#006c4a] text-white px-2 py-0.5 rounded font-mono text-[11px] font-medium shadow-xs">
                    {lang === 'kn'
                      ? 'ಪರಿಹಾರ ಪುರಾವೆ ಲಭ್ಯವಿದೆ'
                      : 'Resolution Proof Ready for Citizen Sign-off'}
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
                <strong className="font-semibold text-[#131b2e]">{t.electricianNoteTitle}</strong>{' '}
                "
                {lang === 'kn' && issue.crewNoteKn
                  ? issue.crewNoteKn
                  : issue.crewNote ||
                    (lang === 'kn'
                      ? 'ನಿರ್ವಹಣಾ ಸಿಬ್ಬಂದಿ ಕೆಲಸವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದಾರೆ ಮತ್ತು ತಪಾಸಣೆ ಉತ್ತೀರ್ಣವಾಗಿದೆ.'
                      : 'Maintenance crew has completed the required physical work and passed operational checks.')}
                "
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
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} Star`}
                      onClick={() => {
                        setRating(star);
                        setHoverRating(null);
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`material-symbols-outlined text-[26px] transition-colors ${
                          star <= activeRating
                            ? 'text-amber-500 fill-1 drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      >
                        {star <= activeRating ? 'star' : 'star_border'}
                      </span>
                    </button>
                  ))}
                  <span className="ml-2 font-mono text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {ratingDescriptions[activeRating - 1] || `${activeRating}/5`}
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-sans text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{t.confirmResolvedBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-[#eaedff] text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a] font-sans text-xs font-medium transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>{t.reportStillUnfixedBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {isModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#283044]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-[#c4c5d5]/40 relative my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-[#f2f3ff] border-b border-[#eaedff] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#006c4a] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#131b2e]">
                    {lang === 'kn'
                      ? 'ನಿವಾಸಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಸೇವಾ ಅನುಮೋದನೆ'
                      : 'Resident Verification & Service Sign-off'}
                  </h3>
                  <span className="font-mono text-[10px] text-[#757684]">
                    {lang === 'kn' ? 'ದೂರು ಐಡಿ:' : 'Complaint Reference:'} {issue.id}
                  </span>
                </div>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-[#757684] hover:text-[#131b2e] hover:bg-[#e2e7ff] rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1">{cardContent}</div>
          </div>
        </div>
      ) : (
        <section
          id="resident-verification-module"
          className="mb-8 bg-white rounded-xl shadow-sm border border-[#c4c5d5]/30 transition-all overflow-hidden"
        >
          {cardContent}
        </section>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#283044]/60 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/40 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">
                  report_problem
                </span>
                <h3 className="font-sans font-bold text-base text-[#131b2e]">
                  {t.reopenModalTitle} #{issue.id}
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
              {t.reopenModalDesc}
            </p>
            <textarea
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder={t.reopenPlaceholder}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] text-xs font-sans text-[#131b2e] border border-[#c4c5d5] focus:ring-1 focus:ring-[#00288e] focus:outline-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-sans text-[#444653] hover:bg-[#eaedff]"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleReopenSubmit}
                className="px-4 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-sans font-semibold hover:bg-[#93000a] transition-all cursor-pointer"
              >
                {t.reopenSubmitBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
