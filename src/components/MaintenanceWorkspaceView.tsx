import React, { useState, useEffect, useRef } from 'react';
import { Issue, Language } from '../types';
import {
  translateStatus,
  translateIssueTitle,
  translateIssueLocation,
  translateIssueDescription,
  translateCategory,
} from '../data/translations';

interface MaintenanceWorkspaceViewProps {
  issues: Issue[];
  onUploadRepairProof: (issueId: string, proofUrl: string, note: string) => void;
  onRemoveAllComplaints?: () => void;
  onDeleteIssue?: (issueId: string) => void;
  onCreateSampleIssue?: () => void;
  lang: Language;
}

const SAMPLE_PROOF_PRESETS = [
  {
    label: 'Electrical Repair Proof',
    icon: 'lightbulb',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    note: 'Repaired faulty wiring, replaced safety ballast, and verified voltage levels under load test.',
  },
  {
    label: 'Plumbing Repair Proof',
    icon: 'plumbing',
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    note: 'Replaced leaking PVC valve, sealed pipe fitting, and verified zero leak under full water pressure.',
  },
  {
    label: 'Facility / Carpentry Proof',
    icon: 'handyman',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    note: 'Repaired door hinge mechanism, secured frame anchors, and lubricated hydraulic door closer.',
  },
  {
    label: 'General Cleanup Proof',
    icon: 'cleaning_services',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    note: 'Cleared hazardous debris, disinfected surfaces, and restored area for safe campus transit.',
  },
];

