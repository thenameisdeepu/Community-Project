import React, { useState, useEffect } from 'react';
import { Role, Language, Issue, UserProfile, CampusStats, TickerItem } from './types';
import { translations } from './data/translations';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { ResidentVerificationCard } from './components/ResidentVerificationCard';
import { IssuesTable } from './components/IssuesTable';
import { ActiveSectorMap } from './components/ActiveSectorMap';
import { CampusLiveTicker } from './components/CampusLiveTicker';
import { CampusResolutionIndex } from './components/CampusResolutionIndex';
import { CitizenRightsCard } from './components/CitizenRightsCard';
import { DetailDrawerModal } from './components/DetailDrawerModal';
import { SubmitIssueModal } from './components/SubmitIssueModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AdvisoryModal } from './components/AdvisoryModal';
import { AdminCommandCenterView } from './components/AdminCommandCenterView';
import { MaintenanceWorkspaceView } from './components/MaintenanceWorkspaceView';
import { ImpactAnalyticsView } from './components/ImpactAnalyticsView';
import { AccountsManagementView } from './components/AccountsManagementView';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { OpeningAnimation } from './components/OpeningAnimation';
import { CommunityAIAssistant } from './components/CommunityAIAssistant';
import { FloatingAIAssistantButton } from './components/FloatingAIAssistantButton';
import { api } from './services/api';

const emptyStats: CampusStats = {
  reportsLogged: 0,
  activeCrews: 0,
  resolvedAndVerified: 0,
  actionRequired: 0,
  onTimeSlaRate: null,
  avgFirstResponseMinutes: null,
  avgResolutionHours: null,
  citizenSatisfaction: null,
};

