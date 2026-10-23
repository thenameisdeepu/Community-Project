import React from 'react';
import { Language, Role } from '../types';
import { translations } from '../data/translations';

export type NavTab =
  | 'dashboard'
  | 'submit-issue'
  | 'issues-tracking'
  | 'community-ai'
  | 'admin-command-center'
  | 'maintenance-workspace'
  | 'impact-analytics'
  | 'accounts-management';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: Language;
  onLogout?: () => void;
  userRole?: Role;
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  lang,
  onLogout,
  userRole = 'community',
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const t = translations[lang];

  const allNavItems: Array<{ id: NavTab; label: string; icon: string; allowedRoles: Role[] }> = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: 'space_dashboard',
      allowedRoles: ['community', 'admin'],
    },
    {
      id: 'community-ai',
      label: 'CommUnity AI',
      icon: 'psychology',
      allowedRoles: ['community', 'admin', 'maintenance'],
    },
    {
      id: 'submit-issue',
      label: t.submitIssue,
      icon: 'add_task',
      allowedRoles: ['community'],
    },
    {
      id: 'issues-tracking',
      label: t.issuesTracking,
      icon: 'troubleshoot',
      allowedRoles: ['community', 'admin', 'maintenance'],
    },
    {
      id: 'admin-command-center',
      label: t.adminCommandCenter,
      icon: 'admin_panel_settings',
      allowedRoles: ['admin'],
    },
    {
      id: 'accounts-management',
      label: t.accountsManagement,
      icon: 'manage_accounts',
      allowedRoles: ['admin'],
    },
    {
      id: 'maintenance-workspace',
      label: t.maintenanceWorkspace,
      icon: 'engineering',
      allowedRoles: ['maintenance'],
    },
    {
      id: 'impact-analytics',
      label: t.impactAnalytics,
      icon: 'analytics',
      allowedRoles: ['admin'],
    },
  ];

  const navItems = allNavItems.filter((item) => item.allowedRoles.includes(userRole));

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#283044]/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        aria-label="Sidebar navigation"
        className={`fixed left-0 top-16 bottom-0 z-40 bg-[#f2f3ff] flex flex-col justify-between border-r border-[#c4c5d5]/30 shadow-[0_1px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out ${
          /* Mobile Drawer: slide in/out */
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop Width: collapsed vs expanded */
          isCollapsed ? 'lg:w-20 py-4 px-2' : 'w-72 max-w-[85vw] lg:w-64 xl:w-72 py-6 px-3'
        }`}
      >
        <div className="flex flex-col gap-4">
          {/* Mobile Drawer Header with Close Button */}
          <div className="lg:hidden flex items-center justify-between px-3 pb-3 border-b border-[#c4c5d5]/30">
            <span className="font-mono text-xs font-bold text-[#00288e] uppercase tracking-wider">
              {t.operationsRegistry}
            </span>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-[#757684] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors"
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Section Heading (Hidden when collapsed on desktop) */}
          {isCollapsed ? (
            <div className="hidden lg:block text-center py-1" title={t.operationsRegistry}>
              <span className="w-8 h-1 rounded-full bg-[#dae2fd] block mx-auto"></span>
            </div>
          ) : (
            <div className="hidden lg:block px-3">
              <span className="font-mono text-[10px] text-[#757684] tracking-wider uppercase font-semibold">
                {t.operationsRegistry}
              </span>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1.5" role="navigation">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <div key={item.id} className="relative group flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl transition-all cursor-pointer ${
                      isCollapsed
                        ? 'w-12 h-12 justify-center'
                        : 'w-full gap-3 px-3 py-2.5 text-left'
                    } text-sm font-sans ${
                      isActive
                        ? 'bg-[#e2e7ff] text-[#00288e] font-semibold shadow-xs ring-1 ring-[#00288e]/20'
                        : 'text-[#444653] hover:bg-[#eaedff] hover:text-[#131b2e]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined shrink-0 ${
                        isCollapsed ? 'text-[24px]' : 'text-[20px]'
                      } ${isActive ? 'text-[#00288e]' : 'text-[#757684]'}`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>

                  {/* Desktop Hover Tooltip when Collapsed */}
                  {isCollapsed && (
                    <div className="hidden lg:group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#131b2e] text-white text-xs font-sans font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100">
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout & Dispatch SLA Badge */}
        <div className="flex flex-col gap-2 pt-4 border-t border-[#c4c5d5]/30">
          {onLogout && (
            <div className="relative group flex justify-center">
              <button
                type="button"
                onClick={onLogout}
                aria-label="Sign Out to Login"
                title={isCollapsed ? 'Sign Out to Login' : undefined}
                className={`flex items-center rounded-xl transition-all cursor-pointer ${
                  isCollapsed ? 'w-12 h-12 justify-center' : 'w-full gap-2 px-3 py-2 text-left'
                } text-xs font-sans text-[#ba1a1a] hover:bg-[#ffdad6] hover:text-[#93000a]`}
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                {!isCollapsed && <span className="font-medium">Sign Out to Login</span>}
              </button>

              {/* Tooltip for logout when collapsed */}
              {isCollapsed && (
                <div className="hidden lg:group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#ba1a1a] text-white text-xs font-sans font-medium rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100">
                  <span>Sign Out to Login</span>
                </div>
              )}
            </div>
          )}

          {/* Dispatch Online SLA Status Card */}
          {isCollapsed ? (
            <div
              className="hidden lg:flex flex-col items-center justify-center p-2 rounded-xl bg-[#eaedff] text-[#006c4a] border border-[#dae2fd]/70 shadow-xs cursor-help"
              title={`${t.dispatchOnline} • 99.4% SLA\n${t.dispatchText}`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a] animate-pulse"></span>
              <span className="font-mono text-[9px] font-bold mt-1 text-[#006c4a]">99%</span>
            </div>
          ) : (
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
          )}
        </div>
      </aside>
    </>
  );
};
