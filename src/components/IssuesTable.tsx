import React, { useState } from 'react';
import { Issue, Language, Role } from '../types';
import {
  translations,
  translateCategory,
  translateStatus,
  translateSeverity,
  translateTime,
  translateIssueTitle,
  translateIssueLocation,
  translateIssueWorkOrder,
} from '../data/translations';

interface IssuesTableProps {
  issues: Issue[];
  lang: Language;
  onOpenDetail: (issue: Issue) => void;
  onJumpToVerification?: (issue?: Issue) => void;
  onReviewIssue?: (issue: Issue) => void;
  onOpenReportModal?: () => void;
  userRole?: Role;
}

export const IssuesTable: React.FC<IssuesTableProps> = ({
  issues,
  lang,
  onOpenDetail,
  onJumpToVerification,
  onReviewIssue,
  onOpenReportModal,
  userRole = 'community',
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved' | 'verification'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
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

  const handleExportCsv = () => {
    if (filteredIssues.length === 0 || isExporting) return;
    setIsExporting(true);

    try {
      const isKn = lang === 'kn';
      const escapeCsv = (val: unknown): string => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = isKn
        ? [
            'ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ',
            'ವರ್ಗ',
            'ಶೀರ್ಷಿಕೆ',
            'ಸ್ಥಳ',
            'ವಲಯ',
            'ವಿಭಾಗ',
            'ತೀವ್ರತೆ',
            'ಸ್ಥಿತಿ',
            'ಕೆಲಸದ ಆದೇಶ',
            'ನಿಯೋಜಿತ ಸಿಬ್ಬಂದಿ',
            'ಪ್ರಗತಿ (%)',
            'ವರದಿ ಮಾಡಿದವರು',
            'ಸಲ್ಲಿಸಿದ ಸಮಯ',
            'ಕೊನೆಯ ನವೀಕರಣ',
            'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ',
            'ಪರಿಹಾರ ರೇಟಿಂಗ್',
            'ನಿವಾಸಿಗಳ ಅಭಿಪ್ರಾಯ',
            'ಸಿಬ್ಬಂದಿ ಟಿಪ್ಪಣಿ',
            'ವಿವರಣೆ',
            'ಆಡಿಟ್ ಅನುಸರಣೆ ಸ್ಟ್ಯಾಂಪ್',
          ]
        : [
            'Tracking ID',
            'Category',
            'Title',
            'Location',
            'Zone',
            'Division',
            'Severity',
            'Status',
            'Work Order',
            'Assigned Crew',
            'Progress (%)',
            'Reported By',
            'Submitted Time',
            'Last Updated',
            'Needs Resident Signoff',
            'Resolution Rating',
            'Resident Comments',
            'Crew Note',
            'Description',
            'Audit Compliance Stamp',
          ];

      const rows = filteredIssues.map((issue) => {
        const title = translateIssueTitle(issue, lang);
        const location = translateIssueLocation(issue, lang);
        const category = translateCategory(issue.category, lang);
        const severity = translateSeverity(issue.severity, lang);
        const status = translateStatus(issue.status, lang);
        const workOrder = translateIssueWorkOrder(
          isKn && issue.workOrderKn ? issue.workOrderKn : (issue.workOrder || 'N/A'),
          lang
        );
        const division = isKn && issue.divisionKn ? issue.divisionKn : (issue.division || 'N/A');
        const description = isKn && issue.descriptionKn ? issue.descriptionKn : issue.description;
        const crewNote = (isKn && issue.crewNoteKn ? issue.crewNoteKn : issue.crewNote) || 'N/A';
        const progress = issue.progressPercent !== undefined ? `${issue.progressPercent}%` : 'N/A';
        const needsVerification = issue.isNeedsVerification
          ? isKn
            ? 'ಹೌದು (ಬಾಕಿ)'
            : 'Yes (Pending)'
          : isKn
          ? 'ಇಲ್ಲ'
          : 'No';
        const rating = issue.resolutionRating ? `${issue.resolutionRating}/5` : 'N/A';
        const residentComments = issue.residentComments || 'None';
        const auditStamp = `ISO-37120-NB-2026 [Filter: ${filter.toUpperCase()}]`;

        return [
          issue.id,
          category,
          title,
          location,
          issue.zone,
          division,
          severity,
          status,
          workOrder,
          issue.assignedCrew || 'N/A',
          progress,
          issue.reportedBy,
          issue.submittedTime,
          issue.updatedTime,
          needsVerification,
          rating,
          residentComments,
          crewNote,
          description,
          auditStamp,
        ];
      });

      const headerLine = headers.map(escapeCsv).join(',');
      const rowLines = rows.map((r) => r.map(escapeCsv).join(','));
      // Prepend UTF-8 Byte Order Mark (\uFEFF) for optimal Excel & spreadsheet compatibility
      const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const dateStr = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `neighbrly-issues-${filter}-report-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        setIsExporting(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to export issues CSV:', err);
      setIsExporting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    const label = translateSeverity(sev, lang);
    switch (sev) {
      case 'Hazard / High':
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#ffdad6] text-[#93000a] font-semibold whitespace-nowrap">
            {label}
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#ffdcc3] text-[#6e3900] font-semibold whitespace-nowrap">
            {label}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-[#eaedff] text-[#444653] font-medium whitespace-nowrap">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Section Title & Filter Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="font-sans text-xl font-bold text-[#131b2e]">
            {userRole === 'community'
              ? (lang === 'kn' ? 'ನನ್ನ ದಾಖಲಾದ ದೂರುಗಳು' : 'My Filed Complaints')
              : (lang === 'kn' ? 'ಎಲ್ಲಾ ನಿವಾಸಿಗಳ ದೂರುಗಳ ಲೆಡ್ಜರ್' : 'All Resident Complaints Ledger')}
          </h2>
          <span className="font-sans text-xs text-[#757684]">
            {userRole === 'community'
              ? (lang === 'kn'
                  ? 'ಗೌಪ್ಯ ನಿವಾಸಿ ದಾಖಲೆ • ನಿಮ್ಮ ದೂರುಗಳನ್ನು ಮಾತ್ರ ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತದೆ'
                  : 'Private & Confidential Ledger • Only your filed complaints are displayed')
              : (lang === 'kn'
                  ? 'ಸಂಪೂರ್ಣ ಆಡಳಿತಾತ್ಮಕ ವೀಕ್ಷಣೆ • ಎಲ್ಲಾ ನಿವಾಸಿಗಳ ದೂರುಗಳು ಮತ್ತು ದಾಖಲೆಗಳು'
                  : 'Complete Administrative View • Full database of all resident reports')}
          </span>
        </div>

        {/* Action Controls: Filter Pills & Export CSV */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
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
            {userRole !== 'community' && (
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
            )}
          </div>

          {/* Export CSV Button (Restricted to Administrator Only) */}
          {userRole === 'admin' && (
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredIssues.length === 0 || isExporting}
              title={t.exportCsvTitle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-xs border transition-all shrink-0 ${
                exportSuccess
                  ? 'bg-[#006c4a] text-white border-[#006c4a] shadow-xs'
                  : filteredIssues.length === 0
                  ? 'bg-[#f2f3ff] text-[#757684] border-[#c4c5d5]/40 opacity-50 cursor-not-allowed'
                  : 'bg-white text-[#00288e] border-[#c4c5d5]/60 hover:bg-[#00288e] hover:text-white hover:border-[#00288e] shadow-2xs cursor-pointer'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {exportSuccess ? 'check_circle' : 'file_download'}
              </span>
              <span className="font-semibold">
                {exportSuccess ? t.exportSuccess : t.exportCsv}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                  exportSuccess
                    ? 'bg-white/20 text-white'
                    : 'bg-[#eaedff] text-[#00288e]'
                }`}
              >
                {filteredIssues.length}
              </span>
            </button>
          )}
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
              {issues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#757684]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <span className="material-symbols-outlined text-[36px] text-[#757684]/50">
                        assignment_late
                      </span>
                      <p className="font-sans text-sm font-semibold text-[#131b2e]">
                        {lang === 'kn'
                          ? 'ಇನ್ನೂ ಯಾವುದೇ ಸಮುದಾಯ ವರದಿಗಳಿಲ್ಲ. ಮೊದಲ ವರದಿಯನ್ನು ರಚಿಸಿ.'
                          : 'No community reports yet. Create the first report.'}
                      </p>
                      <p className="font-sans text-xs text-[#757684]">
                        {lang === 'kn'
                          ? 'ರಸ್ತೆಗಳು, ದೀಪಗಳು, ನೈರ್ಮಲ್ಯ ಮತ್ತು ಸೌಲಭ್ಯಗಳ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಲು ಮೇಲಿನ ಬಟನ್ ಬಳಸಿ.'
                          : 'Civic infrastructure items, streetlights, and repairs logged by residents will show here.'}
                      </p>
                      {onOpenReportModal && userRole === 'community' && (
                        <button
                          type="button"
                          onClick={onOpenReportModal}
                          className="mt-2 px-4 py-2 bg-[#1e40af] hover:bg-[#00288e] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_circle</span>
                          <span>{lang === 'kn' ? 'ಮೊದಲ ವರದಿ ರಚಿಸಿ' : 'Create First Report'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : displayedIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#757684]">
                    {t.noIssuesMatching}
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
                          {translateCategory(issue.category, lang)}
                        </span>
                      </td>

                      {/* Title & Location */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(issue)}
                          className="text-left group/title cursor-pointer block"
                        >
                          <span className="font-sans text-xs font-semibold text-[#131b2e] group-hover/title:text-[#00288e] group-hover/title:underline transition-colors block leading-tight">
                            {translateIssueTitle(issue, lang)}
                          </span>
                        </button>
                        <span className="font-sans text-[11px] text-[#757684] flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[13px] text-[#757684]">
                            location_on
                          </span>{' '}
                          {translateIssueLocation(issue, lang)}
                        </span>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-2">{getSeverityBadge(issue.severity)}</td>

                      {/* Status & Work Order */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        {issue.status === 'In Progress' && (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-semibold text-[#00288e]">
                              {translateStatus('In Progress', lang)}
                            </span>
                            <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#00288e] h-1.5 rounded-full transition-all"
                                style={{ width: `${issue.progressPercent || 60}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#757684]">
                              {translateIssueWorkOrder(
                                issue.workOrderKn || issue.workOrder || 'Field Crew Dispatched',
                                lang
                              )}
                            </span>
                          </div>
                        )}

                        {isAwaiting && (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-semibold text-[#6e3900]">
                              {translateStatus('Awaiting Signoff', lang)}
                            </span>
                            <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#006c4a] h-1.5 rounded-full w-full"></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#006c4a] font-medium">
                              {translateIssueWorkOrder(
                                issue.workOrderKn || 'Field Work Completed',
                                lang
                              )}
                            </span>
                          </div>
                        )}

                        {issue.status === 'Scheduled' && (
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] font-semibold text-[#00288e]">
                              {translateStatus('Scheduled', lang)}
                            </span>
                            <div className="w-full bg-[#eaedff] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#1e40af] h-1.5 rounded-full"
                                style={{ width: `${issue.progressPercent || 40}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[10px] text-[#757684]">
                              {translateIssueWorkOrder(
                                issue.workOrderKn || issue.workOrder || 'Crew Scheduled',
                                lang
                              )}
                            </span>
                          </div>
                        )}

                        {issue.status === 'Resolved & Closed' && (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-[#006c4a] font-mono text-[10px] font-semibold">
                              <span className="material-symbols-outlined text-[14px]">
                                check_circle
                              </span>
                              <span>{translateStatus('Resolved & Closed', lang)}</span>
                            </div>
                            <span className="font-mono text-[10px] text-[#757684]">
                              {translateIssueWorkOrder(
                                issue.workOrderKn || issue.workOrder || 'Verified by Resident',
                                lang
                              )}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 px-2 font-mono text-[11px] text-[#757684] whitespace-nowrap">
                        {translateTime(issue.updatedTime, lang)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isAwaiting ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onReviewIssue) {
                                onReviewIssue(issue);
                              } else if (onJumpToVerification) {
                                onJumpToVerification(issue);
                              } else {
                                onOpenDetail(issue);
                              }
                            }}
                            className="px-3 py-1.5 bg-[#006c4a] hover:bg-[#005137] text-white rounded font-mono text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            <span>{t.reviewBtn}</span>
                          </button>
                        ) : issue.status === 'Resolved & Closed' ? (
                          <button
                            type="button"
                            onClick={() => onOpenDetail(issue)}
                            className="px-2.5 py-1.5 bg-[#82f5c1]/20 hover:bg-[#82f5c1]/40 text-[#006c4a] rounded font-mono text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer border border-[#82f5c1]/50"
                            title={lang === 'kn' ? 'ಪರಿಶೀಲನಾ ದಾಖಲೆ ವೀಕ್ಷಿಸಿ' : 'Review Resolution Audit'}
                          >
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            <span>{lang === 'kn' ? 'ಪರಿಶೀಲನೆ' : 'Review Audit'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenDetail(issue)}
                            className="px-2.5 py-1.5 text-[#00288e] bg-[#eaedff] hover:bg-[#dde1ff] rounded font-mono text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title={t.inspectBtn}
                          >
                            <span className="material-symbols-outlined text-[14px]">visibility</span>
                            <span>{lang === 'kn' ? 'ಪರಿಶೀಲಿಸಿ' : 'Inspect'}</span>
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
        <div className="bg-[#f2f3ff] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-[#757684] border-t border-[#c4c5d5]/30">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              {t.showing}{' '}
              <strong className="text-[#131b2e]">
                {displayedIssues.length} {t.of} {filteredIssues.length}
              </strong>{' '}
              {t.issuesText}
            </span>
            <span className="text-[#c4c5d5] hidden sm:inline">•</span>
            <span className="font-mono text-[10px] hidden sm:inline">
              {t.isoCompliance}
            </span>
            {userRole === 'admin' && (
              <>
                <span className="text-[#c4c5d5] hidden md:inline">•</span>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={filteredIssues.length === 0 || isExporting}
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-[#00288e] hover:underline font-semibold disabled:opacity-50 disabled:no-underline cursor-pointer"
                  title={t.exportCsvTitle}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {exportSuccess ? 'check' : 'file_download'}
                  </span>
                  <span>{exportSuccess ? t.exportSuccess : t.exportCsv}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-2 py-0.5 rounded transition-all ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed text-[#757684]'
                  : 'hover:bg-[#eaedff] text-[#00288e] font-semibold'
              }`}
            >
              {t.previous}
            </button>
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
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-2 py-0.5 rounded transition-all ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed text-[#757684]'
                  : 'hover:bg-[#eaedff] text-[#00288e] font-semibold'
              }`}
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
