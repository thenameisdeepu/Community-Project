import React from 'react';
import { Language } from '../types';
import { translations } from '../data/translations';

export type NavTab =
  | 'dashboard'
  | 'submit-issue'
  | 'issues-tracking'
  | 'admin-command-center'
  | 'maintenance-workspace'
  | 'impact-analytics';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: Language;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, lang, onLogout }) => {
  const t = translations[lang];

  const navItems: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: 'dashboard', label: t.dashboard, icon: 'space_dashboard' },
    { id: 'submit-issue', label: t.submitIssue, icon: 'add_task' },
    { id: 'issues-tracking', label: t.issuesTracking, icon: 'troubleshoot' },
    { id: 'admin-command-center', label: t.adminCommandCenter, icon: 'admin_panel_settings' },
    { id: 'maintenance-workspace', label: t.maintenanceWorkspace, icon: 'engineering' },
    { id: 'impact-analytics', label: t.impactAnalytics, icon: 'analytics' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 xl:w-72 bg-[#f2f3ff] z-40 flex flex-col justify-between py-6 border-r border-[#c4c5d5]/30 shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition-all">
      <div className="flex flex-col gap-6">
        <div className="px-6">
          <span className="font-mono text-[10px] text-[#757684] tracking-wider uppercase font-semibold">
            {t.operationsRegistry}
          </span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-sans transition-all text-left w-full ${
                  isActive
                    ? 'bg-[#e2e7ff] text-[#00288e] font-semibold shadow-xs'
                    : 'text-[#444653] hover:bg-[#eaedff] hover:text-[#131b2e]'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-[#00288e]' : 'text-[#757684]'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Dispatch Online SLA status badge & Logout */}
      <div className="px-4 flex flex-col gap-2">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="font-medium">Sign Out to Login</span>
          </button>
        )}

        <div className="bg-[#eaedff] p-3.5 rounded-xl flex flex-col gap-1 border border-[#dae2fd]/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#006c4a] font-semibold tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
              {t.dispatchOnline}
            </span>
            <span className="font-mono text-[10px] text-[#006c4a] bg-[#82f5c1]/40 px-1 rounded font-bold">
              99.4%
            </span>
          </div>
          <span className="font-sans text-xs text-[#444653] leading-snug">
            {t.dispatchText}
          </span>
        </div>
      </div>
    </aside>
  );
};
