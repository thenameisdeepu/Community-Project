import React, { useState } from 'react';
import { Issue, Language } from '../types';

interface MaintenanceWorkspaceViewProps {
  issues: Issue[];
  onUploadRepairProof: (issueId: string, proofUrl: string, note: string) => void;
  lang: Language;
}

export const MaintenanceWorkspaceView: React.FC<MaintenanceWorkspaceViewProps> = ({
  issues,
  onUploadRepairProof,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    issues.find((i) => i.status === 'In Progress')?.id || issues[0]?.id || ''
  );
  const [crewNote, setCrewNote] = useState<string>(
    'Field repair completed according to safety standards. Circuit verified and operational test passed.'
  );
  const [proofUrl, setProofUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBBhCtRAlemqXBgCAF4xgkbkXMeuYLPgDE4m0ay3pRWnpYi7PzKvTFWsmDRpvGGJyec-qcRNrxtz8sc0fhATm1uFSE1d9s_Cj5uoK4wFX-wLDFchfa5WH0untxXMqeKkKRtOjLc1TIGfULkx2BORlENzPb7o4iAwrmzhzKEnF9Bx5D7z6vtVN8QN-ixO00qdms8Q4WEZKT3oBf69aPjUCeTNq1xOws5TqkNoDU-UdFg4CCsy1cDXNy2KQ'
  );
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const handleFinishWork = () => {
    if (!selectedIssue) return;
    onUploadRepairProof(selectedIssue.id, proofUrl, crewNote);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#006c4a] bg-[#82f5c1]/30 px-2 py-0.5 rounded">
              Technician Field Portal
            </span>
            <span className="text-xs text-[#757684]">Field Tech Crew #104 Unit</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
            Maintenance Workspace
          </h2>
          <p className="font-sans text-xs text-[#444653] max-w-2xl mt-0.5">
            Log physical repairs, upload timestamped photographic proof, and route work orders for community verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a] animate-pulse"></span>
          <span className="font-mono text-xs text-[#006c4a] font-bold">
            GPS Geofence: Active on Sector 4 Grid
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Assigned Work Orders (6 cols) */}
        <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
          <h3 className="font-sans font-bold text-base text-[#131b2e] mb-3">
            Assigned Field Dispatches
          </h3>

          <div className="space-y-2.5">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  issue.id === selectedIssueId
                    ? 'border-[#006c4a] bg-[#82f5c1]/15 shadow-xs'
                    : 'border-[#eaedff] bg-[#f2f3ff] hover:bg-[#eaedff]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-[#00288e]">
                    {issue.id}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
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
                <h4 className="font-sans text-xs font-bold text-[#131b2e]">
                  {issue.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-[#757684] mt-1">
                  <span>{issue.location}</span>
                  <span className="font-mono text-[10px] text-[#ba1a1a]">
                    {issue.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upload Proof Form (6 cols) */}
        {selectedIssue && (
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
            <div className="pb-3 mb-3 border-b border-[#eaedff]">
              <span className="font-mono text-xs font-bold text-[#006c4a]">
                Work Order #{selectedIssue.id} Completion Submission
              </span>
              <h4 className="font-sans font-bold text-sm text-[#131b2e] mt-1">
                {selectedIssue.title}
              </h4>
              <p className="font-sans text-xs text-[#757684] mt-0.5">
                Location: {selectedIssue.location}
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                  Field Repair Proof Photograph:
                </label>
                <div className="relative h-44 rounded-lg overflow-hidden bg-[#eaedff] border border-[#c4c5d5]">
                  <img
                    src={proofUrl}
                    alt="Proof preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#006c4a] text-white px-2 py-0.5 rounded font-mono text-[10px]">
                    Timestamped: Today • Real-time
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                  Technician Execution Notes:
                </label>
                <textarea
                  rows={3}
                  value={crewNote}
                  onChange={(e) => setCrewNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
                  placeholder="Details of materials replaced, tests executed..."
                />
              </div>

              {submittedSuccess && (
                <div className="p-3 bg-[#82f5c1]/30 border border-[#006c4a] rounded-lg text-xs font-sans text-[#006c4a] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Proof uploaded! Work order routed to resident for community verification.
                </div>
              )}

              <button
                type="button"
                onClick={handleFinishWork}
                className="w-full py-2.5 bg-[#006c4a] hover:bg-[#005137] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                Submit Proof & Request Resident Signoff
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
