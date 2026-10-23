import React, { useState } from 'react';
import { Role, Language, UserProfile, Issue } from '../types';
import { translations } from '../data/translations';
import { NeighbrlyLogo } from './NeighbrlyLogo';

interface HeaderProps {
  currentRole: Role;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onOpenReportModal?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenShortcuts: () => void;
  onSelectIssue: (id: string) => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onRoleChange?: (role: Role) => void;
  userIssues?: Issue[];
  onOpenAIChat?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  lang,
  onLangChange,
  searchQuery,
  onSearchChange,
  onOpenShortcuts,
  onSelectIssue,
  currentUser,
  onLogout,
  userIssues,
  onOpenAIChat,
  isSidebarCollapsed = false,
  onToggleSidebar,
  isDarkMode = false,
  onToggleTheme,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const t = translations[lang];

  // For resident: only show notifications about their complaints, NO verification/signoff alerts
  const residentIssueIds = userIssues ? userIssues.map((i) => i.id) : [];
  const activeNotifications = currentRole === 'community'
    ? notifications.filter((n) => {
        const titleLower = n.title.toLowerCase();
        const descLower = n.message.toLowerCase();
        // Remove verification / signoff notifications
        if (
          titleLower.includes('signoff') ||
          descLower.includes('signoff') ||
          titleLower.includes('verification') ||
          descLower.includes('verification')
        ) {
          return false;
        }
        // Only include if it matches one of the resident's issues
        if (n.actionId) {
          return residentIssueIds.includes(n.actionId);
        }
        return false;
      })
    : notifications;

  const unreadCount = activeNotifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf8ff]/95 backdrop-blur-xl border-b border-[#c4c5d5]/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Hamburger Sidebar Toggle & Neighbrly Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!isSidebarCollapsed}
              title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              className="p-1.5 sm:p-2 -ml-1 sm:ml-0 rounded-lg text-[#131b2e] hover:bg-[#eaedff] active:bg-[#dde1ff] hover:text-[#00288e] transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00288e]/30"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isSidebarCollapsed ? 'menu' : 'menu_open'}
              </span>
            </button>
          )}
          <div className="flex items-center text-left">
            <NeighbrlyLogo size="md" showText={true} tagline={t.appTagline} />
          </div>
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

          {/* Theme Mode Toggle (Light / Dark) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode (D)' : 'Switch to dark mode (D)'}
              className="p-2 rounded-lg text-[#444653] hover:text-[#00288e] hover:bg-[#eaedff] transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00288e]/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}

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
                    {currentRole === 'community'
                      ? (lang === 'kn' ? 'ನನ್ನ ದೂರುಗಳ ಅಪ್‌ಡೇಟ್‌ಗಳು' : 'My Complaint Alerts')
                      : 'Campus Activity Alerts'}
                  </span>
                  {activeNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] font-mono text-[#00288e] hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activeNotifications.length === 0 ? (
                    <div className="p-5 text-center">
                      <span className="material-symbols-outlined text-[24px] text-[#757684]/50 mb-1">
                        notifications_none
                      </span>
                      <p className="font-sans text-xs font-semibold text-[#131b2e]">
                        {lang === 'kn' ? 'ನಿಮ್ಮ ಅಧಿಸೂಚನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ' : 'Your notifications will appear here.'}
                      </p>
                      <p className="font-sans text-[11px] text-[#757684] mt-0.5">
                        {lang === 'kn'
                          ? 'ದೂರುಗಳ ನವೀಕರಣಗಳು ಮತ್ತು ರವಾನೆ ಸಂದೇಶಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.'
                          : 'Real-time dispatch alerts and resolution updates will show here.'}
                      </p>
                    </div>
                  ) : (
                    activeNotifications.map((item) => (
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
                    ))
                  )}
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
