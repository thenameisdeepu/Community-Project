import React, { useState, useRef, useEffect } from 'react';
import { Issue, Language } from '../types';
import {
  translations,
  translateStatus,
  translateIssueTitle,
  translateIssueLocation,
  translateIssueDescription,
  translateCrew,
  translateCategory,
} from '../data/translations';

interface DetailDrawerModalProps {
  issue: Issue | null;
  onClose: () => void;
  lang: Language;
  onReviewAndSignoff?: (issue: Issue) => void;
  userRole?: string;
  onUploadRepairProof?: (issueId: string, proofUrl: string, note: string) => void;
  onDeleteIssue?: (issueId: string) => void;
  onRateIssue?: (issueId: string, rating: number, comments?: string) => void;
}

export const DetailDrawerModal: React.FC<DetailDrawerModalProps> = ({
  issue,
  onClose,
  lang,
  onReviewAndSignoff,
  userRole,
  onUploadRepairProof,
  onDeleteIssue,
  onRateIssue,
}) => {
  const [urgentNote, setUrgentNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteSent, setNoteSent] = useState(false);

  // Resident rating interactive state
  const [residentRating, setResidentRating] = useState<number>(issue?.resolutionRating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [residentComment, setResidentComment] = useState<string>(issue?.residentComments || '');
  const [ratingSavedToast, setRatingSavedToast] = useState(false);

  useEffect(() => {
    if (issue) {
      setResidentRating(issue.resolutionRating || 5);
      setResidentComment(issue.residentComments || '');
      setRatingSavedToast(false);
    }
  }, [issue]);

  // Maintenance completion state
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [repairProofPhoto, setRepairProofPhoto] = useState('');
  const [isWorkCompleted, setIsWorkCompleted] = useState(true);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (issue) {
      setMaintenanceNote(
        issue.crewNote ||
          `Field repair completed according to safety standards for ${issue.title}. Operational test passed and site verified safe.`
      );
      setRepairProofPhoto(
        issue.repairProofPhoto ||
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
      );
      setIsWorkCompleted(true);
      setProofSubmitted(false);
    }
  }, [issue]);

  if (!issue) return null;

  const isAwaiting = issue.status === 'Awaiting Signoff' || issue.isNeedsVerification;
  const isMaintenanceOrAdmin = userRole === 'maintenance' || userRole === 'admin';

  const handleSendNote = () => {
    if (!urgentNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setNoteSent(false);
      setShowNoteInput(false);
      setUrgentNote('');
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setRepairProofPhoto(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitMaintenanceProof = () => {
    if (!repairProofPhoto) {
      alert(lang === 'kn' ? 'ದಯವಿಟ್ಟು ದುರಸ್ತಿ ಪುರಾವೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.' : 'Please upload an image proof of work completed.');
      return;
    }
    if (onUploadRepairProof) {
      onUploadRepairProof(
        issue.id,
        repairProofPhoto,
        maintenanceNote.trim() || 'Work order completed and verified safe by maintenance technician.'
      );
      setProofSubmitted(true);
      setTimeout(() => {
        setProofSubmitted(false);
      }, 3500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#283044]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-[#c4c5d5]/30 relative animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#eaedff] text-[#00288e] font-semibold">
              {issue.id}
            </span>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#f2f3ff] text-[#444653] font-medium border border-[#c4c5d5]/30">
              {translateCategory(issue.category, lang)}
            </span>
            <span
              className={`font-mono text-xs font-semibold px-2.5 py-1 rounded ${
                issue.status === 'Resolved & Closed'
                  ? 'bg-[#82f5c1]/30 text-[#006c4a]'
                  : isAwaiting
                  ? 'bg-[#ffdcc3] text-[#6e3900]'
                  : 'bg-[#dde1ff] text-[#00288e]'
              }`}
            >
              {translateStatus(issue.status, lang)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteIssue && isMaintenanceOrAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(lang === 'kn' ? 'ಈ ದೂರನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?' : 'Remove this complaint?')) {
                    onDeleteIssue(issue.id);
                    onClose();
                  }
                }}
                className="px-2.5 py-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded text-xs font-mono transition-colors cursor-pointer"
                title="Delete this complaint"
              >
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">delete</span>
                {lang === 'kn' ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#757684] hover:text-[#131b2e] hover:bg-[#e2e7ff] rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Issue Title & Description */}
        <div className="mb-3 shrink-0">
          <h3 className="font-sans font-bold text-lg text-[#131b2e] mb-1">
            {translateIssueTitle(issue, lang)}
          </h3>
          <p className="font-sans text-xs text-[#444653] leading-relaxed">
            {translateIssueDescription(issue, lang)}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-sans text-[#444653]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#757684]">
                location_on
              </span>
              {translateIssueLocation(issue, lang)}
            </span>
            {issue.reportedBy && (
              <span className="flex items-center gap-1 text-[#757684]">
                <span className="material-symbols-outlined text-[15px]">person</span>
                {issue.reportedBy}
              </span>
            )}
            {issue.assignedCrew && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#00288e]">
                <span className="material-symbols-outlined text-[15px]">engineering</span>
                {translateCrew(issue.assignedCrew, lang)}
              </span>
            )}
            {issue.submittedTime && (
              <span className="font-mono text-[11px] text-[#757684]">
                {lang === 'kn' ? 'ಸಲ್ಲಿಸಲಾಗಿದೆ:' : 'Submitted:'} {issue.submittedTime}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable middle container */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* SPECIAL SECTION FOR MAINTENANCE: MENTION WORK IS COMPLETED & UPLOAD IMAGE PROOF */}
          {isMaintenanceOrAdmin && (
            <div className="p-4 bg-[#f8f9ff] rounded-xl border-2 border-[#006c4a]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
                    engineering
                  </span>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-[#131b2e]">
                      {lang === 'kn' ? 'ನಿರ್ವಹಣಾ ಸಿಬ್ಬಂದಿ ಕ್ರಮ: ಕೆಲಸ ಪೂರ್ಣಗೊಳಿಸಿ & ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Technician Work Order: Complete Work & Upload Proof'}
                    </h4>
                    <span className="text-[11px] text-[#757684]">
                      {lang === 'kn' ? 'ದುರಸ್ತಿ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ ಹಾಗೂ ಪುರಾವೆ ಒದಗಿಸಿ' : 'Mention work is completed and attach photographic proof of repair'}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-[#006c4a]/30">
                  <input
                    type="checkbox"
                    checked={isWorkCompleted}
                    onChange={(e) => setIsWorkCompleted(e.target.checked)}
                    className="w-4 h-4 text-[#006c4a] rounded"
                  />
                  <span className="font-sans text-xs font-bold text-[#006c4a]">
                    {lang === 'kn' ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ' : 'Work Completed'}
                  </span>
                </label>
              </div>

              {/* Technician Completion Notes */}
              <div>
                <label className="font-mono text-[11px] font-semibold text-[#131b2e] block mb-1">
                  {lang === 'kn' ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡ ವಿವರಣೆ (ತಂತ್ರಜ್ಞರ ಟಿಪ್ಪಣಿ):' : 'Work Completed Summary & Materials Replaced:'}
                </label>
                <textarea
                  rows={2}
                  value={maintenanceNote}
                  onChange={(e) => setMaintenanceNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                  placeholder="Mention parts replaced, tests conducted, and confirmation of completed repair..."
                />
              </div>

              {/* Space to Upload an Image Proof of Work Completed */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] font-semibold text-[#006c4a] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
                    <span>{lang === 'kn' ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡ ಫೋಟೋ ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ:' : 'Space to Upload Image Proof of Work Completed:'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-[#006c4a] hover:bg-[#005137] text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">upload_file</span>
                    <span>{lang === 'kn' ? 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ' : 'Browse File'}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {repairProofPhoto ? (
                  <div className="relative h-40 rounded-xl overflow-hidden bg-[#eaedff] border border-[#006c4a]/40">
                    <img
                      src={repairProofPhoto}
                      alt="Work completed proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#006c4a] text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                      {lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡ ಪುರಾವೆ' : 'Work Proof Attached'}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2 px-2 py-1 bg-white/90 text-[#131b2e] rounded text-[11px] font-semibold hover:bg-white"
                    >
                      {lang === 'kn' ? 'ಬದಲಾಯಿಸಿ' : 'Change'}
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-[#006c4a]/50 bg-white hover:bg-[#eaedff]/30 transition-colors flex flex-col items-center justify-center cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[28px] text-[#006c4a] mb-1">
                      cloud_upload
                    </span>
                    <span className="font-sans font-bold text-xs text-[#131b2e]">
                      {lang === 'kn' ? 'ಫೋಟೋ ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click here to upload repair proof photograph'}
                    </span>
                    <span className="text-[10px] text-[#757684]">
                      Supports JPG, PNG, or camera capture
                    </span>
                  </div>
                )}
              </div>

              {proofSubmitted && (
                <div className="p-2.5 bg-[#82f5c1]/30 border border-[#006c4a] rounded-lg text-xs font-sans text-[#006c4a] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>
                    {lang === 'kn'
                      ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ ಮತ್ತು ನಿವಾಸಿಗಳ ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ!'
                      : 'Work marked as completed and repair proof uploaded successfully! Sent for resident signoff.'}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitMaintenanceProof}
                className="w-full py-2.5 bg-[#006c4a] hover:bg-[#005137] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>
                  {lang === 'kn'
                    ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ದೃಢೀಕರಿಸಿ & ಪುರಾವೆ ಸಲ್ಲಿಸಿ'
                    : 'Confirm Work Completed & Submit Proof to Resident'}
                </span>
              </button>
            </div>
          )}

          {/* Awaiting Review Action Banner for Citizens */}
          {isAwaiting && userRole !== 'maintenance' && (
            <div className="p-3.5 bg-gradient-to-r from-[#006c4a]/10 to-[#82f5c1]/20 rounded-xl border border-[#006c4a]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#006c4a] uppercase tracking-wider block">
                  {lang === 'kn' ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ' : 'Action Required • Service Completed'}
                </span>
                <p className="font-sans text-xs text-[#131b2e] font-semibold mt-0.5">
                  {lang === 'kn'
                    ? 'ದುರಸ್ತಿ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಪುರಾವೆಯನ್ನು ಪರಿಶೀಲಿಸಿ ಅನುಮೋದಿಸಿ.'
                    : 'Field work is completed. Please review repair proof and sign off.'}
                </p>
              </div>
              {onReviewAndSignoff && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReviewAndSignoff(issue);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-mono text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{lang === 'kn' ? 'ಪುರಾವೆ ಪರಿಶೀಲಿಸಿ' : 'Review & Sign Off'}</span>
                </button>
              )}
            </div>
          )}

          {/* Evidence Photos (if present) */}
          {(issue.incidentPhoto || issue.repairProofPhoto) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {issue.incidentPhoto && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] text-[#757684] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                    {lang === 'kn' ? 'ಘಟನೆ ದಾಖಲೆಯ ಫೋಟೋ' : 'Reported Incident Photo'}
                  </span>
                  <div className="h-32 rounded-lg overflow-hidden bg-[#f2f3ff] border border-[#eaedff]">
                    <img
                      src={issue.incidentPhoto}
                      alt="Incident intake"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              {issue.repairProofPhoto && (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[11px] text-[#006c4a] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                    {lang === 'kn' ? 'ಪರಿಹಾರ ಪುರಾವೆ' : 'Field Repair Proof'}
                  </span>
                  <div className="h-32 rounded-lg overflow-hidden bg-[#f2f3ff] border border-[#82f5c1]/50">
                    <img
                      src={issue.repairProofPhoto}
                      alt="Repair proof"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Crew Note if present */}
          {(issue.crewNote || issue.crewNoteKn) && (
            <div className="p-3 bg-[#f2f3ff] rounded-lg border border-[#eaedff] text-xs font-sans text-[#444653]">
              <div className="flex items-center gap-1.5 font-semibold text-[#131b2e] mb-0.5">
                <span className="material-symbols-outlined text-[16px] text-[#00288e]">engineering</span>
                <span>{lang === 'kn' ? 'ನಿರ್ವಹಣಾ ಸಿಬ್ಬಂದಿ ಟಿಪ್ಪಣಿ:' : 'Field Technician Notes:'}</span>
              </div>
              <p className="italic">
                "{lang === 'kn' && issue.crewNoteKn ? issue.crewNoteKn : issue.crewNote}"
              </p>
            </div>
          )}

          {/* Resident Rating & Quality Audit (Only for Community Residents - Hidden in Admin and Maintenance) */}
          {userRole === 'community' && (issue.status === 'Resolved & Closed' || isAwaiting) && (
            <div className="p-4 bg-gradient-to-r from-amber-50/70 to-emerald-50/50 rounded-xl border border-amber-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] fill-1">star</span>
                  </span>
                  <div>
                    <span className="font-mono text-xs font-bold text-[#131b2e] block">
                      {lang === 'kn' ? 'ನಿವಾಸಿ ಪರಿಶೀಲನಾ ರೇಟಿಂಗ್ & ಸೇವಾ ಗುಣಮಟ್ಟ' : 'Resident Sign-off Rating & Service Quality'}
                    </span>
                    <span className="text-[11px] font-sans text-[#757684]">
                      {lang === 'kn'
                        ? 'ಸೇವೆಯ ಗುಣಮಟ್ಟವನ್ನು 1 ರಿಂದ 5 ನಕ್ಷತ್ರಗಳೊಂದಿಗೆ ರೇಟ್ ಮಾಡಿ'
                        : 'Rate resolution quality and speed (1 to 5 stars)'}
                    </span>
                  </div>
                </div>
                {ratingSavedToast && (
                  <span className="px-2.5 py-1 rounded-full bg-[#006c4a] text-white font-mono text-[10px] font-bold shadow-xs animate-in fade-in duration-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] fill-1">check_circle</span>
                    <span>{lang === 'kn' ? 'ದಾಖಲಾಗಿದೆ!' : 'Recorded!'}</span>
                  </span>
                )}
              </div>

              {/* 5-Star Interactive Button Row */}
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating !== null ? hoverRating : residentRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} Star`}
                      onClick={() => {
                        setResidentRating(star);
                        setHoverRating(null);
                        if (onRateIssue && issue) {
                          onRateIssue(issue.id, star, residentComment);
                          setRatingSavedToast(true);
                          setTimeout(() => setRatingSavedToast(false), 2500);
                        }
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`material-symbols-outlined text-[28px] transition-colors ${
                          star <= active
                            ? 'text-amber-500 fill-1 drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      >
                        {star <= active ? 'star' : 'star_border'}
                      </span>
                    </button>
                  );
                })}
                <span className="ml-2 font-mono text-xs font-semibold text-amber-950 bg-amber-100/70 border border-amber-200 px-2.5 py-0.5 rounded">
                  {translations[lang].starRatings[(hoverRating !== null ? hoverRating : residentRating) - 1] || `${hoverRating !== null ? hoverRating : residentRating}/5`}
                </span>
              </div>

              {/* Optional Comments Input & Quick Save */}
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={residentComment}
                  onChange={(e) => setResidentComment(e.target.value)}
                  placeholder={
                    lang === 'kn'
                      ? 'ನಿಮ್ಮ ಅನಿಸಿಕೆ/ಟಿಪ್ಪಣಿ ನಮೂದಿಸಿ (ಐಚ್ಛಿಕ)...'
                      : 'Resident feedback note (e.g. prompt fix, area restored cleanly)...'
                  }
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (onRateIssue && issue) {
                      onRateIssue(issue.id, residentRating, residentComment);
                      setRatingSavedToast(true);
                      setTimeout(() => setRatingSavedToast(false), 2500);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#006c4a] hover:bg-[#005137] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px] fill-1">save</span>
                  <span>{lang === 'kn' ? 'ರೇಟಿಂಗ್ ನವೀಕರಿಸಿ' : 'Save Rating'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step Timeline */}
          <div>
            <h4 className="font-mono text-[11px] font-bold text-[#131b2e] uppercase tracking-wider mb-2">
              {lang === 'kn' ? 'ಘಟನೆಗಳ ಟೈಮ್‌ಲೈನ್' : 'Audit Trail & Timeline'}
            </h4>
            <div className="border-l-2 border-[#e2e7ff] pl-4 space-y-3 ml-2">
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
                <div className="text-xs text-[#757684]">
                  {lang === 'kn' ? 'ಯಾವುದೇ ಘಟನೆಗಳು ದಾಖಲಾಗಿಲ್ಲ.' : 'No events recorded yet.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Urgent Note Form */}
        {showNoteInput && (
          <div className="mt-3 p-3 bg-[#f2f3ff] rounded-lg shrink-0">
            <label className="font-mono text-xs text-[#131b2e] font-semibold block mb-1">
              {lang === 'kn'
                ? 'ರವಾನೆದಾರರಿಗೆ ತುರ್ತು ಅಪ್‌ಡೇಟ್ ಕಳುಹಿಸಿ:'
                : 'Send Priority Update to Dispatcher:'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urgentNote}
                onChange={(e) => setUrgentNote(e.target.value)}
                placeholder={
                  lang === 'kn'
                    ? 'ಉದಾ: ನೀರು ಪಕ್ಕದ ತರಗತಿಯ ಕೋಣೆಗೆ ಹರಿಯುತ್ತಿದೆ...'
                    : 'e.g. Water leak spreading into classroom next door...'
                }
                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#c4c5d5] text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#00288e]"
              />
              <button
                type="button"
                onClick={handleSendNote}
                className="px-3 py-1.5 bg-[#00288e] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                {lang === 'kn' ? 'ಕಳುಹಿಸಿ' : 'Send'}
              </button>
            </div>
            {noteSent && (
              <p className="text-[11px] text-[#006c4a] font-semibold mt-1">
                {lang === 'kn'
                  ? '✓ ತುರ್ತು ಟಿಪ್ಪಣಿಯನ್ನು ಆನ್-ಕಾಲ್ ಡ್ಯೂಟಿ ಮ್ಯಾನೇಜರ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ!'
                  : '✓ Priority note dispatched to on-call duty manager!'}
              </p>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 bg-[#f2f3ff] -mx-6 -mb-6 p-4 rounded-b-2xl border-t border-[#eaedff] shrink-0 mt-3">
          <div>
            {isAwaiting && onReviewAndSignoff && userRole !== 'maintenance' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReviewAndSignoff(issue);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005137] text-white font-mono text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>{lang === 'kn' ? 'ಪುರಾವೆ ಪರಿಶೀಲಿಸಿ' : 'Review Proof'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-[#c4c5d5]/60 font-sans text-xs font-medium text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer"
            >
              {lang === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close Inspector'}
            </button>
            <button
              type="button"
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="px-3.5 py-1.5 rounded-lg bg-[#1e40af] hover:bg-[#00288e] font-sans text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              {lang === 'kn' ? 'ತುರ್ತು ಟಿಪ್ಪಣಿ ಕಳುಹಿಸಿ' : 'Send Urgent Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
