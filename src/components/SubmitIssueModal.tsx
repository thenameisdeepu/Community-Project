import React, { useState } from 'react';
import { Issue, IssueCategory, Severity, Language } from '../types';
import { campusZones } from '../data/mockData';

interface SubmitIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIssue: Partial<Issue>) => void;
  lang: Language;
}

export const SubmitIssueModal: React.FC<SubmitIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [category, setCategory] = useState<IssueCategory>('Plumbing');
  const [zone, setZone] = useState<string>(campusZones[0]);
  const [specificLocation, setSpecificLocation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<Severity>('Hazard / High');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNlfVfk07iQu4WBFHZoFaMoSl64o-AAa46qyWIOfxL_1jBMgqSZmhC9WvpCb7-WqlEmdc1REivTQmgoEL9i12-gHBhvjtGMEnGVJs6IsEiS2Srnd3KlUQhGknfk62cF_DD_469uyl-WEcCcXlNCtDiGQe8yCOyP8v7Dp_NS1nj3d_27O5SPslK29qiydJir8oVtq3erewJuCjWlnaCbIJzH77pmcqe1ppL3lFvBzM3pTKHsuWQtnm2kw'
  );

  if (!isOpen) return null;

  const categories: Array<{ id: IssueCategory; label: string; icon: string }> = [
    { id: 'Plumbing', label: 'Plumbing', icon: 'plumbing' },
    { id: 'Electrical', label: 'Electrical', icon: 'lightbulb' },
    { id: 'Damaged Infra', label: 'Damaged Infra', icon: 'construction' },
    { id: 'Internet', label: 'Internet', icon: 'wifi' },
    { id: 'Waste', label: 'Waste Sanitation', icon: 'delete' },
    { id: 'Safety', label: 'Safety & Security', icon: 'security' },
    { id: 'Elevator', label: 'Elevator / HVAC', icon: 'elevator' },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newIssue: Partial<Issue> = {
      category,
      categoryIcon: categories.find((c) => c.id === category)?.icon || 'build',
      title: title.trim(),
      location: specificLocation ? `${specificLocation} • ${zone}` : zone,
      zone,
      severity,
      description: description.trim() || 'Campus issue submitted by student coordinator.',
      incidentPhoto: photoUrl,
    };

    onSubmit(newIssue);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white max-w-xl w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/30 relative animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eaedff] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#dde1ff] text-[#00288e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">add_task</span>
            </span>
            <div>
              <h3 className="font-sans font-bold text-base text-[#131b2e]">
                Submit New Community Issue
              </h3>
              <p className="font-sans text-[11px] text-[#757684]">
                Direct intake into Greenwood University Municipal Dispatch Grid
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#757684] hover:text-[#131b2e] rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Category Selector */}
          <div>
            <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-2">
              Select Category:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs font-sans transition-all ${
                    category === c.id
                      ? 'border-[#00288e] bg-[#eaedff] text-[#00288e] font-semibold shadow-2xs'
                      : 'border-[#c4c5d5]/50 bg-white text-[#444653] hover:bg-[#f2f3ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Specific Location */}
          <div className="space-y-3">
            <div>
              <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                Issue Summary / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken water tap creating flooding in block corridor..."
                className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                  Campus Zone:
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                >
                  {campusZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                  Specific Landmark / Room:
                </label>
                <input
                  type="text"
                  value={specificLocation}
                  onChange={(e) => setSpecificLocation(e.target.value)}
                  placeholder="e.g. Room 102, Near North Fire Staircase"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                />
              </div>
            </div>
          </div>

          {/* Severity & SLA Preview */}
          <div>
            <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1.5">
              Urgency & Severity Level:
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Low', 'Medium', 'Hazard / High', 'Critical'] as Severity[]).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    severity === sev
                      ? sev === 'Hazard / High' || sev === 'Critical'
                        ? 'bg-[#ba1a1a] text-white font-semibold'
                        : 'bg-[#00288e] text-white font-semibold'
                      : 'bg-[#f2f3ff] text-[#444653] hover:bg-[#eaedff]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* SLA Preview card */}
            <div className="mt-2 p-2.5 bg-[#82f5c1]/20 rounded-lg flex items-center justify-between border border-[#82f5c1]/50 text-xs font-sans">
              <span className="text-[#006c4a] flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px]">timer</span>
                Greenwood SLA Target:
              </span>
              <span className="font-mono font-bold text-[#006c4a]">
                {severity === 'Hazard / High' || severity === 'Critical'
                  ? 'Triage < 15 mins • Dispatch within 1 hr'
                  : 'Triage < 45 mins • Schedule within 24 hrs'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
              Incident Notes & Details:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical hazard, water risk, electrical sparking, or disruption to students..."
              className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
            />
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
              Field Photo Evidence:
            </label>
            <div className="flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Uploaded evidence preview"
                className="w-16 h-14 object-cover rounded-md border border-[#c4c5d5]"
              />
              <div className="text-xs font-sans text-[#757684]">
                <span>Attached: Incident snapshot with geotag stamp.</span>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl(
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBBhCtRAlemqXBgCAF4xgkbkXMeuYLPgDE4m0ay3pRWnpYi7PzKvTFWsmDRpvGGJyec-qcRNrxtz8sc0fhATm1uFSE1d9s_Cj5uoK4wFX-wLDFchfa5WH0untxXMqeKkKRtOjLc1TIGfULkx2BORlENzPb7o4iAwrmzhzKEnF9Bx5D7z6vtVN8QN-ixO00qdms8Q4WEZKT3oBf69aPjUCeTNq1xOws5TqkNoDU-UdFg4CCsy1cDXNy2KQ'
                    )
                  }
                  className="block text-[#00288e] hover:underline font-mono text-[11px] mt-0.5"
                >
                  Switch to alternate test sample
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-sans text-[#444653] hover:bg-[#eaedff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#1e40af] hover:bg-[#00288e] text-white text-xs font-sans font-semibold shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              Submit & Register Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
