import React, { useState } from 'react';
import { Issue, Language } from '../types';

interface AdminCommandCenterViewProps {
  issues: Issue[];
  onAssignCrew: (issueId: string, crewName: string) => void;
  onUpdateStatus: (issueId: string, status: Issue['status']) => void;
  lang: Language;
}

export const AdminCommandCenterView: React.FC<AdminCommandCenterViewProps> = ({
  issues,
  onAssignCrew,
  onUpdateStatus,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [assignee, setAssignee] = useState<string>('Plumber Rao & Team');

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

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
              Campus Operations Desk
            </span>
            <span className="text-xs text-[#757684]">Sector 1-6 Command Terminal</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
            Administrator Control Center
          </h2>
          <p className="font-sans text-xs text-[#444653] max-w-2xl mt-0.5">
            Real-time campus triage, contractor dispatch management, and SLA compliance monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f2f3ff] rounded-lg text-right">
            <span className="font-mono text-[10px] text-[#757684] block">SLA Breaches (24h)</span>
            <span className="font-sans text-lg font-bold text-[#006c4a]">0 Zero</span>
          </div>
          <div className="p-3 bg-[#f2f3ff] rounded-lg text-right">
            <span className="font-mono text-[10px] text-[#757684] block">Avg Dispatch Time</span>
            <span className="font-sans text-lg font-bold text-[#00288e]">14.2 min</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Triage Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-base text-[#131b2e]">
              Active Work Order Queue ({issues.length})
            </h3>
            <span className="font-mono text-xs text-[#757684]">
              Priority Sorted
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {issues.map((issue) => {
              const isSelected = issue.id === selectedIssueId;
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#00288e] bg-[#eaedff]/60 shadow-xs'
                      : 'border-[#eaedff] bg-[#f2f3ff] hover:bg-[#eaedff]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00288e]">
                        {issue.id}
                      </span>
                      <span className="font-sans text-xs px-2 py-0.5 rounded bg-white text-[#444653] font-medium border border-[#c4c5d5]/30">
                        {issue.category}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded ${
                        issue.severity === 'Hazard / High' || issue.severity === 'Critical'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#ffdcc3] text-[#6e3900]'
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>

                  <h4 className="font-sans text-xs font-bold text-[#131b2e] mb-1">
                    {issue.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-[#757684]">
                    <span>{issue.location}</span>
                    <span className="font-mono text-[#00288e] font-medium">
                      Status: {issue.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Dispatch & Actions (5 cols) */}
        {selectedIssue && (
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
                <span className="px-2 py-0.5 bg-[#eaedff] text-[#00288e] rounded font-mono text-[11px] font-semibold">
                  {selectedIssue.status}
                </span>
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

            <div className="pt-4 mt-4 border-t border-[#eaedff]">
              <button
                type="button"
                onClick={() => onAssignCrew(selectedIssue.id, assignee)}
                className="w-full py-2.5 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">engineering</span>
                Confirm Crew Dispatch & Notify
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
