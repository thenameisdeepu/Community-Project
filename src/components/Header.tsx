import React, { useState } from 'react';
import { Role, Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import { campusNotifications } from '../data/mockData';

interface HeaderProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onOpenReportModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenShortcuts: () => void;
  onSelectIssue: (id: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  lang,
  onLangChange,
  onOpenReportModal,
  searchQuery,
  onSearchChange,
  onOpenShortcuts,
  onSelectIssue,
  currentUser,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(campusNotifications);
  const t = translations[lang];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf8ff]/95 backdrop-blur-xl border-b border-[#c4c5d5]/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Logo & Campus Pilot Info */}
        <div className="flex items-center gap-3">
          <img
            alt="CommunityFix Logo"
            className="h-8 w-auto object-contain shrink-0"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UOdnNsR0qQTb6dCiNSQEfKZd0qefB16aOKOz6dsEokuqJZKz8cwmcjiSRyrzNicDZeyxzmMUe6AwPjvxmkY6rRlaq5PJmbq2up6NMZXoSU9bGZEhPxdGuh-lXFnDtn25yAb6JJTXvP_F1Ump2ZYytINOdft_YVZLRMVUWBmI-D0bFwRNyOIRx5zeQxASkm0mGPBbvvYQy3ntokF_oeRPrFmq21eKX-s2OnmemPNlI0JKRyd0TDg7Eu96g"
          />
          <div className="flex flex-col">
            <span className="font-sans font-bold text-lg text-[#00288e] tracking-tight leading-none">
              {t.appTitle}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] font-semibold text-[#006c4a] bg-[#82f5c1]/30 px-1.5 py-0.2 rounded uppercase tracking-wider">
                {t.pilotBadge}
              </span>
              <span className="font-sans text-xs text-[#444653] font-medium hidden sm:inline">
                {t.campusName}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Multi-Role Segmented Switcher */}
        <div className="hidden xl:flex items-center p-1 bg-[#eaedff] rounded-xl gap-1">
          <button
            type="button"
            onClick={() => onRoleChange('community')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              currentRole === 'community'
                ? 'bg-white text-[#00288e] shadow-sm font-semibold'
                : 'text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            {t.roleCommunity}
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-[#00288e] shadow-sm font-semibold'
                : 'text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            {t.roleAdmin}
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('maintenance')}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              currentRole === 'maintenance'
                ? 'bg-white text-[#00288e] shadow-sm font-semibold'
                : 'text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            {t.roleMaintenance}
          </button>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-56 xl:w-64 pl-8 pr-3 py-1.5 bg-[#f2f3ff] rounded-lg text-xs font-sans text-[#131b2e] placeholder:text-[#757684] focus:outline-none focus:ring-1 focus:ring-[#00288e] border border-transparent focus:border-[#00288e]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Report Issue Button */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1e40af] hover:bg-[#00288e] text-white rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>{t.reportIssueBtn}</span>
          </button>

          {/* Language Toggle Pill in Header */}
          <div className="flex items-center bg-[#eaedff] rounded-lg p-0.5" role="group">
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition-all ${
                lang === 'en'
                  ? 'bg-white text-[#00288e] shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLangChange('kn')}
              className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition-all ${
                lang === 'kn'
                  ? 'bg-white text-[#00288e] shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-[#444653] hover:text-[#131b2e] hover:bg-[#eaedff] rounded-lg transition-colors"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ba1a1a] text-white font-mono text-[9px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#c4c5d5]/40 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#eaedff]">
                  <span className="font-sans font-semibold text-xs text-[#131b2e]">
                    Campus Activity Alerts
                  </span>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[10px] font-mono text-[#00288e] hover:underline"
                  >
                    Mark read
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (item.actionId) onSelectIssue(item.actionId);
                        setShowNotifications(false);
                      }}
                      className={`p-2 rounded-lg text-left cursor-pointer transition-colors ${
                        item.unread ? 'bg-[#f2f3ff] hover:bg-[#eaedff]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-xs font-semibold text-[#131b2e]">
                          {item.title}
                        </span>
                        <span className="font-mono text-[10px] text-[#757684]">{item.time}</span>
                      </div>
                      <p className="font-sans text-[11px] text-[#444653] mt-0.5 leading-snug">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 py-1 rounded-lg hover:bg-[#eaedff] transition-colors border-l border-[#c4c5d5]/30 text-left"
            >
              <div className="hidden md:flex flex-col text-right">
                <span className="font-sans text-xs font-semibold text-[#131b2e]">
                  {currentUser?.name || 'Dr. A. Sharma'}
                </span>
                <span className="font-mono text-[10px] text-[#444653]">
                  {currentUser?.roleTitle || 'Student Coordinator'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#00288e] text-white flex items-center justify-center font-semibold text-xs shadow-sm">
                <span className="material-symbols-outlined text-[18px]">person</span>
              </div>
            </button>

            {/* Profile / Account Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#c4c5d5]/40 p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="pb-3 border-b border-[#eaedff]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-7 h-7 rounded-full bg-[#00288e] text-white flex items-center justify-center text-xs font-bold">
                      {(currentUser?.name || 'D')[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-sans text-xs font-bold text-[#131b2e] block truncate">
                        {currentUser?.name || 'Dr. A. Sharma'}
                      </span>
                      <span className="font-mono text-[10px] text-[#006c4a] font-semibold block">
                        Badge ID: {currentUser?.badgeId || 'GW-STU-8821'}
                      </span>
                    </div>
                  </div>
                  <p className="font-sans text-[11px] text-[#757684] truncate">
                    {currentUser?.email || 'a.sharma@greenwood.edu'}
                  </p>
                  <span className="font-sans text-[10px] text-[#444653] bg-[#f2f3ff] px-2 py-0.5 rounded mt-1.5 inline-block">
                    {currentUser?.department || 'Hostel Affairs & Student Welfare'}
                  </span>
                </div>

                <div className="py-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans text-[#444653] px-2 py-1.5 rounded bg-[#f2f3ff]/50">
                    <span>Active Campus Sector:</span>
                    <span className="font-mono font-semibold text-[#131b2e]">
                      {currentUser?.campusSector || 'Sector 4'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#eaedff] flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans text-[#ba1a1a] hover:bg-[#ffdad6] font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out to Campus Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
