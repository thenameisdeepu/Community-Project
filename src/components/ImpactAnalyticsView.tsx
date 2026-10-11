import React from 'react';
import { CampusStats, Language } from '../types';

interface ImpactAnalyticsViewProps {
  stats: CampusStats;
  lang: Language;
}

export const ImpactAnalyticsView: React.FC<ImpactAnalyticsViewProps> = ({ stats }) => {
  const categoryBreakdown = [
    { name: 'Electrical & Lighting', count: 34, avgHours: 3.8, compliance: '98.5%' },
    { name: 'Plumbing & Hydraulic', count: 28, avgHours: 2.1, compliance: '99.1%' },
    { name: 'Damaged Infra & Civil', count: 19, avgHours: 6.4, compliance: '94.2%' },
    { name: 'Wi-Fi & Telecom NOC', count: 42, avgHours: 1.4, compliance: '99.8%' },
    { name: 'Waste Sanitation', count: 51, avgHours: 1.2, compliance: '100%' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#00288e] bg-[#eaedff] px-2 py-0.5 rounded">
              Civic Intelligence & ISO-37120
            </span>
            <span className="text-xs text-[#757684]">Quarterly Governance Audit</span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
            Campus Impact & Operational Analytics
          </h2>
          <p className="font-sans text-xs text-[#444653] max-w-2xl mt-0.5">
            Transparent public metrics validating response time efficiency, resident signoff rates, and preventative maintenance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-[#82f5c1]/20 border border-[#82f5c1]/40 rounded-lg text-right">
            <span className="font-mono text-[10px] text-[#006c4a] block font-bold">Audit Score</span>
            <span className="font-sans text-lg font-bold text-[#006c4a]">99.4 / 100</span>
          </div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#c4c5d5]/30 shadow-xs">
          <span className="font-mono text-[10px] text-[#757684] uppercase">Total Campus Fixes</span>
          <span className="font-sans text-2xl font-bold text-[#131b2e] block mt-1">174</span>
          <span className="font-mono text-[10px] text-[#006c4a] font-semibold">↑ 18% vs last quarter</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#c4c5d5]/30 shadow-xs">
          <span className="font-mono text-[10px] text-[#757684] uppercase">On-Time SLA Rate</span>
          <span className="font-sans text-2xl font-bold text-[#00288e] block mt-1">{stats.onTimeSlaRate}%</span>
          <span className="font-mono text-[10px] text-[#757684]">Greenwood SLA standard</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#c4c5d5]/30 shadow-xs">
          <span className="font-mono text-[10px] text-[#757684] uppercase">Mean Time to Fix</span>
          <span className="font-sans text-2xl font-bold text-[#6e3900] block mt-1">{stats.avgResolutionHours}h</span>
          <span className="font-mono text-[10px] text-[#006c4a] font-semibold">↓ 42 mins faster</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-[#c4c5d5]/30 shadow-xs">
          <span className="font-mono text-[10px] text-[#757684] uppercase">Resident Rating</span>
          <span className="font-sans text-2xl font-bold text-[#006c4a] block mt-1">{stats.citizenSatisfaction}★</span>
          <span className="font-mono text-[10px] text-[#757684]">Based on 142 verifications</span>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white p-5 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <h3 className="font-sans font-bold text-base text-[#131b2e] mb-4">
          Response Speed Benchmarks by Infrastructure Category
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#444653] font-mono text-[10px] uppercase border-b border-[#c4c5d5]/30">
                <th className="py-2.5 px-4 font-semibold">Infrastructure Category</th>
                <th className="py-2.5 px-4 font-semibold">Tickets Resolved</th>
                <th className="py-2.5 px-4 font-semibold">Avg Fix Time</th>
                <th className="py-2.5 px-4 font-semibold">SLA Compliance</th>
                <th className="py-2.5 px-4 font-semibold">Status Indicator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]">
              {categoryBreakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f2f3ff]/50">
                  <td className="py-3 px-4 font-semibold text-[#131b2e]">{row.name}</td>
                  <td className="py-3 px-4 font-mono">{row.count}</td>
                  <td className="py-3 px-4 font-mono font-medium">{row.avgHours} hrs</td>
                  <td className="py-3 px-4 font-mono font-bold text-[#006c4a]">{row.compliance}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[#006c4a] font-mono text-[11px] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span> Optimal
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