export const MaintenanceWorkspaceView: React.FC<MaintenanceWorkspaceViewProps> = ({
  issues,
  onUploadRepairProof,
  onRemoveAllComplaints,
  onDeleteIssue,
  onCreateSampleIssue,
  lang,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [crewNote, setCrewNote] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [workCompletedStatus, setWorkCompletedStatus] = useState<boolean>(true);
  const [selectedProofPreset, setSelectedProofPreset] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [showConfirmRemoveAll, setShowConfirmRemoveAll] = useState(false);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync selected issue when issues change
  useEffect(() => {
    if (issues.length > 0) {
      if (!selectedIssueId || !issues.some((i) => i.id === selectedIssueId)) {
        // Pick first in-progress or first awaiting or first issue
        const defaultIssue =
          issues.find((i) => i.status === 'In Progress') ||
          issues.find((i) => i.status === 'Scheduled') ||
          issues[0];
        setSelectedIssueId(defaultIssue.id);
      }
    } else {
      setSelectedIssueId('');
    }
  }, [issues, selectedIssueId]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0] || null;

  // When selected issue changes, initialize form with its existing values or intelligent defaults
  useEffect(() => {
    if (selectedIssue) {
      setCrewNote(
        selectedIssue.crewNote ||
          `Field repair completed according to safety standards for ${selectedIssue.title}. Operational test passed and site verified safe.`
      );
      setProofUrl(
        selectedIssue.repairProofPhoto ||
          SAMPLE_PROOF_PRESETS[0].url
      );
      setWorkCompletedStatus(true);
      setSubmittedSuccess(false);
    }
  }, [selectedIssueId]);

  // Handle local image file upload (converts to base64 DataURL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProofUrl(event.target.result as string);
          setSelectedProofPreset('custom-upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinishWork = () => {
    if (!selectedIssue) return;
    if (!proofUrl) {
      alert(lang === 'kn' ? 'ದಯವಿಟ್ಟು ದುರಸ್ತಿ ಪುರಾವೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.' : 'Please upload an image proof of work completed.');
      return;
    }
    onUploadRepairProof(
      selectedIssue.id,
      proofUrl,
      crewNote.trim() || 'Work order completed and verified safe by maintenance technician.'
    );
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const handleAddChecklistTag = (tag: string) => {
    if (!crewNote.includes(tag)) {
      setCrewNote((prev) => (prev ? `${prev} • ${tag}` : tag));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-0.5 rounded">
              {lang === 'kn' ? 'ತಂತ್ರಜ್ಞ ಕ್ಷೇತ್ರ ಪೋರ್ಟಲ್' : 'Technician Field Portal'}
            </span>
            <span className="text-xs text-[#757684]">
              {lang === 'kn' ? 'ಕ್ಷೇತ್ರ ನಿರ್ವಹಣಾ ಸಿಬ್ಬಂದಿ ಘಟಕ #104' : 'Field Tech Crew #104 Unit'}
            </span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
            {lang === 'kn' ? 'ನಿರ್ವಹಣಾ ಕಾರ್ಯಸ್ಥಳ' : 'Maintenance Workspace'}
          </h2>
          <p className="font-sans text-xs text-[#444653] max-w-2xl mt-0.5">
            {lang === 'kn'
              ? 'ದೂರುಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ದುರಸ್ತಿ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ, ಮತ್ತು ನಿವಾಸಿಗಳ ಪರಿಶೀಲನೆಗಾಗಿ ಫೋಟೋ ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.'
              : 'Select assigned complaints, record completed repair work, upload timestamped photographic proof, and route for resident verification.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Remove All Complaints Button */}
          {issues.length > 0 && onRemoveAllComplaints && (
            <button
              type="button"
              onClick={() => setShowConfirmRemoveAll(true)}
              className="px-3 py-2 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#93000a] rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[#ba1a1a]/20 transition-colors cursor-pointer"
              title="Remove all complaints from maintenance queue"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>{lang === 'kn' ? 'ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove All Complaints'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-2 bg-[#f2f3ff] rounded-lg border border-[#c4c5d5]/30">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a] animate-pulse"></span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              {lang === 'kn' ? 'ಸಕ್ರಿಯ ಸಿಬ್ಬಂದಿ ಜಾಲ' : 'Active Field Grid'}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Remove All Complaints */}
      {showConfirmRemoveAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#ba1a1a]/20 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#ba1a1a] mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-sans font-bold text-base text-[#131b2e]">
                {lang === 'kn' ? 'ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?' : 'Remove All Complaints?'}
              </h3>
            </div>
            <p className="font-sans text-xs text-[#444653] mb-5 leading-relaxed">
              {lang === 'kn'
                ? 'ಇದು ನಿರ್ವಹಣಾ ಪಟ್ಟಿಯಿಂದ ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕುತ್ತದೆ. ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂತಿರುಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
                : 'This will clear all complaints and work orders from the maintenance queue and dataset. This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmRemoveAll(false)}
                className="px-4 py-2 bg-[#eaedff] text-[#00288e] rounded-lg text-xs font-semibold hover:bg-[#dde1ff]"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmRemoveAll(false);
                  onRemoveAllComplaints?.();
                }}
                className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {lang === 'kn' ? 'ಹೌದು, ಎಲ್ಲವನ್ನೂ ತೆಗೆದುಹಾಕಿ' : 'Yes, Remove All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Left (Complaints List) & Right (Work Completion & Proof Upload Space) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Complaints / Work Orders (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eaedff]">
            <div>
              <h3 className="font-sans font-bold text-base text-[#131b2e]">
                {lang === 'kn' ? 'ನಿಯೋಜಿಸಲಾದ ದೂರುಗಳು' : 'Assigned Complaints'} ({issues.length})
              </h3>
              <p className="text-[11px] text-[#757684]">
                {lang === 'kn' ? 'ವಿವರಗಳನ್ನು ನೋಡಲು ಮತ್ತು ಕೆಲಸ ಪೂರ್ಣಗೊಳಿಸಲು ದೂರನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Click a complaint to inspect details and upload proof'}
              </p>
            </div>

            {issues.length > 0 && onRemoveAllComplaints && (
              <button
                type="button"
                onClick={() => setShowConfirmRemoveAll(true)}
                className="text-[11px] font-mono text-[#ba1a1a] hover:underline"
              >
                {lang === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All'}
              </button>
            )}
          </div>

          {issues.length === 0 ? (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center bg-[#f8f9ff] rounded-xl border border-dashed border-[#c4c5d5]">
              <span className="material-symbols-outlined text-[36px] text-[#757684] mb-2">
                check_circle_outline
              </span>
              <h4 className="font-sans font-bold text-sm text-[#131b2e]">
                {lang === 'kn' ? 'ಯಾವುದೇ ಸಕ್ರಿಯ ದೂರುಗಳಿಲ್ಲ' : 'No Active Complaints in Queue'}
              </h4>
              <p className="font-sans text-xs text-[#757684] mt-1 max-w-xs">
                {lang === 'kn'
                  ? 'ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ ಅಥವಾ ದುರಸ್ತಿ ಪೂರ್ಣಗೊಂಡಿದೆ.'
                  : 'All complaints have been cleared or resolved. No pending maintenance tasks.'}
              </p>
              {onCreateSampleIssue && (
                <button
                  type="button"
                  onClick={onCreateSampleIssue}
                  className="mt-4 px-3.5 py-2 bg-[#00288e] text-white rounded-lg text-xs font-semibold hover:bg-[#1e40af] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_task</span>
                  <span>{lang === 'kn' ? 'ಮಾದರಿ ದೂರನ್ನು ರಚಿಸಿ' : 'Add Sample Work Order'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {issues.map((issue) => {
                const isSelected = issue.id === selectedIssue?.id;
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-[#006c4a] bg-[#82f5c1]/15 shadow-xs ring-2 ring-[#006c4a]/30'
                        : 'border-[#eaedff] bg-[#f8f9ff] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#00288e]">
                          {issue.id}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-[#444653] border border-[#c4c5d5]/30">
                          {translateCategory(issue.category, lang)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                            issue.status === 'Resolved & Closed'
                              ? 'bg-[#82f5c1]/30 text-[#006c4a]'
                              : issue.status === 'Awaiting Signoff'
                              ? 'bg-[#ffdcc3] text-[#6e3900]'
                              : 'bg-[#dde1ff] text-[#00288e]'
                          }`}
                        >
                          {translateStatus(issue.status, lang)}
                        </span>

                        {onDeleteIssue && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteIssue(issue.id);
                            }}
                            className="p-1 text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                            title="Remove this complaint"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-sans text-xs font-bold text-[#131b2e] line-clamp-1 mb-1">
                      {translateIssueTitle(issue, lang)}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#757684]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {translateIssueLocation(issue, lang)}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-[#ba1a1a]">
                        {issue.severity}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-2 pt-2 border-t border-[#c4c5d5]/20 flex items-center justify-between text-[10px] font-mono text-[#757684]">
                      <span>{issue.assignedCrew || 'Field Crew #104'}</span>
                      {issue.repairProofPhoto && (
                        <span className="text-[#006c4a] flex items-center gap-0.5 font-semibold">
                          <span className="material-symbols-outlined text-[12px]">image</span>
                          {lang === 'kn' ? 'ಪುರಾವೆ ಲಗತ್ತಿಸಲಾಗಿದೆ' : 'Proof Attached'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Work Order Inspector & Completion / Proof Upload Space (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col justify-between">
          {selectedIssue ? (
            <div className="space-y-4">
              {/* Header Details of the clicked complaint */}
              <div className="pb-3 border-b border-[#eaedff]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#006c4a] bg-[#82f5c1]/20 px-2.5 py-1 rounded">
                      {selectedIssue.id}
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#eaedff] text-[#00288e] font-semibold">
                      {translateCategory(selectedIssue.category, lang)}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-xs font-semibold px-2.5 py-1 rounded ${
                      selectedIssue.status === 'Resolved & Closed'
                        ? 'bg-[#82f5c1]/30 text-[#006c4a]'
                        : selectedIssue.status === 'Awaiting Signoff'
                        ? 'bg-[#ffdcc3] text-[#6e3900]'
                        : 'bg-[#dde1ff] text-[#00288e]'
                    }`}
                  >
                    {translateStatus(selectedIssue.status, lang)}
                  </span>
                </div>

                <h3 className="font-sans font-bold text-base text-[#131b2e] mt-1">
                  {translateIssueTitle(selectedIssue, lang)}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-[#444653] mt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#757684]">location_on</span>
                    {translateIssueLocation(selectedIssue, lang)}
                  </span>
                  {selectedIssue.reportedBy && (
                    <span className="flex items-center gap-1 text-[#757684]">
                      <span className="material-symbols-outlined text-[15px]">person</span>
                      {selectedIssue.reportedBy}
                    </span>
                  )}
                  {selectedIssue.submittedTime && (
                    <span className="font-mono text-[11px] text-[#757684]">
                      {lang === 'kn' ? 'ದಾಖಲಿಸಲಾಗಿದೆ:' : 'Reported:'} {selectedIssue.submittedTime}
                    </span>
                  )}
                </div>

                {/* Complaint Problem Description */}
                <div className="mt-3 p-3 bg-[#f8f9ff] rounded-lg border border-[#eaedff]">
                  <span className="font-mono text-[10px] text-[#757684] uppercase font-bold block mb-1">
                    {lang === 'kn' ? 'ನಿವಾಸಿಗಳು ದಾಖಲಿಸಿದ ವಿವರಣೆ' : 'Citizen Reported Problem Description:'}
                  </span>
                  <p className="font-sans text-xs text-[#131b2e] leading-relaxed">
                    {translateIssueDescription(selectedIssue, lang)}
                  </p>
                </div>

                {/* Original citizen photo if reported */}
                {selectedIssue.incidentPhoto && (
                  <div className="mt-2.5">
                    <span className="font-mono text-[10px] text-[#757684] uppercase font-bold block mb-1">
                      {lang === 'kn' ? 'ಘಟನೆ ದಾಖಲೆಯ ಫೋಟೋ (ನಿವಾಸಿಗಳಿಂದ)' : 'Intake Incident Photo (From Citizen):'}
                    </span>
                    <div className="h-28 rounded-lg overflow-hidden bg-[#eaedff] border border-[#c4c5d5]/40 inline-block">
                      <img
                        src={selectedIssue.incidentPhoto}
                        alt="Incident"
                        className="h-full w-auto object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* POINT 1: MENTION WORK IS COMPLETED (Status & Execution Details) */}
              <div className="p-4 bg-[#f2f3ff] rounded-xl border border-[#00288e]/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#006c4a]">task_alt</span>
                    <span className="font-sans font-bold text-xs text-[#131b2e]">
                      {lang === 'kn' ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡ ಸ್ಥಿತಿ & ಟಿಪ್ಪಣಿ' : 'Work Status: Mark as Completed'}
                    </span>
                  </div>

                  {/* Toggle / Confirmation Pill */}
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-[#006c4a]/30 shadow-xs">
                    <input
                      type="checkbox"
                      checked={workCompletedStatus}
                      onChange={(e) => setWorkCompletedStatus(e.target.checked)}
                      className="w-4 h-4 text-[#006c4a] rounded focus:ring-0 cursor-pointer"
                    />
                    <span className="font-sans text-xs font-bold text-[#006c4a]">
                      {lang === 'kn' ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ (ಸಹಿ ಬಾಕಿ)' : 'Field Work Completed & Verified'}
                    </span>
                  </label>
                </div>

                {/* Quick checklist buttons */}
                <div>
                  <span className="font-mono text-[10px] text-[#757684] uppercase font-semibold block mb-1">
                    {lang === 'kn' ? 'ತ್ವರಿತ ಪೂರ್ಣಗೊಳಿಸುವಿಕೆ ವಿವರಗಳು:' : 'Quick Work Completion Tags:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Operational test passed',
                      'Hazard mitigated',
                      'Replaced damaged component',
                      'Circuit grounding verified',
                      'Area cleaned and safe',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddChecklistTag(tag)}
                        className="px-2 py-1 bg-white hover:bg-[#eaedff] text-[#00288e] rounded text-[11px] font-sans border border-[#c4c5d5]/40 transition-colors cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technician Execution Notes Textarea */}
                <div>
                  <label className="font-mono text-[11px] font-semibold text-[#131b2e] block mb-1">
                    {lang === 'kn' ? 'ತಂತ್ರಜ್ಞ ಕೆಲಸದ ವಿವರಣೆ / ಟಿಪ್ಪಣಿ:' : 'Technician Work Execution & Materials Replaced Note:'}
                  </label>
                  <textarea
                    rows={3}
                    value={crewNote}
                    onChange={(e) => setCrewNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-white border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#006c4a]"
                    placeholder="Enter details of parts replaced, safety checks performed, and confirmation that repair is complete..."
                  />
                </div>
              </div>

              {/* POINT 2: SPACE TO UPLOAD AN IMAGE PROOF OF WORK COMPLETED */}
              <div className="p-4 bg-white rounded-xl border-2 border-dashed border-[#006c4a]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#006c4a]">add_a_photo</span>
                    <div>
                      <span className="font-sans font-bold text-xs text-[#131b2e] block">
                        {lang === 'kn' ? 'ದುರಸ್ತಿ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡ ಫೋಟೋ ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Space to Upload Image Proof of Work Completed'}
                      </span>
                      <span className="font-sans text-[11px] text-[#757684]">
                        {lang === 'kn' ? 'ನಿವಾಸಿಗಳಿಗೆ ತೋರಿಸಲು ನೈಜ ಪುರಾವೆ ಫೋಟೋ ಅಗತ್ಯವಿದೆ' : 'Photographic evidence shown to resident for community verification sign-off'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#006c4a] hover:bg-[#005137] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">file_upload</span>
                    <span>{lang === 'kn' ? 'ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ' : 'Browse Photo'}</span>
                  </button>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />

                {/* Image Preview & Upload Drop Zone */}
                {proofUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-48 rounded-xl overflow-hidden bg-[#eaedff] border border-[#006c4a]/40 shadow-xs group">
                      <img
                        src={proofUrl}
                        alt="Proof of completed repair"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-[#006c4a] text-white px-2.5 py-1 rounded font-mono text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>{lang === 'kn' ? 'ಪೂರ್ಣಗೊಂಡ ಪುರಾವೆ • ನೈಜ ಸಮಯ' : 'Proof Verified • Live Attached'}</span>
                      </div>

                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#131b2e] rounded text-[11px] font-sans font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          {lang === 'kn' ? 'ಬದಲಾಯಿಸಿ' : 'Change Photo'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProofUrl('')}
                          className="p-1 bg-white/90 hover:bg-[#ffdad6] text-[#ba1a1a] rounded transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] font-sans flex items-center justify-between">
                        <span className="truncate">
                          {selectedProofPreset === 'custom-upload'
                            ? 'Uploaded from device • Timestamped today'
                            : 'Field Repair Photographic Evidence'}
                        </span>
                        <span className="font-mono text-[10px] text-[#82f5c1]">Ready for signoff</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 rounded-xl border border-dashed border-[#c4c5d5] bg-[#f8f9ff] hover:bg-[#eaedff]/40 transition-colors flex flex-col items-center justify-center cursor-pointer text-center"
                  >
                    <span className="material-symbols-outlined text-[32px] text-[#006c4a] mb-1">
                      cloud_upload
                    </span>
                    <span className="font-sans font-bold text-xs text-[#131b2e]">
                      {lang === 'kn' ? 'ಫೋಟೋವನ್ನು ಇಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ' : 'Click to Upload Work Completed Photo Proof'}
                    </span>
                    <span className="font-sans text-[11px] text-[#757684] mt-0.5">
                      Supports JPG, PNG, WEBP, or take a picture with camera
                    </span>
                  </div>
                )}

                {/* Preset sample proof photos for quick 1-click selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-[#757684] uppercase font-bold">
                      {lang === 'kn' ? 'ಅಥವಾ ಮಾದರಿ ದುರಸ್ತಿ ಪುರಾವೆ ಆಯ್ಕೆಮಾಡಿ:' : 'Or Select Sample Proof Preset:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="text-[11px] font-mono text-[#00288e] hover:underline"
                    >
                      {showCustomUrlInput ? 'Hide URL' : 'Enter Image URL'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_PROOF_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setProofUrl(preset.url);
                          setSelectedProofPreset(preset.label);
                          if (!crewNote || crewNote.startsWith('Field repair completed')) {
                            setCrewNote(preset.note);
                          }
                        }}
                        className={`p-2 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                          proofUrl === preset.url
                            ? 'border-[#006c4a] bg-[#82f5c1]/20 shadow-xs ring-1 ring-[#006c4a]'
                            : 'border-[#c4c5d5]/40 bg-[#f8f9ff] hover:bg-[#eaedff]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#006c4a] shrink-0">
                          {preset.icon}
                        </span>
                        <span className="font-sans text-[10px] font-semibold text-[#131b2e] truncate">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {showCustomUrlInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://example.com/repair-proof.jpg"
                        className="flex-1 px-3 py-1.5 bg-[#f8f9ff] border border-[#c4c5d5] rounded-lg text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SUCCESS NOTIFICATION */}
              {submittedSuccess && (
                <div className="p-3.5 bg-[#82f5c1]/30 border border-[#006c4a] rounded-xl text-xs font-sans text-[#006c4a] font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <div>
                    <span>
                      {lang === 'kn'
                        ? 'ದುರಸ್ತಿ ಪುರಾವೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ! ಪರಿಶೀಲನೆಗಾಗಿ ನಿವಾಸಿಗಳಿಗೆ ರವಾನಿಸಲಾಗಿದೆ.'
                        : 'Work Completion & Proof submitted! Complaint marked as Completed and routed to resident for sign-off.'}
                    </span>
                  </div>
                </div>
              )}

              {/* ACTION SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinishWork}
                  className="w-full py-3 bg-[#006c4a] hover:bg-[#005137] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>
                    {lang === 'kn'
                      ? 'ಕೆಲಸ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ದೃಢೀಕರಿಸಿ & ಪುರಾವೆ ಸಲ್ಲಿಸಿ'
                      : 'Confirm Work Completed & Submit Repair Proof for Citizen Signoff'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex-1 flex flex-col items-center justify-center bg-[#f8f9ff] rounded-xl border border-dashed border-[#c4c5d5]">
              <span className="material-symbols-outlined text-[48px] text-[#757684] mb-2">
                touch_app
              </span>
              <h4 className="font-sans font-bold text-base text-[#131b2e]">
                {lang === 'kn' ? 'ಯಾವುದೇ ದೂರನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ' : 'No Complaint Selected'}
              </h4>
              <p className="font-sans text-xs text-[#757684] mt-1 max-w-sm">
                {lang === 'kn'
                  ? 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಮತ್ತು ಕೆಲಸ ಪೂರ್ಣಗೊಂಡ ಪುರಾವೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಎಡಭಾಗದ ಪಟ್ಟಿಯಿಂದ ದೂರನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ.'
                  : 'Click on any complaint from the list on the left to inspect full details, mention work is completed, and upload photographic proof.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
