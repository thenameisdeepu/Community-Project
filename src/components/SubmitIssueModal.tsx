import React, { useState, useEffect } from 'react';
import { Issue, IssueCategory, Severity, Language } from '../types';
import { campusZones } from '../data/mockData';
import { api } from '../services/api';
import { categoryTranslationsKn } from '../data/translations';

interface SubmitIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIssue: Partial<Issue>) => void;
  lang: Language;
  initialData?: {
    title?: string;
    category?: string;
    location?: string;
    description?: string;
  } | null;
}

export const SubmitIssueModal: React.FC<SubmitIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lang,
  initialData,
}) => {
  const [category, setCategory] = useState<IssueCategory>('Plumbing');
  const [zone, setZone] = useState<string>(campusZones[0]);
  const [specificLocation, setSpecificLocation] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<Severity>('Hazard / High');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCNlfVfk07iQu4WBFHZoFaMoSl64o-AAa46qyWIOfxL_1jBMgqSZmhC9WvpCb7-WqlEmdc1REivTQmgoEL9i12-gHBhvjtGMEnGVJs6IsEiS2Srnd3KlUQhGknfk62cF_DD_469uyl-WEcCcXlNCtDiGQe8yCOyP8v7Dp_NS1nj3d_27O5SPslK29qiydJir8oVtq3erewJuCjWlnaCbIJzH77pmcqe1ppL3lFvBzM3pTKHsuWQtnm2kw'
  );

  // CommUnity AI Auto-Triage state
  const [naturalText, setNaturalText] = useState<string>('');
  const [isAiTriaging, setIsAiTriaging] = useState<boolean>(false);
  const [aiTriageBadge, setAiTriageBadge] = useState<string | null>(null);
  const [showAiBox, setShowAiBox] = useState<boolean>(true);

  useEffect(() => {
    if (initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.location) setSpecificLocation(initialData.location);
      if (initialData.category) {
        const catStr = initialData.category.toLowerCase();
        if (catStr.includes('water') || catStr.includes('plumb')) setCategory('Plumbing');
        else if (catStr.includes('light') || catStr.includes('electric')) setCategory('Electrical');
        else if (catStr.includes('waste') || catStr.includes('clean') || catStr.includes('trash')) setCategory('Waste');
        else if (catStr.includes('internet') || catStr.includes('wifi') || catStr.includes('network')) setCategory('Internet');
        else if (catStr.includes('road') || catStr.includes('infra') || catStr.includes('pothole') || catStr.includes('civil')) setCategory('Damaged Infra');
        else if (catStr.includes('safety') || catStr.includes('security') || catStr.includes('lock') || catStr.includes('cctv')) setCategory('Safety');
        else if (catStr.includes('building') || catStr.includes('elevator') || catStr.includes('lift') || catStr.includes('hvac') || catStr.includes('ac')) setCategory('Elevator');
        else {
          setCategory('Other');
          setCustomCategory(initialData.category);
        }
      }
    }
  }, [initialData]);

  if (!isOpen) return null;

  const categories: Array<{ id: IssueCategory; label: string; icon: string }> = [
    { id: 'Plumbing', label: 'Plumbing', icon: 'plumbing' },
    { id: 'Electrical', label: 'Electrical', icon: 'lightbulb' },
    { id: 'Damaged Infra', label: 'Damaged Infra', icon: 'construction' },
    { id: 'Internet', label: 'Internet', icon: 'wifi' },
    { id: 'Waste', label: 'Waste Sanitation', icon: 'delete' },
    { id: 'Safety', label: 'Safety & Security', icon: 'security' },
    { id: 'Elevator', label: 'Elevator / HVAC', icon: 'elevator' },
    { id: 'Other', label: 'Other', icon: 'category' },
  ];

  const severityOptions: Array<{
    id: Severity;
    label: string;
    sublabel: string;
    sla: string;
    accent: string;
    activeClasses: string;
  }> = [
    {
      id: 'Low',
      label: 'Low',
      sublabel: 'Routine',
      sla: 'within 48h',
      accent: 'border-slate-200 text-slate-700',
      activeClasses: 'border-slate-800 bg-slate-900 text-white shadow-sm ring-2 ring-slate-800/20',
    },
    {
      id: 'Medium',
      label: 'Medium',
      sublabel: 'Standard',
      sla: 'within 24h',
      accent: 'border-amber-200 text-amber-800',
      activeClasses: 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm ring-2 ring-amber-500/30 font-semibold',
    },
    {
      id: 'Hazard / High',
      label: 'Hazard / High',
      sublabel: 'Priority Fix',
      sla: 'within 1h',
      accent: 'border-orange-200 text-orange-800',
      activeClasses: 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm ring-2 ring-orange-500/30 font-semibold',
    },
    {
      id: 'Critical',
      label: 'Critical',
      sublabel: 'Emergency',
      sla: '< 15 mins',
      accent: 'border-rose-200 text-rose-800',
      activeClasses: 'border-rose-600 bg-rose-50 text-rose-950 shadow-sm ring-2 ring-rose-600/30 font-semibold',
    },
  ];

  const handleAiAutoTriage = async () => {
    if (!naturalText.trim() || isAiTriaging) return;
    setIsAiTriaging(true);
    setAiTriageBadge(null);

    try {
      const analysis = await api.analyzeIssueWithAI(naturalText);
      if (analysis) {
        if (analysis.title) setTitle(analysis.title);
        if (analysis.location) setSpecificLocation(analysis.location);
        if (analysis.description) {
          setDescription(`${analysis.description}\n\n[CommUnity AI: Priority ${analysis.priority} — ${analysis.priority_reason || 'Verified'}]`);
        }
        if (analysis.category) {
          const c = analysis.category.toLowerCase();
          if (c.includes('water') || c.includes('plumb')) setCategory('Plumbing');
          else if (c.includes('light') || c.includes('electric')) setCategory('Electrical');
          else if (c.includes('waste') || c.includes('clean') || c.includes('trash')) setCategory('Waste');
          else if (c.includes('internet') || c.includes('wifi') || c.includes('network')) setCategory('Internet');
          else if (c.includes('road') || c.includes('infra') || c.includes('pothole') || c.includes('civil')) setCategory('Damaged Infra');
          else if (c.includes('safety') || c.includes('security') || c.includes('lock') || c.includes('cctv')) setCategory('Safety');
          else if (c.includes('building') || c.includes('elevator') || c.includes('lift') || c.includes('hvac') || c.includes('ac')) setCategory('Elevator');
          else {
            setCategory('Other');
            setCustomCategory(analysis.category);
          }
        }
        if (analysis.priority === 'P1') setSeverity('Critical');
        else if (analysis.priority === 'P2') setSeverity('Hazard / High');
        else if (analysis.priority === 'P4') setSeverity('Low');
        else setSeverity('Medium');

        setAiTriageBadge(`${analysis.priority} (${analysis.category})`);
      }
    } catch (err) {
      console.warn('AI Auto-Triage error:', err);
    } finally {
      setIsAiTriaging(false);
    }
  };

  const handleUseGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lng = pos.coords.longitude.toFixed(5);
          setSpecificLocation(`GPS: ${lat}° N, ${lng}° E (±${Math.round(pos.coords.accuracy || 3)}m)`);
        },
        () => {
          setSpecificLocation(`GPS: 12.9716° N, 77.5946° E (±2.5m)`);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setSpecificLocation(`GPS: 12.9716° N, 77.5946° E (±2.5m)`);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDescription =
      category === 'Other' && customCategory.trim()
        ? `[Category: ${customCategory.trim()}]\n\n${description.trim()}`
        : description.trim() || 'Campus issue submitted by student coordinator.';

    const newIssue: Partial<Issue> = {
      category,
      categoryIcon: categories.find((c) => c.id === category)?.icon || 'category',
      title: title.trim(),
      location: specificLocation ? `${specificLocation} • ${zone}` : zone,
      zone,
      severity,
      description: finalDescription,
      incidentPhoto: photoUrl,
    };

    onSubmit(newIssue);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#283044]/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200/80 relative animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header - Spacious & Clean */}
        <div className="px-6 sm:px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">add_task</span>
            </span>
            <div>
              <h3 className="font-sans font-bold text-lg text-slate-900">
                {lang === 'kn' ? 'ಹೊಸ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಿ' : 'Report an Issue'}
              </h3>
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                {lang === 'kn'
                  ? 'ಗ್ರೀನ್‌ವುಡ್ ಮುನ್ಸಿಪಲ್ ಡಿಸ್ಪ್ಯಾಚ್ ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ನೇರ ನೋಂದಣಿ'
                  : 'Direct intake into Greenwood University Municipal Dispatch Grid'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Form Body with Generous Whitespace */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto px-6 sm:px-7 py-6 space-y-6">
          {/* CommUnity AI Auto-Triage Box */}
          <div className="rounded-xl border border-[#00288e]/20 bg-gradient-to-br from-[#f8f9ff] via-[#f2f5ff] to-[#f8faff] p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => setShowAiBox(!showAiBox)}
                className="flex items-center gap-2 text-xs font-semibold text-[#00288e] hover:text-[#001d68] cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg bg-[#00288e]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-[#00288e]">psychology</span>
                </span>
                <span>CommUnity AI Smart Auto-Triage</span>
                <span className="material-symbols-outlined text-[16px] text-[#00288e] transition-transform">
                  {showAiBox ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {aiTriageBadge && (
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-[#00288e] text-white shadow-2xs">
                  ✓ {aiTriageBadge}
                </span>
              )}
            </div>

            {showAiBox && (
              <div className="space-y-2.5 mt-2 animate-in fade-in duration-150">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Type your problem in plain words — AI automatically detects category, urgency, and landmark location.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={naturalText}
                    onChange={(e) => setNaturalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAiAutoTriage();
                      }
                    }}
                    placeholder="e.g. Broken water pipe leaking in chemistry block 2nd floor corridor..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all"
                  />
                  <button
                    type="button"
                    disabled={!naturalText.trim() || isAiTriaging}
                    onClick={handleAiAutoTriage}
                    className="px-4 py-2 bg-[#00288e] hover:bg-[#001d68] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-xs cursor-pointer shrink-0"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isAiTriaging ? 'animate-spin' : ''}`}>
                      {isAiTriaging ? 'sync' : 'auto_fix_high'}
                    </span>
                    <span>{isAiTriaging ? 'Triaging...' : 'Auto-Fill'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Issue Summary / Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-sans text-xs font-semibold text-slate-800 flex items-center gap-1">
                <span>Issue Summary / Title</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-normal">Clear, brief description</span>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken water tap creating flooding in block corridor..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 text-sm font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all shadow-2xs"
            />
          </div>

          {/* Category Chips Selection - Balanced 4x2 Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-sans text-xs font-semibold text-slate-800">
                {lang === 'kn' ? 'ಸಮಸ್ಯೆಯ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Select Category'}
              </label>
              <span className="text-[11px] text-slate-400 font-normal">
                {lang === 'kn' ? '8 ವರ್ಗಗಳು ಲಭ್ಯವಿದೆ' : '8 standard divisions'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-sans transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#00288e] bg-[#00288e] text-white font-semibold shadow-xs'
                        : 'border-slate-200/90 bg-slate-50/60 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 ${
                        isSelected ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {c.icon}
                    </span>
                    <span className="truncate text-xs leading-tight">
                      {lang === 'kn' ? (categoryTranslationsKn[c.id] || c.label) : c.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Category Input (shown when 'Other' is chosen) */}
            {category === 'Other' && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 animate-in fade-in duration-150">
                <label className="font-sans text-xs font-semibold text-slate-800 block mb-1">
                  {lang === 'kn' ? 'ಸಮಸ್ಯೆಯ ನಿಖರವಾದ ವಿಧವನ್ನು ನಮೂದಿಸಿ:' : 'Specify Other Problem Type:'}
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder={
                    lang === 'kn'
                      ? 'ಉದಾ. ಕೀಟ ನಿಯಂತ್ರಣ, ಉದ್ಯಾನವನ, ಪೀಠೋಪಕರಣಗಳು, ಶಬ್ದ ಮಾಲಿನ್ಯ, ಗೋಡೆ ಬಣ್ಣ...'
                      : 'e.g. Pest Control, Landscaping, Furniture Damage, Noise Disturbance, Paint...'
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all"
                />
              </div>
            )}
          </div>

          {/* Location Details (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-sans text-xs font-semibold text-slate-800 block mb-1.5">
                Campus Sector / Zone
              </label>
              <div className="relative">
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 text-xs font-sans text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all cursor-pointer pr-9 shadow-2xs"
                >
                  {campusZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-xs font-semibold text-slate-800">
                  Specific Landmark / Room
                </label>
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="text-[11px] font-sans text-[#00288e] hover:text-[#001d68] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  <span>Use Precise GPS</span>
                </button>
              </div>
              <input
                type="text"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="e.g. Room 102, or near West Staircase"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Urgency & Severity Level (Airy & Clean) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-sans text-xs font-semibold text-slate-800">
                Urgency & Severity Level
              </label>
              <span className="text-[11px] text-slate-400 font-normal">Sets municipal response speed</span>
            </div>

            {/* Severity Card Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {severityOptions.map((opt) => {
                const isSelected = severity === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSeverity(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                      isSelected
                        ? opt.activeClasses
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-sans text-xs font-semibold block">{opt.label}</span>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className={isSelected ? 'opacity-85 font-normal' : 'text-slate-500'}>
                        {opt.sublabel}
                      </span>
                      <span className={`font-mono text-[10px] font-bold ${isSelected ? 'opacity-95' : 'text-slate-400'}`}>
                        {opt.sla}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quiet SLA Commitment Banner */}
            <div className="mt-3 px-3.5 py-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2 text-emerald-900 font-medium">
                <span className="material-symbols-outlined text-[17px] text-emerald-700">timer</span>
                <span>Greenwood Municipal SLA:</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-950">
                {severity === 'Hazard / High' || severity === 'Critical'
                  ? 'Triage < 15 mins • Dispatch within 1 hr'
                  : 'Triage < 45 mins • Schedule within 24 hrs'}
              </span>
            </div>
          </div>

          {/* Description & Incident Details */}
          <div>
            <label className="font-sans text-xs font-semibold text-slate-800 block mb-1.5">
              Incident Notes & Details
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical hazard, water risk, electrical sparking, or disruption to residents..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 text-xs font-sans text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] transition-all resize-y shadow-2xs"
            />
          </div>

          {/* Photo Evidence */}
          <div>
            <label className="font-sans text-xs font-semibold text-slate-800 block mb-1.5">
              Photo Evidence (Attached)
            </label>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3.5">
              <img
                src={photoUrl}
                alt="Uploaded evidence preview"
                className="w-16 h-14 object-cover rounded-lg border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="flex-1 text-xs font-sans text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-900">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>Geotagged Incident Photo Attached</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPhotoUrl(
                      photoUrl.includes('AB6AXuCNlfVfk07iQu4WBFHZoFaMoSl64o-AAa46qyWIOfxL_1jBMgqSZmhC9WvpCb7-WqlEmdc1REivTQmgoEL9i12-gHBhvjtGMEnGVJs6IsEiS2Srnd3KlUQhGknfk62cF_DD_469uyl-WEcCcXlNCtDiGQe8yCOyP8v7Dp_NS1nj3d_27O5SPslK29qiydJir8oVtq3erewJuCjWlnaCbIJzH77pmcqe1ppL3lFvBzM3pTKHsuWQtnm2kw')
                        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBhCtRAlemqXBgCAF4xgkbkXMeuYLPgDE4m0ay3pRWnpYi7PzKvTFWsmDRpvGGJyec-qcRNrxtz8sc0fhATm1uFSE1d9s_Cj5uoK4wFX-wLDFchfa5WH0untxXMqeKkKRtOjLc1TIGfULkx2BORlENzPb7o4iAwrmzhzKEnF9Bx5D7z6vtVN8QN-ixO00qdms8Q4WEZKT3oBf69aPjUCeTNq1xOws5TqkNoDU-UdFg4CCsy1cDXNy2KQ'
                        : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNlfVfk07iQu4WBFHZoFaMoSl64o-AAa46qyWIOfxL_1jBMgqSZmhC9WvpCb7-WqlEmdc1REivTQmgoEL9i12-gHBhvjtGMEnGVJs6IsEiS2Srnd3KlUQhGknfk62cF_DD_469uyl-WEcCcXlNCtDiGQe8yCOyP8v7Dp_NS1nj3d_27O5SPslK29qiydJir8oVtq3erewJuCjWlnaCbIJzH77pmcqe1ppL3lFvBzM3pTKHsuWQtnm2kw'
                    )
                  }
                  className="text-[#00288e] hover:underline font-mono text-[11px] mt-1 block font-medium"
                >
                  Switch sample photo
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions - Clear & Spacious */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-sans font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#00288e] hover:bg-[#001d68] text-white text-xs font-sans font-semibold shadow-sm hover:shadow transition-all active:scale-98 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">send</span>
              <span>
                {lang === 'kn' ? 'ಸಮಸ್ಯೆ ಸಲ್ಲಿಸಿ ಮತ್ತು ನೋಂದಾಯಿಸಿ' : 'Submit & Register Work Order'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
