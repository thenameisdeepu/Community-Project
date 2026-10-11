import React, { useState } from 'react';
import { Issue, Language } from '../types';
import { translations } from '../data/translations';

interface IssuesTableProps {
  issues: Issue[];
  lang: Language;
  onOpenDetail: (issue: Issue) => void;
  onJumpToVerification?: () => void;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  lang,
  onOpenDetail,
  onJumpToVerification,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'verification'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const t = translations[lang];

  // Count metrics for filter tabs
  const allCount = issues.length;
  const activeCount = issues.filter(
    (i) => i.status === 'In Progress' || i.status === 'Scheduled' || i.status === 'Reported'
  ).length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved & Closed').length;
  const verificationCount = issues.filter(
    (i) => i.status === 'Awaiting Signoff' || i.isNeedsVerification
  ).length;

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return (
        issue.status === 'In Progress' ||
        issue.status === 'Scheduled' ||
        issue.status === 'Reported'
      );
    }
    if (filter === 'resolved') {
      return issue.status === 'Resolved & Closed';
    }
    if (filter === 'verification') {
      return issue.status === 'Awaiting Signoff' || issue.isNeedsVerification;
    }
    return true;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredIssues.length / pageSize) || 1;
  const displayedIssues = filteredIssues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Hazard / High':
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#ffdad6] text-[#93000a] font-semibold whitespace-nowrap">
            Hazard / High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#ffdcc3] text-[#6e3900] font-semibold whitespace-nowrap">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#eaedff] text-[#444653] font-medium whitespace-nowrap">
            {sev || 'Normal'}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#131b2e]">
            {t.myReportedIssues}
          </h2>
          <span className="font-sans text-xs text-[#757684]">
            {t.auditLedgerSubtext}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-[#00288e] text-white font-semibold shadow-xs'
                : 'bg-[#e2e7ff] text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            {t.filterAll} ({allCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('active');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all shrink-0 ${
              filter === 'active'
                ? 'bg-[#00288e] text-white font-semibold shadow-xs'
                : 'bg-[#e2e7ff] text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            {t.filterActive} ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('resolved');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all shrink-0 ${
              filter === 'resolved'
                ? 'bg-[#00288e] text-white font-semibold shadow-xs'
                : 'bg-[#e2e7ff] text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            {t.filterResolved} ({resolvedCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('verification');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all shrink-0 flex items-center gap-1.5 ${
              filter === 'verification'
                ? 'bg-[#ba1a1a] text-white font-semibold shadow-xs'
                : 'bg-[#e2e7ff] text-[#ba1a1a] hover:bg-[#ffdad6]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
            {t.filterVerification} ({verificationCount})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-[#c4c5d5]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#444653] font-mono text-[10px] tracking-wider uppercase border-b border-[#c4c5d5]/30">
                <th className="py-2.5 px-4 font-semibold">{t.trackingId}</th>
                <th className="py-2.5 px-2 font-semibold">{t.category}</th>
                <th className="py-2.5 px-4 font-semibold">{t.titleLocation}</th>
                <th className="py-2.5 px-2 font-semibold">{t.severity}</th>
                <th className="py-2.5 px-4 font-semibold">{t.statusWorkOrder}</th>
                <th className="py-2.5 px-2 font-semibold">{t.updated}</th>
                <th className="py-2.5 px-4 font-semibold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] text-xs font-sans">
              {displayedIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#757684]">
                    No issues matching selected filter.
                  </td>
                </tr>
              ) : (
                displayedIssues.map((issue) => {
                  const isAwaiting =
                    issue.status === 'Awaiting Signoff' || issue.isNeedsVerification;

                  return (
                    <tr
                      key={issue.id}
                      className={`hover:bg-[#f2f3ff]/70 transition-colors ${
                        isAwaiting ? 'bg-[#eaedff]/40' : ''
                      }`}
                    >
                      {/* Tracking ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#00288e] font-semibold whitespace-nowrap">
                        {issue.id}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-2 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#eaedff] font-mono text-[10px] text-[#444653]">
                          <span className="material-symbols-outlined text-[13px]">
                            {issue.categoryIcon || 'build'}
                          </span>{' '}
                          {issue.category}
                        </span>
                      </td>

                      {/* Title & Location */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <span className="font-sans text-xs font-semibold text-[#131b2e] block leading-tight">
                          {issue.title}
                        </span>
                        <span className="font-sans text-[11px] text-[#757684] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-[#757684]">
                            location_on
                          </span>{' '}
                          {issue.location}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-2">{getSeverityBadge(issue.severity)}</td>

                      {/* Status & Work Order */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        {issue.status === 'In Progress' && (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-semibold text-[#00288e]">
                              In Progress
                            </span>
                            <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#00288e] h-1.5 rounded-full transition-all"
                                style={{ width: `${issue.progressPercent || 60}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#757684]">
                              {issue.workOrder || 'Field Crew Dispatched'}
                            </span>
                          </div>
                        )}

                        {isAwaiting && (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-semibold text-[#6e3900]">
                              Awaiting Signoff
                            </span>
                            <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#006c4a] h-1.5 rounded-full w-full"></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#006c4a] font-medium">
                              Field Work Completed
                            </span>
                          </div>
                        )}

                        {issue.status === 'Scheduled' && (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-semibold text-[#00288e]">
                              Scheduled
                            </span>
                            <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#1e40af] h-1.5 rounded-full"
                                style={{ width: `${issue.progressPercent || 40}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#757684]">
                              {issue.workOrder || 'Crew Scheduled'}
                            </span>
                          </div>
                        )}

                        {issue.status === 'Resolved & Closed' && (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-[#006c4a] font-mono text-[10px] font-semibold">
                              <span className="material-symbols-outlined text-[14px]">
                                check_circle
                              </span>
                              <span>Resolved & Closed</span>
                            </div>
                            <span className="font-mono text-[10px] text-[#757684]">
                              {issue.workOrder || 'Verified by Resident'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-2 font-mono text-[11px] text-[#757684] whitespace-nowrap">
                        {issue.updatedTime}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isAwaiting ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onJumpToVerification) {
                                onJumpToVerification();
                              } else {
                                onOpenDetail(issue);
                              }
                            }}
                            className="px-2.5 py-1 bg-[#006c4a] text-white hover:bg-[#005137] rounded font-mono text-[11px] font-semibold inline-block shadow-xs transition-colors"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenDetail(issue)}
                            className="p-1.5 text-[#00288e] hover:bg-[#eaedff] rounded-lg transition-colors"
                            title="Inspect details"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {issue.status === 'Resolved & Closed' ? 'history' : 'visibility'}
                            </span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="bg-[#f2f3ff] px-4 py-2.5 flex items-center justify-between text-xs font-sans text-[#757684] border-t border-[#c4c5d5]/30">
          <div className="flex items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-[#131b2e]">
                {displayedIssues.length} of {filteredIssues.length}
              </strong>{' '}
              issues
            </span>
            <span className="text-[#c4c5d5] hidden sm:inline">•</span>
            <span className="font-mono text-[10px] hidden sm:inline">
              ISO-37120 Municipal Transparency Compliance
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2.5 py-0.5 rounded transition-all ${
                  currentPage === i + 1
                    ? 'bg-white text-[#00288e] font-bold shadow-xs'
                    : 'hover:bg-[#eaedff] text-[#444653]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