export default function App() {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState<boolean>(() => {
    return !sessionStorage.getItem('neighbrly_tab_intro_played');
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('neighbrly_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        // Invalidate old legacy demo accounts
        if (['usr-01', 'usr-02', 'usr-03', 'usr-04'].includes(u.id)) {
          localStorage.removeItem('neighbrly_user');
          return null;
        }
        return u;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [role, setRole] = useState<Role>(currentUser?.role || 'community');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<CampusStats>(emptyStats);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  const loadDataset = async () => {
    try {
      const [fetchedUsers, fetchedIssues, fetchedStats] = await Promise.all([
        api.getUsers(),
        api.getIssues(),
        api.getStats(),
      ]);
      if (fetchedUsers) {
        setUsers(fetchedUsers);
        if (
          currentUser &&
          !fetchedUsers.some(
            (u) =>
              (u.id || '').toLowerCase() === (currentUser.id || '').toLowerCase() ||
              (u.email || '').toLowerCase() === (currentUser.email || '').toLowerCase()
          )
        ) {
          localStorage.removeItem('neighbrly_user');
          setCurrentUser(null);
        }
      }
      if (fetchedIssues) setIssues(fetchedIssues);
      if (fetchedStats) setStats(fetchedStats);
    } catch (err) {
      console.warn('Dataset loading warning:', err);
    }
  };

  useEffect(() => {
    loadDataset();
  }, []);

  // Broadcast Alert visibility
  const [showBroadcast, setShowBroadcast] = useState(true);

  // Modals state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [verifyingIssue, setVerifyingIssue] = useState<Issue | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiPrefillData, setAiPrefillData] = useState<{
    title?: string;
    category?: string;
    location?: string;
    description?: string;
  } | null>(null);

  const t = translations[lang];

  const isTabAllowedForRole = (tab: NavTab, userRole: Role): boolean => {
    if (tab === 'community-ai') return true;
    if (userRole === 'community') {
      return ['dashboard', 'submit-issue', 'issues-tracking', 'community-ai'].includes(tab);
    }
    if (userRole === 'admin') {
      return [
        'admin-command-center',
        'accounts-management',
        'dashboard',
        'issues-tracking',
        'impact-analytics',
        'community-ai',
      ].includes(tab);
    }
    if (userRole === 'maintenance') {
      return ['maintenance-workspace', 'issues-tracking', 'community-ai'].includes(tab);
    }
    return false;
  };

  // Collapsible Sidebar & Mobile Drawer State (Persisted in localStorage)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neighbrly_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileDrawerOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('neighbrly_sidebar_collapsed', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  // Dark Mode Theme State (Persisted in localStorage, auto-syncs with system)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('neighbrly_theme');
      if (saved) return saved === 'dark';
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('neighbrly_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('neighbrly_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleTabChange = (newTab: NavTab) => {
    if (!currentUser) return;
    setIsMobileDrawerOpen(false);
    if (isTabAllowedForRole(newTab, currentUser.role)) {
      setCurrentTab(newTab);
    } else {
      // Direct forbidden navigation attempts to the restricted view
      setCurrentTab(newTab);
    }
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setRole(user.role);
    localStorage.setItem('neighbrly_user', JSON.stringify(user));
    if (user.role === 'admin') setCurrentTab('admin-command-center');
    else if (user.role === 'maintenance') setCurrentTab('maintenance-workspace');
    else setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('neighbrly_user');
  };

  // Keyboard accessibility listeners (N, V, L, D, Esc, Ctrl+B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B or Cmd+B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        handleToggleSidebar();
        return;
      }
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        setSelectedIssue(null);
        setIsSubmitModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsAdvisoryModalOpen(false);
        setIsMobileDrawerOpen(false);
      } else if (e.key === 'n' || e.key === 'N') {
        setIsSubmitModalOpen(true);
      } else if (e.key === 'l' || e.key === 'L') {
        setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
      } else if (e.key === 'd' || e.key === 'D') {
        handleToggleTheme();
      } else if (e.key === 'v' || e.key === 'V') {
        const el = document.getElementById('resident-verification-module');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          const target = issues.find((i) => i.status === 'Awaiting Signoff' || i.isNeedsVerification);
          if (target) setVerifyingIssue(target);
        }
      } else if (e.key === '?') {
        setIsShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [recentlyConfirmed, setRecentlyConfirmed] = useState<{ id: string; rating: number } | null>(null);

  // Handle resident updating / submitting rating for an issue
  const handleRateIssue = async (id: string, rating: number, comments?: string) => {
    const updates: Partial<Issue> = {
      resolutionRating: rating,
      residentComments: comments,
      workOrder: `Resident Approved (${rating}★)`,
      workOrderKn: `ನಿವಾಸಿ ಅನುಮೋದಿಸಲಾಗಿದೆ (${rating}★)`,
    };

    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    setSelectedIssue((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));

    try {
      await api.updateIssue(id, updates);
      const nextStats = await api.getStats();
      if (nextStats) setStats(nextStats);
    } catch (err) {
      console.warn('Failed to persist resident rating:', err);
    }
  };

  // Handle resident confirmation of resolution
  const handleConfirmResolution = async (id: string, rating: number, comments: string) => {
    const updates = {
      status: 'Resolved & Closed' as const,
      isNeedsVerification: false,
      resolutionRating: rating,
      residentComments: comments,
      workOrder: `Resident Approved (${rating}★)`,
      workOrderKn: `ನಿವಾಸಿ ಅನುಮೋದಿಸಲಾಗಿದೆ (${rating}★)`,
    };

    const reporterName = currentUser?.name || 'Resident';

    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updates,
            timeline: [
              ...item.timeline,
              {
                time: 'Just now',
                title: 'Resident Verification Approved',
                subtitle: `Signed off with ${rating}-star rating by ${reporterName}`,
                completed: true,
              },
            ],
          };
        }
        return item;
      })
    );

    api.updateIssue(id, updates);

    // Update stats
    setStats((prev) => {
      const nextStats = {
        ...prev,
        actionRequired: Math.max(0, prev.actionRequired - 1),
        resolvedAndVerified: prev.resolvedAndVerified + 1,
      };
      api.updateStats(nextStats);
      return nextStats;
    });

    // Add to Live Ticker
    setTickerItems((prev) => [
      {
        id: `tick-${Date.now()}`,
        type: 'resolved',
        icon: 'verified',
        statusLabel: 'RESOLVED & VERIFIED',
        timeAgo: 'Just now',
        title: 'Infrastructure repair verified safe',
        subtitle: `${reporterName} signoff • ${rating}★ score`,
      },
      ...prev,
    ]);

    setRecentlyConfirmed({ id, rating });
    setTimeout(() => {
      setRecentlyConfirmed((curr) => (curr?.id === id ? null : curr));
    }, 7000);
  };

  // Handle reopen
  const handleReopenIssue = async (id: string, reason: string) => {
    const updates = {
      status: 'In Progress' as const,
      isNeedsVerification: false,
      workOrder: 'Escalated for Crew Re-inspection',
      workOrderKn: 'ಮರು-ಪರಿಶೀಲನೆಗಾಗಿ ಸಿಬ್ಬಂದಿಗೆ ಹೆಚ್ಚಿಸಲಾಗಿದೆ',
    };

    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updates,
            timeline: [
              ...item.timeline,
              {
                time: 'Just now',
                title: 'Reopened by Resident',
                subtitle: `Reason: ${reason}`,
                active: true,
              },
            ],
          };
        }
        return item;
      })
    );

    api.updateIssue(id, updates);

    alert(`Ticket ${id} has been escalated back to the operations center for urgent remediation.`);
  };

  // Handle new issue submission
  const handleCreateIssue = async (newIssueData: Partial<Issue>) => {
    const nextNum = issues.length + 39;
    const newId = `CF-2026-0${nextNum}`;

    const fullIssue: Issue = {
      id: newId,
      category: newIssueData.category || 'Plumbing',
      categoryIcon: newIssueData.categoryIcon || 'build',
      title: newIssueData.title || 'Reported Campus Issue',
      location: newIssueData.location || 'Greenwood University Sector 4',
      zone: newIssueData.zone || 'Sector 4',
      severity: newIssueData.severity || 'Medium',
      status: 'In Progress',
      workOrder: 'WO #115 Dispatched to Duty Crew',
      workOrderKn: 'WO #115 ಕರ್ತವ್ಯ ಸಿಬ್ಬಂದಿಗೆ ರವಾನಿಸಲಾಗಿದೆ',
      progressPercent: 20,
      assignedCrew: 'Duty Rapid Response Crew',
      updatedTime: 'Just now',
      submittedTime: 'Just now',
      reportedBy: currentUser ? `${currentUser.name} (${currentUser.roleTitle})` : 'Resident Dr. A. Sharma',
      reportedByEmail: currentUser?.email || 'a.sharma@greenwood.edu',
      reportedById: currentUser?.id || 'usr-01',
      division: 'Campus Safety Division',
      description: newIssueData.description || 'Reported campus issue.',
      incidentPhoto: newIssueData.incidentPhoto,
      timeline: [
        {
          time: 'Just now',
          title: 'Reported by Resident',
          subtitle: 'Automatic intake into municipal SLA grid.',
          completed: true,
        },
        {
          time: 'Next step',
          title: 'Triage & Crew Deployment',
          subtitle: 'Target response within 15 minutes.',
          active: true,
        },
      ],
    };

    setIssues((prev) => [fullIssue, ...prev]);

    // Persist to backend dataset
    api.createIssue(fullIssue);

    setStats((prev) => {
      const nextStats = {
        ...prev,
        reportsLogged: prev.reportsLogged + 1,
        activeCrews: prev.activeCrews + 1,
      };
      api.updateStats(nextStats);
      return nextStats;
    });

    setTickerItems((prev) => [
      {
        id: `tick-${Date.now()}`,
        type: 'dispatch',
        icon: 'notification_important',
        statusLabel: 'DISPATCH IN FIELD',
        timeAgo: 'Just now',
        title: fullIssue.title,
        subtitle: `${fullIssue.location} • WO #115`,
      },
      ...prev,
    ]);
  };

  // Admin assign crew
  const handleAssignCrew = (issueId: string, crewName: string) => {
    const updates = {
      assignedCrew: crewName,
      status: 'In Progress' as const,
      workOrder: `Assigned to ${crewName}`,
    };
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            ...updates,
            timeline: [
              ...item.timeline,
              {
                time: 'Just now',
                title: `Dispatched: ${crewName}`,
                subtitle: 'Assigned via Administrator Command Center.',
                completed: true,
              },
            ],
          };
        }
        return item;
      })
    );
    api.updateIssue(issueId, updates);
    alert(`Technician ${crewName} successfully assigned to issue ${issueId}!`);
  };

  // Admin update status
  const handleUpdateStatus = (issueId: string, newStatus: Issue['status']) => {
    const updates = {
      status: newStatus,
      isNeedsVerification: newStatus === 'Awaiting Signoff',
    };
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            ...updates,
          };
        }
        return item;
      })
    );
    api.updateIssue(issueId, updates);
  };

  // Maintenance upload proof
  const handleUploadRepairProof = (issueId: string, proofUrl: string, note: string) => {
    const updates = {
      repairProofPhoto: proofUrl,
      crewNote: note,
      status: 'Awaiting Signoff' as const,
      isNeedsVerification: true,
      workOrder: 'Field Work Completed',
      workOrderKn: 'ಕ್ಷೇತ್ರ ಕಾರ್ಯ ಪೂರ್ಣಗೊಂಡಿದೆ (ಅನುಮೋದನೆ ಬಾಕಿ)',
    };
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            ...updates,
            timeline: [
              ...item.timeline,
              {
                time: 'Just now',
                title: 'Repair Proof Uploaded by Crew',
                subtitle: note,
                completed: true,
              },
              {
                time: 'Next step',
                title: 'Resident Verification Required',
                active: true,
              },
            ],
          };
        }
        return item;
      })
    );
    api.updateIssue(issueId, updates);
  };

  // Remove all complaints from dataset and local state
  const handleRemoveAllComplaints = async () => {
    setIssues([]);
    setSelectedIssue(null);
    setVerifyingIssue(null);
    await api.deleteAllIssues();
  };

  // Delete a single complaint
  const handleDeleteIssue = async (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
    if (selectedIssue?.id === id) setSelectedIssue(null);
    if (verifyingIssue?.id === id) setVerifyingIssue(null);
    await api.deleteIssue(id);
  };

  // Permanently delete a user account from backend and authoritative React state (Strict confirmation-first)
  const handleDeleteUser = async (id: string, email?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanId = (id || '').trim().toLowerCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Commit deletion on authoritative backend database FIRST
    const res = await api.deleteUser(id, email);

    if (!res.success) {
      throw new Error(res.message || 'Backend deletion failed. Account was not removed.');
    }

    // 2. ONLY remove from UI state AFTER successful backend confirmation
    setUsers((prev) =>
      prev.filter((u) => {
        const uId = (u.id || '').trim().toLowerCase();
        const uEmail = (u.email || '').trim().toLowerCase();
        return uId !== cleanId && (!cleanEmail || uEmail !== cleanEmail);
      })
    );

    // 3. If currently logged in as this user, revoke session immediately
    if (
      currentUser &&
      (((currentUser.id || '').toLowerCase() === cleanId) ||
        (cleanEmail && (currentUser.email || '').toLowerCase() === cleanEmail))
    ) {
      localStorage.removeItem('neighbrly_user');
      setCurrentUser(null);
    }

    // 4. Invalidate and re-synchronize authoritative dataset from disk
    await loadDataset();
    return res;
  };

  // Determines whether an issue belongs to the given user for private resident access
  const isMyComplaint = (issue: Issue, user: UserProfile | null): boolean => {
    if (!user) return false;
    // Administrator sees all complaints across the entire system
    if (user.role === 'admin') return true;

    // For community residents: strictly filter to complaints reported by this resident
    if (issue.reportedByEmail && user.email) {
      if (issue.reportedByEmail.toLowerCase() === user.email.toLowerCase()) return true;
    }
    if (issue.reportedById && user.id) {
      if (issue.reportedById === user.id) return true;
    }
    if (issue.reportedBy && user.name) {
      const rep = issue.reportedBy.toLowerCase();
      const uName = user.name.toLowerCase();
      if (rep.includes(uName) || uName.includes(rep)) return true;
      const nameParts = uName.split(' ').filter((p) => p.length >= 3);
      if (nameParts.some((part) => rep.includes(part))) return true;
    }
    return false;
  };

  // Scoped issues: residents ONLY see their own complaints; administrators see all
  const userScopedIssues = currentUser?.role === 'community'
    ? issues.filter((i) => isMyComplaint(i, currentUser))
    : issues;

  // Filter issues by search within user's scoped access
  const visibleIssues = userScopedIssues.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.zone.toLowerCase().includes(q)
    );
  });

  // Issue awaiting verification within resident scope (Residents only)
  const pendingVerificationIssue =
    currentUser?.role === 'community'
      ? userScopedIssues.find((i) => i.status === 'Awaiting Signoff' || i.isNeedsVerification)
      : undefined;

  // Verification issue fallback
  const verificationIssue =
    pendingVerificationIssue ||
    issues.find((i) => i.id === 'CF-2026-038' || i.isNeedsVerification) ||
    issues[0];

  // If user is not logged in, show the civic access login page
  if (!currentUser) {
    return (
      <>
        {showOpeningAnimation && (
          <OpeningAnimation
            lang={lang}
            onComplete={() => {
              sessionStorage.setItem('neighbrly_tab_intro_played', 'true');
              setShowOpeningAnimation(false);
            }}
          />
        )}
        <LoginPage
          onLogin={handleLogin}
          lang={lang}
          onLangChange={setLang}
          users={users}
          onRefreshUsers={loadDataset}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      </>
    );
  }

  return (
    <div className="bg-[#faf8ff] font-sans text-[#131b2e] min-h-screen flex flex-col selection:bg-[#dde1ff] selection:text-[#001453]">
      {showOpeningAnimation && (
        <OpeningAnimation
          lang={lang}
          onComplete={() => {
            sessionStorage.setItem('neighbrly_tab_intro_played', 'true');
            setShowOpeningAnimation(false);
          }}
        />
      )}

      {/* Fixed Header with Sidebar Toggle */}
      <Header
        currentRole={currentUser.role}
        lang={lang}
        onLangChange={setLang}
        onOpenReportModal={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onSelectIssue={(id) => {
          const match = userScopedIssues.find((i) => i.id === id);
          if (match) {
            setSelectedIssue(match);
          } else {
            alert(
              lang === 'kn'
                ? 'ಗೌಪ್ಯತೆ ರಕ್ಷಣೆ: ಈ ದೂರು ಬೇರೆ ನಿವಾಸಿಗೆ ಸೇರಿದ್ದು ಮತ್ತು ಗೌಪ್ಯವಾಗಿದೆ.'
                : 'Confidentiality Protection: This complaint belongs to another resident and is restricted.'
            );
          }
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        userIssues={userScopedIssues}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Fixed Collapsible Sidebar & Mobile Slide-out Drawer */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        lang={lang}
        onLogout={handleLogout}
        userRole={currentUser.role}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content Area: Dynamic Responsive Padding */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 xl:pl-72'
        }`}
      >
        <main className="relative pt-16 flex-1 w-full px-4 sm:px-6 xl:px-8 bg-[#faf8ff]">
          <div className="flex flex-col w-full pb-10 max-w-[1600px] mx-auto">
            {/* Top Broadcast Alert: Civic Notice Banner */}
            {showBroadcast && (
              <div
                className="w-full mb-4 mt-4 transition-all duration-300 ease-out"
                id="broadcast-alert"
              >
                <div className="bg-[#ffdcc3] dark:bg-[#341b08] text-[#2f1500] dark:text-[#ffedd5] px-4 py-2.5 rounded-xl shadow-xs flex items-start sm:items-center justify-between gap-3 border border-[#ffb77d]/40 dark:border-[#7c3f00]/60">
                  <div className="flex items-center gap-3">
                    <span className="flex p-1 rounded-lg bg-[#532a00] dark:bg-[#78350f] text-white shrink-0">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#532a00] dark:text-[#fed7aa]">
                        {t.campusBroadcast}
                      </span>
                      <span className="hidden sm:inline text-[#743d00] dark:text-[#fdba74]">•</span>
                      <p className="font-sans text-xs sm:text-sm font-medium text-[#2f1500] dark:text-[#ffedd5]">
                        <strong className="font-bold">Urgent:</strong>{' '}
                        {t.broadcastNotice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAdvisoryModalOpen(true)}
                      className="hidden md:inline-flex px-2 py-0.5 rounded font-mono text-xs text-[#532a00] dark:text-[#fed7aa] hover:bg-[#532a00]/10 dark:hover:bg-[#fed7aa]/10 transition-colors font-semibold"
                    >
                      {t.viewAdvisory}
                    </button>
                    <button
                      type="button"
                      aria-label="Dismiss alert"
                      onClick={() => setShowBroadcast(false)}
                      className="p-1 rounded text-[#532a00] dark:text-[#fed7aa] hover:bg-[#532a00]/15 dark:hover:bg-[#fed7aa]/15 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Access Denied Barrier if unauthorized tab is navigated to */}
            {!isTabAllowedForRole(currentTab, currentUser.role) && (
              <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl p-8 border border-[#ba1a1a]/30 shadow-lg text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[34px]">shield_lock</span>
                </div>
                <h2 className="font-sans font-bold text-xl text-[#131b2e] mb-2">
                  {t.accessDeniedTitle}
                </h2>
                <p className="font-sans text-xs text-[#757684] mb-4">
                  {t.accessDeniedDesc}
                </p>
                <div className="p-3 bg-[#f2f3ff] rounded-xl mb-6 text-xs font-mono text-[#444653]">
                  <span className="text-[#757684] block mb-0.5">{t.accessDeniedLoggedAs}</span>
                  <strong className="text-[#00288e]">{currentUser.name}</strong> • {currentUser.roleTitle}
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentUser.role === 'admin') setCurrentTab('admin-command-center');
                      else if (currentUser.role === 'maintenance') setCurrentTab('maintenance-workspace');
                      else setCurrentTab('dashboard');
                    }}
                    className="px-4 py-2 bg-[#00288e] text-white rounded-lg text-xs font-semibold hover:bg-[#1e40af]"
                  >
                    {t.returnToAllowed}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 bg-[#f2f3ff] text-[#ba1a1a] rounded-lg text-xs font-semibold hover:bg-[#ffdad6]"
                  >
                    {t.switchAccount}
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DASHBOARD (The primary screen matching screenshot!) */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'dashboard' && (
              <>
                {/* Hero Header & Quick Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 mt-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs uppercase tracking-widest text-[#006c4a] font-bold">
                        {t.verifiedResidentHub}
                      </span>
                      <span className="text-[#c4c5d5]">•</span>
                      <span className="font-sans text-xs text-[#444653]">
                        {t.hubSubtext}
                      </span>
                    </div>
                    <h1 className="font-sans text-2xl sm:text-3xl font-bold text-[#131b2e] tracking-tight">
                      {t.heroTitle}
                    </h1>
                    <p className="font-sans text-xs sm:text-sm text-[#444653] max-w-2xl mt-0.5">
                      {t.heroDescription}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Kannada/English quick toggle */}
                    <div className="inline-flex items-center bg-[#e2e7ff] rounded-lg p-0.5" role="group">
                      <button
                        type="button"
                        onClick={() => setLang('en')}
                        className={`px-2.5 py-1 rounded font-mono text-xs transition-all ${
                          lang === 'en'
                            ? 'bg-white text-[#00288e] shadow-xs font-bold'
                            : 'text-[#444653] hover:text-[#131b2e]'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setLang('kn')}
                        className={`px-2.5 py-1 rounded font-mono text-xs transition-all ${
                          lang === 'kn'
                            ? 'bg-white text-[#00288e] shadow-xs font-bold'
                            : 'text-[#444653] hover:text-[#131b2e]'
                        }`}
                      >
                        ಕನ್ನಡ
                      </button>
                    </div>

                    {/* Shortcut key hint button */}
                    <button
                      type="button"
                      onClick={() => setIsShortcutsModalOpen(true)}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 bg-[#eaedff] hover:bg-[#e2e7ff] rounded-lg text-[#444653] hover:text-[#00288e] transition-colors text-xs font-sans shadow-xs border border-[#c4c5d5]/30"
                      title="View Keyboard Navigation Aids"
                    >
                      <span className="material-symbols-outlined text-[16px]">keyboard</span>
                      <span className="font-mono text-xs">{t.hotkeysBtn}</span>
                    </button>

                    {/* Primary Action CTA (Community residents only) */}
                    {currentUser.role === 'community' && (
                      <button
                        type="button"
                        onClick={() => setIsSubmitModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] hover:bg-[#00288e] text-white rounded-lg font-sans text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-98"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        <span>{t.reportNewIssueBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metric Overview Cards: Tailored for Resident complaints vs Admin operations */}
                {currentUser.role === 'community' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {/* Card 1: My Total Complaints */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#757684] uppercase tracking-wider font-semibold">
                          {lang === 'kn' ? 'ನನ್ನ ದಾಖಲಾದ ದೂರುಗಳು' : 'My Filed Complaints'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#00288e]">
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-sans text-3xl font-bold text-[#131b2e]">
                          {userScopedIssues.length}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[#757684] font-mono text-[10px]">
                          <span className="text-[#006c4a] font-bold">100%</span>
                          <span>{lang === 'kn' ? 'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೀಮಿತ' : 'Isolated to your account'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Complaints Being Remediated */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#757684] uppercase tracking-wider font-semibold">
                          {lang === 'kn' ? 'ಪರಿಹಾರ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿರುವ ದೂರುಗಳು' : 'Complaints In Progress'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#1e40af]">
                          <span className="material-symbols-outlined text-[18px]">engineering</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-sans text-3xl font-bold text-[#00288e]">
                          0{userScopedIssues.filter((i) => i.status === 'In Progress' || i.status === 'Scheduled' || i.status === 'Reported').length}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[#757684] font-mono text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                          <span>{lang === 'kn' ? 'ಸಿಬ್ಬಂದಿ ಕಾರ್ಯಪ್ರವೃತ್ತರಾಗಿದ್ದಾರೆ' : 'Active Duty Dispatch'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Resolved Complaints */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#757684] uppercase tracking-wider font-semibold">
                          {lang === 'kn' ? 'ಪರಿಹರಿಸಲಾದ ದೂರುಗಳು' : 'Resolved Complaints'}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#82f5c1]/30 flex items-center justify-center text-[#006c4a]">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-sans text-3xl font-bold text-[#006c4a]">
                          {userScopedIssues.filter((i) => i.status === 'Resolved & Closed').length}
                        </span>
                        <div className="flex items-center gap-1 mt-1 font-mono text-[10px] text-[#006c4a]">
                          <span className="material-symbols-outlined text-[13px]">thumb_up</span>
                          <span>{lang === 'kn' ? 'ಮುಕ್ತಾಯಗೊಂಡಿದೆ' : 'Closed & Verified'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Card 1: Total */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#757684] uppercase tracking-wider font-semibold">
                          {t.reportsLogged}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#00288e]">
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-sans text-3xl font-bold text-[#131b2e]">
                          {stats.reportsLogged}
                        </span>
                        <div className="flex items-center gap-1 mt-1 text-[#757684] font-mono text-[10px]">
                          <span className="text-[#006c4a] font-bold">
                            {stats.reportsLogged > 0
                              ? stats.onTimeSlaRate != null
                                ? `${stats.onTimeSlaRate}%`
                                : '100%'
                              : '0%'}
                          </span>
                          <span>{t.indexedToSla}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: In Progress */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#757684] uppercase tracking-wider font-semibold">
                          {t.activeCrews}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#e2e7ff] flex items-center justify-center text-[#1e40af]">
                          <span className="material-symbols-outlined text-[18px]">engineering</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-sans text-3xl font-bold text-[#00288e]">
                          {stats.activeCrews}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1 text-[#757684] font-mono text-[10px]">
                          <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
                          <span>{t.fieldTechDeployed}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Resolved & Verified */}
                    <div className="bg-white rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#757684] uppercase tracking-wider font-semibold">
                          {t.resolvedVerified}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-[#82f5c1]/30 flex items-center justify-center text-[#006c4a]">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-sans text-3xl font-bold text-[#006c4a]">
                          {stats.resolvedAndVerified}
                        </span>
                        <div className="flex items-center gap-1 mt-1 font-mono text-[10px] text-[#006c4a]">
                          <span className="material-symbols-outlined text-[13px]">thumb_up</span>
                          <span>{t.communityValidated}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 4: Action Required (Awaiting Resident) */}
                    <div className="bg-[#e2e7ff] rounded-xl p-4 shadow-xs border border-[#c4c5d5]/30 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                      <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-[#ffdcc3]/40 pointer-events-none"></div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[#6e3900] uppercase tracking-wider font-bold">
                          {t.actionRequired}
                        </span>
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ba1a1a] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ba1a1a]"></span>
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-sans text-3xl font-bold text-[#ba1a1a]">
                            {stats.actionRequired}
                          </span>
                          <span className="font-mono text-[10px] text-[#444653]">
                            {t.awaitingSignoff}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const target = pendingVerificationIssue || verificationIssue;
                            if (target) setVerifyingIssue(target);
                          }}
                          className="inline-flex items-center gap-1 mt-1 font-mono text-[11px] text-[#00288e] font-bold hover:underline cursor-pointer"
                        >
                          <span>{t.reviewProofNow}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Priority Attention Banner: Resident Verification Module (Shown when an issue awaits signoff) */}
                {pendingVerificationIssue ? (
                  <ResidentVerificationCard
                    key={pendingVerificationIssue.id}
                    issue={pendingVerificationIssue}
                    lang={lang}
                    onConfirmResolution={handleConfirmResolution}
                    onReopenIssue={handleReopenIssue}
                  />
                ) : recentlyConfirmed ? (
                  <div className="mb-6 p-4 bg-[#82f5c1]/25 border border-[#006c4a]/40 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-[#006c4a] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[24px] fill-1">verified</span>
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#006c4a] uppercase tracking-wider block">
                            {lang === 'kn' ? 'ಪರಿಶೀಲನೆ ಯಶಸ್ವಿಯಾಗಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ' : 'Civic Signoff Recorded • Verified & Closed'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[14px] text-amber-500 fill-1">star</span>
                            <span>{recentlyConfirmed.rating}/5</span>
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#131b2e] font-semibold mt-0.5">
                          {lang === 'kn'
                            ? `ದೂರು #${recentlyConfirmed.id} ಪರಿಹಾರವನ್ನು ${recentlyConfirmed.rating}-ಸ್ಟಾರ್ ರೇಟಿಂಗ್‌ನೊಂದಿಗೆ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಸಿಸ್ಟಂನಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ.`
                            : `Complaint #${recentlyConfirmed.id} resolution verified with ${recentlyConfirmed.rating}-star resident score and logged in CommUnity Registry.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecentlyConfirmed(null)}
                      className="px-3 py-1.5 rounded-lg bg-white text-[#006c4a] font-sans text-xs font-semibold hover:bg-[#82f5c1]/30 transition-colors cursor-pointer border border-[#006c4a]/30 shadow-2xs"
                    >
                      {lang === 'kn' ? 'ಮುಚ್ಚಿ' : 'Dismiss'}
                    </button>
                  </div>
                ) : null}

                {/* Split Panel: Issues Table & Community Live Transparency Hub */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* Left Column (8 cols): My Reported Issues Table & Map */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    <IssuesTable
                      issues={visibleIssues}
                      lang={lang}
                      onOpenDetail={(issue) => setSelectedIssue(issue)}
                      onReviewIssue={(issue) => setVerifyingIssue(issue)}
                      onJumpToVerification={(issue) => {
                        if (issue) {
                          setVerifyingIssue(issue);
                        } else {
                          const el = document.getElementById('resident-verification-module');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth' });
                          } else if (pendingVerificationIssue) {
                            setVerifyingIssue(pendingVerificationIssue);
                          }
                        }
                      }}
                      userRole={currentUser.role}
                      onOpenReportModal={() => setIsSubmitModalOpen(true)}
                    />

                    {/* Active Sector Map Card */}
                    <ActiveSectorMap
                      lang={lang}
                      issues={visibleIssues}
                      userRole={currentUser.role}
                      onSelectZone={(zone) => {
                        setSearchQuery(zone);
                      }}
                      onSelectIssue={(issue) => setSelectedIssue(issue)}
                    />
                  </div>

                  {/* Right Column (4 cols): Live Ticker, SLA Index & Citizen Rights */}
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    <CampusLiveTicker items={tickerItems} lang={lang} />
                    <CampusResolutionIndex stats={stats} lang={lang} />
                    <CitizenRightsCard lang={lang} />
                  </div>
                </div>
              </>
            )}

            {/* TAB CONTENT: COMMUNITY AI */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'community-ai' && (
              <div className="max-w-4xl mx-auto w-full py-4">
                <div className="bg-white rounded-2xl border border-[#c4c5d5]/30 shadow-sm p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#eaedff]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00288e] to-[#4f378b] text-white flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[28px] text-[#ffdcc3]">
                          psychology
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-sans text-xl font-bold text-[#131b2e]">
                            CommUnity AI Assistant
                          </h2>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#82f5c1]/25 text-[#006c4a] border border-[#006c4a]/30">
                            Gemini 3.8 Flash
                          </span>
                        </div>
                        <p className="font-sans text-xs text-[#757684]">
                          "See It. Report It. Solve It." • Intelligent Community Problem Triage
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAIChatOpen(true)}
                      className="px-4 py-2.5 bg-[#00288e] hover:bg-[#001d68] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      <span>Launch Interactive Assistant</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#00288e]/15">
                      <div className="flex items-center gap-2 text-[#00288e] font-bold text-xs mb-1">
                        <span className="material-symbols-outlined text-[18px]">translate</span>
                        <span>Natural Language Intake</span>
                      </div>
                      <p className="text-[11px] text-[#444653]">
                        Describe problems in ordinary words. CommUnity AI extracts title, location, category, and urgency.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#00288e]/15">
                      <div className="flex items-center gap-2 text-[#00288e] font-bold text-xs mb-1">
                        <span className="material-symbols-outlined text-[18px]">priority_high</span>
                        <span>P1–P4 Urgency Rules</span>
                      </div>
                      <p className="text-[11px] text-[#444653]">
                        Transparent, objective priority criteria emphasizing immediate safety threats over convenience.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#f2f3ff] border border-[#00288e]/15">
                      <div className="flex items-center gap-2 text-[#00288e] font-bold text-xs mb-1">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        <span>Confidential & Safe</span>
                      </div>
                      <p className="text-[11px] text-[#444653]">
                        Strict role-based privacy protection. Only verified platform data is used for status claims.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#eaedff] to-white dark:from-[#1b2638] dark:to-[#151e2e] border border-[#c4c5d5]/40 dark:border-[#2a3648] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="text-xs text-[#131b2e] dark:text-[#f1f5f9]">
                      <span className="font-bold text-[#00288e] dark:text-[#60a5fa]">Ready to report or inspect an issue?</span>{' '}
                      <span className="text-[#444653] dark:text-[#cbd5e1]">Open the full interactive conversation drawer.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAIChatOpen(true)}
                      className="px-4 py-2 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      Open CommUnity AI Chat
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SUBMIT ISSUE */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'submit-issue' && (
              <div className="max-w-2xl mx-auto w-full py-4">
                <div className="bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-sm">
                  <h2 className="font-sans text-xl font-bold text-[#131b2e] mb-1">
                    Direct Incident Registry
                  </h2>
                  <p className="font-sans text-xs text-[#757684] mb-6">
                    Log new infrastructure repairs directly into Greenwood University pilot dispatch grid.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-4 py-2.5 bg-[#1e40af] text-white rounded-lg text-xs font-semibold hover:bg-[#00288e]"
                  >
                    Launch Interactive Intake Form
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ISSUES & TRACKING */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'issues-tracking' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
                      {t.issuesLedgerTitle}
                    </h2>
                    <p className="font-sans text-xs text-[#757684] mt-0.5">
                      {t.issuesLedgerDesc}
                    </p>
                  </div>
                  {currentUser.role === 'community' && (
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="px-4 py-2 bg-[#1e40af] text-white rounded-lg text-xs font-semibold hover:bg-[#00288e] flex items-center gap-1.5 shrink-0"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_circle</span>
                      {t.reportIssueBtn}
                    </button>
                  )}
                </div>

                <IssuesTable
                  issues={visibleIssues}
                  lang={lang}
                  onOpenDetail={(issue) => setSelectedIssue(issue)}
                  onReviewIssue={(issue) => setVerifyingIssue(issue)}
                  onJumpToVerification={(issue) => {
                    if (issue) {
                      setVerifyingIssue(issue);
                    } else if (pendingVerificationIssue) {
                      setVerifyingIssue(pendingVerificationIssue);
                    }
                  }}
                  userRole={currentUser.role}
                  onOpenReportModal={() => setIsSubmitModalOpen(true)}
                />
              </div>
            )}

            {/* TAB CONTENT: ADMIN COMMAND CENTER */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'admin-command-center' && (
              <AdminCommandCenterView
                issues={issues}
                users={users}
                onAssignCrew={handleAssignCrew}
                onUpdateStatus={handleUpdateStatus}
                onRemoveAllComplaints={handleRemoveAllComplaints}
                onDeleteIssue={handleDeleteIssue}
                onNavigateToAccounts={() => setCurrentTab('accounts-management')}
                onDeleteUser={handleDeleteUser}
                lang={lang}
              />
            )}

            {/* TAB CONTENT: ACCOUNTS & DATASET MANAGEMENT */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'accounts-management' && (
              <AccountsManagementView
                users={users}
                onRefreshUsers={loadDataset}
                onDeleteUser={handleDeleteUser}
                onSelectUserToLogin={handleLogin}
                lang={lang}
              />
            )}

            {/* TAB CONTENT: MAINTENANCE WORKSPACE */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'maintenance-workspace' && (
              <MaintenanceWorkspaceView
                issues={issues}
                onUploadRepairProof={handleUploadRepairProof}
                onRemoveAllComplaints={handleRemoveAllComplaints}
                onDeleteIssue={handleDeleteIssue}
                lang={lang}
              />
            )}

            {/* TAB CONTENT: IMPACT & ANALYTICS */}
            {isTabAllowedForRole(currentTab, currentUser.role) && currentTab === 'impact-analytics' && (
              <ImpactAnalyticsView stats={stats} issues={issues} lang={lang} />
            )}
          </div>
        </main>

        {/* Global Footer */}
        <Footer lang={lang} onLangChange={setLang} />
      </div>

      {/* Floating CommUnity AI Quick Button (Scroll-Aware, Collapsible, & Pinnable) */}
      <FloatingAIAssistantButton
        onClick={() => setIsAIChatOpen(true)}
        isOpen={isAIChatOpen}
        currentTab={currentTab}
        lang={lang}
      />

      {/* Modals */}
      <DetailDrawerModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        lang={lang}
        userRole={currentUser.role}
        onUploadRepairProof={handleUploadRepairProof}
        onDeleteIssue={handleDeleteIssue}
        onRateIssue={handleRateIssue}
        onReviewAndSignoff={(issue) => {
          setSelectedIssue(null);
          setVerifyingIssue(issue);
        }}
      />

      {/* Verification & Citizen Sign-off Modal */}
      {verifyingIssue && (
        <ResidentVerificationCard
          key={verifyingIssue.id}
          issue={verifyingIssue}
          lang={lang}
          isModal={true}
          onClose={() => setVerifyingIssue(null)}
          onConfirmResolution={(id, rating, comments) => {
            handleConfirmResolution(id, rating, comments);
            setTimeout(() => {
              setVerifyingIssue((curr) => (curr?.id === id ? null : curr));
            }, 3500);
          }}
          onReopenIssue={(id, reason) => {
            handleReopenIssue(id, reason);
            setVerifyingIssue(null);
          }}
        />
      )}

      <SubmitIssueModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setAiPrefillData(null);
        }}
        onSubmit={handleCreateIssue}
        lang={lang}
        initialData={aiPrefillData}
      />

      <CommunityAIAssistant
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        lang={lang}
        currentUser={currentUser}
        userRole={currentUser.role}
        onIssueCreated={(newIssue) => {
          setIssues((prev) => [newIssue, ...prev]);
          setStats((prev) => ({
            ...prev,
            reportsLogged: prev.reportsLogged + 1,
          }));
        }}
        onOpenReportModalWithData={(prefill) => {
          setAiPrefillData(prefill);
          setIsSubmitModalOpen(true);
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <AdvisoryModal
        isOpen={isAdvisoryModalOpen}
        onClose={() => setIsAdvisoryModalOpen(false)}
      />
    </div>
  );
}
