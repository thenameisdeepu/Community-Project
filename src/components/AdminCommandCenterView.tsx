import React, { useState, useEffect } from 'react';
import { Issue, Language, UserProfile } from '../types';
import { translateCategory, translateStatus } from '../data/translations';

interface AdminCommandCenterViewProps {
  issues: Issue[];
  users?: UserProfile[];
  onAssignCrew: (issueId: string, crewName: string) => void;
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
  onRemoveAllComplaints?: () => void;
  onDeleteIssue?: (issueId: string) => void;
  onCreateSampleIssue?: () => void;
  onNavigateToAccounts?: () => void;
  onDeleteUser?: (id: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  lang: Language;
}

export const AdminCommandCenterView: React.FC<AdminCommandCenterViewProps> = ({
  issues,
  users = [],
  onAssignCrew,
  onUpdateStatus,
  onRemoveAllComplaints,
  onDeleteIssue,
  onCreateSampleIssue,
  onNavigateToAccounts,
  onDeleteUser,
  lang,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [assignee, setAssignee] = useState<string>('Plumber Rao & Team');
  const [showConfirmRemoveAll, setShowConfirmRemoveAll] = useState<boolean>(false);

  useEffect(() => {
    if (issues.length > 0) {
      if (!selectedIssueId || !issues.some((i) => i.id === selectedIssueId)) {
        setSelectedIssueId(issues[0].id);
      }
    } else {
      setSelectedIssueId('');
    }
  }, [issues, selectedIssueId]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0] || null;

  const crewOptions = [
    'Plumber Rao & Team',
    'Electrician Crew #104 (David / R. Sharma)',
    'Carpentry Squad (Chief Master Kumar)',
    'Campus Network Operations (NOC)',
    'Sanitation Route Squad #3',
    'Otis Elevators Contract Crew',
    'Campus Security Rapid Response',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#00288e] bg-[#eaedff] px-2 py-0.5 rounded">
              {lang === 'kn' ? 'ಕ್ಯಾಂಪಸ್ ಕಾರ್ಯಾಚರಣೆ ಡೆಸ್ಕ್' : 'Campus Operations Desk'}
            </span>
            <span className="text-xs text-[#757684]">Sector 1-6 Command Terminal</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
            {lang === 'kn' ? 'ನಿರ್ವಾಹಕ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ' : 'Administrator Control Center'}
          </h2>
          <p className="font-sans text-xs text-[#444653] max-w-2xl mt-0.5">
            {lang === 'kn'
              ? 'ನೈಜ-ಸಮಯದ ಕ್ಯಾಂಪಸ್ ದೂರುಗಳ ನಿರ್ವಹಣೆ, ಗುತ್ತಿಗೆದಾರರ ರವಾನೆ, ಮತ್ತು ದೂರುಗಳ ಪರಿಹಾರ ಮೇಲ್ವಿಚಾರಣೆ.'
              : 'Real-time campus triage, contractor dispatch management, and SLA compliance monitoring.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Remove All Complaints Button */}
          {issues.length > 0 && onRemoveAllComplaints && (
            <button
              type="button"
              onClick={() => setShowConfirmRemoveAll(true)}
              className="px-3.5 py-2 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#93000a] rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[#ba1a1a]/20 shadow-xs transition-colors cursor-pointer"
              title="Remove all complaints from administrator queue"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>{lang === 'kn' ? 'ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ತೆಗೆದುಹಾಕಿ' : 'Remove All Complaints'}</span>
            </button>
          )}

          <div className="p-3 bg-[#f2f3ff] dark:bg-slate-800/60 rounded-lg text-right">
            <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 block">
              {lang === 'kn' ? 'SLA ಉಲ್ಲಂಘನೆಗಳು (೨೪ ಗಂ)' : 'SLA Breaches (24h)'}
            </span>
            <span className="font-sans text-lg font-bold text-[#006c4a] dark:text-emerald-400">0</span>
          </div>
          <div className="p-3 bg-[#f2f3ff] dark:bg-slate-800/60 rounded-lg text-right">
            <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 block">
              {lang === 'kn' ? 'ಸರಾಸರಿ ರವಾನೆ ಸಮಯ' : 'Avg Dispatch Time'}
            </span>
            <span className="font-sans text-lg font-bold text-[#00288e] dark:text-blue-400">
              {issues.some((i) => i.assignedCrew) ? '12.5 min' : 'N/A'}
            </span>
          </div>
          {onNavigateToAccounts && (
            <button
              type="button"
              onClick={onNavigateToAccounts}
              className="p-3 bg-[#eaedff] dark:bg-[#1e293b] hover:bg-[#dde1ff] dark:hover:bg-[#334155] rounded-lg text-right border border-[#00288e]/15 transition-all cursor-pointer group"
              title="Open User Accounts and dataset management"
            >
              <div className="flex items-center justify-end gap-1 text-[#00288e] dark:text-[#93c5fd] font-mono text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[14px]">manage_accounts</span>
                <span>{lang === 'kn' ? 'ಖಾತೆಗಳು' : 'Accounts'}</span>
              </div>
              <span className="font-sans text-lg font-bold text-[#00288e] dark:text-[#93c5fd] block">
                {users.length}
              </span>
            </button>
          )}
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
                ? 'ಇದು ನಿರ್ವಾಹಕ ಮತ್ತು ನಿರ್ವಹಣಾ ನಿಯಂತ್ರಣದಿಂದ ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತೆಗೆದುಹಾಕುತ್ತದೆ. ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂತಿರುಗಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.'
                : 'This will permanently remove all complaints from the database and active work queue. This action cannot be undone.'}
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

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Triage Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans font-bold text-base text-[#131b2e]">
                {lang === 'kn' ? 'ಸಕ್ರಿಯ ಕೆಲಸದ ಆದೇಶಗಳ ಸಾಲು' : 'Active Work Order Queue'} ({issues.length})
              </h3>
              <span className="font-mono text-xs text-[#757684]">
                Priority & SLA Sorted
              </span>
            </div>

            {issues.length > 0 && onRemoveAllComplaints && (
              <button
                type="button"
                onClick={() => setShowConfirmRemoveAll(true)}
                className="text-[11px] font-mono text-[#ba1a1a] hover:underline"
              >
                {lang === 'kn' ? 'ಎಲ್ಲವನ್ನೂ ತೆರವುಗೊಳಿಸಿ' : 'Clear All Queue'}
              </button>
            )}
          </div>

          {issues.length === 0 ? (
            <div className="p-10 text-center flex-1 flex flex-col items-center justify-center bg-[#f8f9ff] rounded-xl border border-dashed border-[#c4c5d5]">
              <span className="material-symbols-outlined text-[40px] text-[#757684] mb-2">
                task_alt
              </span>
              <h4 className="font-sans font-bold text-sm text-[#131b2e]">
                {lang === 'kn' ? 'ಯಾವುದೇ ದೂರುಗಳಿಲ್ಲ (ಸಾಲು ಖಾಲಿಯಾಗಿದೆ)' : 'Work Order Queue is Empty'}
              </h4>
              <p className="font-sans text-xs text-[#757684] mt-1 max-w-xs">
                {lang === 'kn'
                  ? 'ಎಲ್ಲಾ ದೂರುಗಳನ್ನು ತೆಗೆದುಹಾಕಲಾಗಿದೆ ಅಥವಾ ಪರಿಹರಿಸಲಾಗಿದೆ.'
                  : 'All complaints have been removed or resolved. The campus maintenance queue is clear.'}
              </p>
              {onCreateSampleIssue && (
                <button
                  type="button"
                  onClick={onCreateSampleIssue}
                  className="mt-4 px-3.5 py-2 bg-[#00288e] text-white rounded-lg text-xs font-semibold hover:bg-[#1e40af] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>{lang === 'kn' ? 'ಮಾದರಿ ದೂರನ್ನು ಸೇರಿಸಿ' : 'Create Sample Complaint'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {issues.map((issue) => {
                const isSelected = issue.id === selectedIssue?.id;
                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-[#00288e] bg-[#eaedff]/60 shadow-xs ring-1 ring-[#00288e]'
                        : 'border-[#eaedff] bg-[#f2f3ff] hover:bg-[#eaedff]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00288e]">
                          {issue.id}
                        </span>
                        <span className="font-sans text-xs px-2 py-0.5 rounded bg-white text-[#444653] font-medium border border-[#c4c5d5]/30">
                          {translateCategory(issue.category, lang)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                            issue.severity === 'Hazard / High' || issue.severity === 'Critical'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : 'bg-[#ffdcc3] text-[#6e3900]'
                          }`}
                        >
                          {issue.severity}
                        </span>

                        {onDeleteIssue && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteIssue(issue.id);
                            }}
                            className="p-1 text-[#757684] hover:text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                            title="Delete this complaint"
                          >
                            <span className="material-symbols-outlined text-[15px]">close</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-sans text-xs font-bold text-[#131b2e] mb-1">
                      {issue.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-[#757684]">
                      <span>{issue.location}</span>
                      <span className="font-mono text-[#00288e] font-medium">
                        Status: {translateStatus(issue.status, lang)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick Dispatch & Actions (5 cols) */}
        {selectedIssue ? (
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eaedff]">
                <div>
                  <span className="font-mono text-xs font-bold text-[#00288e]">
                    {selectedIssue.id} Dispatch Inspector
                  </span>
                  <h4 className="font-sans font-bold text-sm text-[#131b2e] mt-0.5">
                    {selectedIssue.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-[#eaedff] text-[#00288e] rounded font-mono text-[11px] font-semibold">
                    {translateStatus(selectedIssue.status, lang)}
                  </span>
                  {onDeleteIssue && (
                    <button
                      type="button"
                      onClick={() => onDeleteIssue(selectedIssue.id)}
                      className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded transition-colors"
                      title="Remove complaint"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-xs font-sans text-[#444653]">
                <div>
                  <strong className="text-[#131b2e] block mb-0.5">Description:</strong>
                  <p className="bg-[#f2f3ff] p-2.5 rounded-lg text-[11px] leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>

                <div>
                  <strong className="text-[#131b2e] block mb-0.5">Assigned Technician:</strong>
                  <span className="font-mono text-[#00288e] font-semibold block">
                    {selectedIssue.assignedCrew || 'Unassigned (Awaiting Triage)'}
                  </span>
                </div>

                {selectedIssue.repairProofPhoto && (
                  <div>
                    <strong className="text-[#006c4a] block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Field Repair Photographic Proof:</span>
                    </strong>
                    <div className="h-28 rounded-lg overflow-hidden border border-[#006c4a]/30">
                      <img
                        src={selectedIssue.repairProofPhoto}
                        alt="Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#eaedff]">
                  <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                    Assign / Reassign Crew:
                  </label>
                  <select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f2f3ff] border border-[#c4c5d5] rounded-lg text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  >
                    {crewOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                    Update Order Status:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedIssue.id, 'In Progress')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#dde1ff] text-[#00288e] font-mono text-[11px] font-semibold border border-[#c4c5d5]/40"
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedIssue.id, 'Awaiting Signoff')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#ffdcc3] text-[#6e3900] font-mono text-[11px] font-semibold border border-[#c4c5d5]/40"
                    >
                      Awaiting Signoff
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedIssue.id, 'Resolved & Closed')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#82f5c1]/30 text-[#006c4a] font-mono text-[11px] font-semibold border border-[#c4c5d5]/40"
                    >
                      Resolved & Closed
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(selectedIssue.id, 'Scheduled')}
                      className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#444653] font-mono text-[11px] font-semibold border border-[#c4c5d5]/40"
                    >
                      Scheduled
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#eaedff] flex gap-2">
              <button
                type="button"
                onClick={() => onAssignCrew(selectedIssue.id, assignee)}
                className="flex-1 py-2.5 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">engineering</span>
                Confirm Crew Dispatch & Notify
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white p-10 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[40px] text-[#757684] mb-2">
              touch_app
            </span>
            <h4 className="font-sans font-bold text-sm text-[#131b2e]">
              No Complaint Selected
            </h4>
            <p className="font-sans text-xs text-[#757684] mt-1">
              Select any work order from the queue to assign crew or update status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
