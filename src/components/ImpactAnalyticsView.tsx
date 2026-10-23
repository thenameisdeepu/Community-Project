import React from 'react';
import { CampusStats, Language, Issue, IssueCategory } from '../types';
import { translateCategory } from '../data/translations';

interface ImpactAnalyticsViewProps {
  stats: CampusStats;
  issues?: Issue[];
  lang: Language;
}

const CATEGORIES: { id: IssueCategory; nameEn: string; nameKn: string; icon: string }[] = [
  { id: 'Electrical', nameEn: 'Electrical & Lighting', nameKn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಬೆಳಕು', icon: 'bolt' },
  { id: 'Plumbing', nameEn: 'Plumbing & Hydraulic', nameKn: 'ಪ್ಲಂಬಿಂಗ್ ಮತ್ತು ನೀರು', icon: 'plumbing' },
  { id: 'Damaged Infra', nameEn: 'Damaged Infra & Civil', nameKn: 'ಹಾನಿಗೊಳಗಾದ ಮೂಲಸೌಕರ್ಯ', icon: 'handyman' },
  { id: 'Internet', nameEn: 'Wi-Fi & Telecom NOC', nameKn: 'ವೈ-ಫೈ ಮತ್ತು ನೆಟ್‌ವರ್ಕ್', icon: 'wifi' },
  { id: 'Waste', nameEn: 'Waste Sanitation', nameKn: 'ತ್ಯಾಜ್ಯ ಮತ್ತು ನೈರ್ಮಲ್ಯ', icon: 'delete_sweep' },
  { id: 'Safety', nameEn: 'Campus Security & Safety', nameKn: 'ಕ್ಯಾಂಪಸ್ ಸುರಕ್ಷತೆ', icon: 'shield' },
  { id: 'Elevator', nameEn: 'Elevator & Transit', nameKn: 'ಲಿಫ್ಟ್ ಮತ್ತು ಎಲಿವೇಟರ್', icon: 'elevator' },
  { id: 'Other', nameEn: 'General Campus Facilities', nameKn: 'ಇತರೆ ಸೌಲಭ್ಯಗಳು', icon: 'more_horiz' },
];

export const ImpactAnalyticsView: React.FC<ImpactAnalyticsViewProps> = ({
  stats,
  issues = [],
  lang,
}) => {
  const isKn = lang === 'kn';

  // 1. Calculate actual resolved issues
  const resolvedIssues = issues.filter(
    (i) => i.status === 'Resolved & Closed'
  );
  const totalCampusFixes = resolvedIssues.length;

  // 2. Calculate rated issues and satisfaction
  const ratedIssues = issues.filter(
    (i) => typeof i.resolutionRating === 'number' && i.resolutionRating > 0
  );
  const totalVerifications = ratedIssues.length;
  const avgSatisfaction =
    totalVerifications > 0
      ? (ratedIssues.reduce((sum, i) => sum + (i.resolutionRating || 0), 0) / totalVerifications).toFixed(1)
      : null;

  // 3. Calculate Mean Time to Fix (hours)
  let calculatedAvgHours: string | null = null;
  if (totalCampusFixes > 0) {
    const validTimes: number[] = [];
    for (const issue of resolvedIssues) {
      if (issue.submittedTime && issue.updatedTime) {
        const start = new Date(issue.submittedTime).getTime();
        const end = new Date(issue.updatedTime).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          validTimes.push((end - start) / (1000 * 60 * 60));
        }
      }
    }
    if (validTimes.length > 0) {
      calculatedAvgHours = (validTimes.reduce((a, b) => a + b, 0) / validTimes.length).toFixed(1);
    }
  }

  // 4. Calculate SLA Compliance Rate
  let calculatedSlaRate: string | null = null;
  if (totalCampusFixes > 0) {
    let onTimeCount = 0;
    for (const issue of resolvedIssues) {
      const slaHours = issue.severity === 'Critical' ? 4 : issue.severity === 'Hazard / High' ? 8 : 24;
      if (issue.submittedTime && issue.updatedTime) {
        const diff = (new Date(issue.updatedTime).getTime() - new Date(issue.submittedTime).getTime()) / (1000 * 60 * 60);
        if (isNaN(diff) || diff <= slaHours) {
          onTimeCount++;
        }
      } else {
        onTimeCount++;
      }
    }
    calculatedSlaRate = ((onTimeCount / totalCampusFixes) * 100).toFixed(1);
  }

  // Use stats from server if present, else derived
  const slaDisplay = stats?.onTimeSlaRate != null
    ? `${stats.onTimeSlaRate}%`
    : calculatedSlaRate != null
    ? `${calculatedSlaRate}%`
    : 'N/A';

  const meanTimeDisplay = stats?.avgResolutionHours != null
    ? `${stats.avgResolutionHours}h`
    : calculatedAvgHours != null
    ? `${calculatedAvgHours}h`
    : 'N/A';

  const satisfactionDisplay = stats?.citizenSatisfaction != null
    ? `${stats.citizenSatisfaction}★`
    : avgSatisfaction != null
    ? `${avgSatisfaction}★`
    : 'N/A';

  // 5. Audit Score (calculated only when genuine resolutions exist)
  const auditScoreDisplay = totalCampusFixes > 0 && calculatedSlaRate != null
    ? `${Math.min(100, Math.round(Number(calculatedSlaRate) * 0.95 + (avgSatisfaction ? Number(avgSatisfaction) : 4.5) * 1.0))} / 100`
    : 'N/A';

  // 6. Dynamic Category Breakdown
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const catIssues = issues.filter((i) => i.category === cat.id);
    const catResolved = catIssues.filter(
      (i) => i.status === 'Resolved & Closed'
    );
    const count = catResolved.length;

    let avgHoursStr = 'N/A';
    if (count > 0) {
      const hoursList: number[] = [];
      for (const i of catResolved) {
        if (i.submittedTime && i.updatedTime) {
          const s = new Date(i.submittedTime).getTime();
          const e = new Date(i.updatedTime).getTime();
          if (!isNaN(s) && !isNaN(e) && e >= s) {
            hoursList.push((e - s) / (1000 * 60 * 60));
          }
        }
      }
      if (hoursList.length > 0) {
        avgHoursStr = `${(hoursList.reduce((a, b) => a + b, 0) / hoursList.length).toFixed(1)} hrs`;
      }
    }

    let complianceStr = 'N/A';
    if (count > 0) {
      let compCount = 0;
      for (const i of catResolved) {
        const sla = i.severity === 'Critical' ? 4 : i.severity === 'Hazard / High' ? 8 : 24;
        if (i.submittedTime && i.updatedTime) {
          const diff = (new Date(i.updatedTime).getTime() - new Date(i.submittedTime).getTime()) / (1000 * 60 * 60);
          if (isNaN(diff) || diff <= sla) compCount++;
        } else {
          compCount++;
        }
      }
      complianceStr = `${((compCount / count) * 100).toFixed(0)}%`;
    }

    let statusLabel = isKn ? 'ದಾಖಲೆಯಿಲ್ಲ' : 'No data yet';
    let statusClass = 'text-slate-400 dark:text-slate-500';
    let dotClass = 'bg-slate-300 dark:bg-slate-600';

    if (count > 0) {
      statusLabel = isKn ? 'ಸಕ್ರಿಯ / ಸೂಕ್ತ' : 'Optimal';
      statusClass = 'text-[#006c4a] dark:text-emerald-400';
      dotClass = 'bg-[#006c4a] dark:bg-emerald-400';
    }

    return {
      id: cat.id,
      name: isKn ? cat.nameKn : cat.nameEn,
      icon: cat.icon,
      count,
      avgHours: avgHoursStr,
      compliance: complianceStr,
      statusLabel,
      statusClass,
      dotClass,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#151E2E] p-6 rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#00288e] dark:text-blue-300 bg-[#eaedff] dark:bg-blue-950/60 px-2 py-0.5 rounded border border-[#00288e]/10 dark:border-blue-800/40">
              {isKn ? 'ನಾಗರಿಕ ಇಂಟೆಲಿಜೆನ್ಸ್ ಮತ್ತು ISO-37120' : 'Civic Intelligence & ISO-37120'}
            </span>
            <span className="text-xs text-[#757684] dark:text-slate-400">
              {isKn ? 'ತ್ರೈಮಾಸಿಕ ಆಡಳಿತ ಪರಿಶೀಲನೆ' : 'Quarterly Governance Audit'}
            </span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e] dark:text-slate-100">
            {isKn ? 'ಕ್ಯಾಂಪಸ್ ಪ್ರಭಾವ ಮತ್ತು ಕಾರ್ಯಾಚರಣೆಯ ವಿಶ್ಲೇಷಣೆ' : 'Campus Impact & Operational Analytics'}
          </h2>
          <p className="font-sans text-xs text-[#444653] dark:text-slate-300 max-w-2xl mt-0.5">
            {isKn
              ? 'ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ ದಕ್ಷತೆ, ನಿವಾಸಿಗಳ ಪರಿಶೀಲನೆ ದರಗಳು ಮತ್ತು ತಡೆಗಟ್ಟುವ ನಿರ್ವಹಣೆಯನ್ನು ದೃಢೀಕರಿಸುವ ಪಾರದರ್ಶಕ ಸಾರ್ವಜನಿಕ ಮೆಟ್ರಿಕ್‌ಗಳು.'
              : 'Transparent public metrics validating response time efficiency, resident signoff rates, and preventative maintenance.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-[#82f5c1]/20 dark:bg-emerald-950/40 border border-[#82f5c1]/40 dark:border-emerald-800/50 rounded-lg text-right">
            <span className="font-mono text-[10px] text-[#006c4a] dark:text-emerald-400 block font-bold">
              {isKn ? 'ಆಡಿಟ್ ಸ್ಕೋರ್' : 'Audit Score'}
            </span>
            <span className="font-sans text-lg font-bold text-[#006c4a] dark:text-emerald-300">
              {auditScoreDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Campus Fixes */}
        <div className="p-4 bg-white dark:bg-[#151E2E] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {isKn ? 'ಒಟ್ಟು ಕ್ಯಾಂಪಸ್ ದುರಸ್ತಿಗಳು' : 'Total Campus Fixes'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#131b2e] dark:text-slate-100 block mt-1">
            {totalCampusFixes}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 font-medium">
            {totalCampusFixes > 0
              ? isKn
                ? `${totalCampusFixes} ಪರಿಶೀಲಿಸಿದ ದುರಸ್ತಿಗಳು`
                : `${totalCampusFixes} verified repair${totalCampusFixes > 1 ? 's' : ''}`
              : isKn
              ? 'ಯಾವುದೇ ದೃಢೀಕರಿಸಿದ ದುರಸ್ತಿಗಳಿಲ್ಲ'
              : 'No verified fixes yet'}
          </span>
        </div>

        {/* On-Time SLA Rate */}
        <div className="p-4 bg-white dark:bg-[#151E2E] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {isKn ? 'ಸಮಯಕ್ಕೆ ಸರಿಯಾದ SLA ದರ' : 'On-Time SLA Rate'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#00288e] dark:text-blue-400 block mt-1">
            {slaDisplay}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {slaDisplay !== 'N/A'
              ? isKn
                ? 'ಗ್ರೀನ್‌ವುಡ್ SLA ಮಾನದಂಡ'
                : 'Greenwood SLA standard'
              : isKn
              ? 'ಪರಿಹಾರ ದತ್ತಾಂಶದ ನಿರೀಕ್ಷೆಯಲ್ಲಿದೆ'
              : 'Awaiting resolved data'}
          </span>
        </div>

        {/* Mean Time to Fix */}
        <div className="p-4 bg-white dark:bg-[#151E2E] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {isKn ? 'ಸರಾಸರಿ ಪರಿಹಾರ ಸಮಯ' : 'Mean Time to Fix'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#6e3900] dark:text-amber-400 block mt-1">
            {meanTimeDisplay}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {meanTimeDisplay !== 'N/A'
              ? isKn
                ? 'ಸರಾಸರಿ ದುರಸ್ತಿ ಅವಧಿ'
                : 'Average duration to fix'
              : isKn
              ? 'ಯಾವುದೇ ದುರಸ್ತಿ ಇತಿಹಾಸವಿಲ್ಲ'
              : 'No repair history yet'}
          </span>
        </div>

        {/* Resident Rating */}
        <div className="p-4 bg-white dark:bg-[#151E2E] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {isKn ? 'ನಿವಾಸಿಗಳ ರೇಟಿಂಗ್' : 'Resident Rating'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#006c4a] dark:text-emerald-400 block mt-1">
            {satisfactionDisplay}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {totalVerifications > 0
              ? isKn
                ? `${totalVerifications} ಪರಿಶೀಲನೆಗಳ ಆಧಾರದ ಮೇಲೆ`
                : `Based on ${totalVerifications} verification${totalVerifications > 1 ? 's' : ''}`
              : isKn
              ? 'ಇನ್ನೂ ಯಾವುದೇ ರೇಟಿಂಗ್ ಇಲ್ಲ'
              : 'No resident signoffs yet'}
          </span>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white dark:bg-[#151E2E] p-5 rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-bold text-base text-[#131b2e] dark:text-slate-100">
            {isKn
              ? 'ಮೂಲಸೌಕರ್ಯ ವರ್ಗವಾರು ಪ್ರತಿಕ್ರಿಯೆ ವೇಗ ಮಾನದಂಡಗಳು'
              : 'Response Speed Benchmarks by Infrastructure Category'}
          </h3>
          <span className="font-mono text-[11px] text-[#757684] dark:text-slate-400">
            {totalCampusFixes > 0
              ? `${totalCampusFixes} ${isKn ? 'ದುರಸ್ತಿಗಳು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ' : 'tickets analyzed'}`
              : isKn
              ? 'ನೈಜ ದತ್ತಾಂಶದಿಂದ ಗಣನೆ ಮಾಡಲಾಗುತ್ತದೆ'
              : 'Calculated from live tickets'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-[#f2f3ff] dark:bg-slate-800/70 text-[#444653] dark:text-slate-300 font-mono text-[10px] uppercase border-b border-[#c4c5d5]/30 dark:border-slate-700">
                <th className="py-2.5 px-4 font-semibold">{isKn ? 'ಮೂಲಸೌಕರ್ಯ ವರ್ಗ' : 'Infrastructure Category'}</th>
                <th className="py-2.5 px-4 font-semibold">{isKn ? 'ಪರಿಹರಿಸಲಾದ ಟಿಕೆಟ್‌ಗಳು' : 'Tickets Resolved'}</th>
                <th className="py-2.5 px-4 font-semibold">{isKn ? 'ಸರಾಸರಿ ದುರಸ್ತಿ ಸಮಯ' : 'Avg Fix Time'}</th>
                <th className="py-2.5 px-4 font-semibold">{isKn ? 'SLA ಅನುಸರಣೆ' : 'SLA Compliance'}</th>
                <th className="py-2.5 px-4 font-semibold">{isKn ? 'ಸ್ಥಿತಿ ಸೂಚಕ' : 'Status Indicator'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff] dark:divide-slate-800">
              {categoryBreakdown.map((row) => (
                <tr key={row.id} className="hover:bg-[#f2f3ff]/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#131b2e] dark:text-slate-200">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-slate-500">
                        {row.icon}
                      </span>
                      <span>{row.name}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono dark:text-slate-300">{row.count}</td>
                  <td className="py-3 px-4 font-mono font-medium dark:text-slate-300">{row.avgHours}</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#006c4a] dark:text-emerald-400">
                    {row.compliance}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold ${row.statusClass}`}>
                      <span className={`w-2 h-2 rounded-full ${row.dotClass}`}></span>
                      <span>{row.statusLabel}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
