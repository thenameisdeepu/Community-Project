import React, { useState, useEffect } from 'react';
import { Role, Language, Issue, UserProfile } from './types';
import { initialIssues, initialStats, initialTickerItems, demoUsers } from './data/mockData';
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
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('communityfix_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Show the login page directly for user inspection
  });

  const [role, setRole] = useState<Role>(currentUser?.role || 'community');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [stats, setStats] = useState(initialStats);
  const [tickerItems, setTickerItems] = useState(initialTickerItems);

  // Broadcast Alert visibility
  const [showBroadcast, setShowBroadcast] = useState(true);

  // Modals state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);

  const t = translations[lang];

  // Sync role with navigation tab
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'community') setCurrentTab('dashboard');
    if (newRole === 'admin') setCurrentTab('admin-command-center');
    if (newRole === 'maintenance') setCurrentTab('maintenance-workspace');
  };

  const handleTabChange = (newTab: NavTab) => {
    setCurrentTab(newTab);
    if (newTab === 'admin-command-center') setRole('admin');
    else if (newTab === 'maintenance-workspace') setRole('maintenance');
    else setRole('community');
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('communityfix_user', JSON.stringify(user));
    handleRoleChange(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('communityfix_user');
  };

  // Keyboard accessibility listeners (N, V, L, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        setSelectedIssue(null);
        setIsSubmitModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsAdvisoryModalOpen(false);
      } else if (e.key === 'n' || e.key === 'N') {
        setIsSubmitModalOpen(true);
      } else if (e.key === 'l' || e.key === 'L') {
        setLang((prev) => (prev === 'en' ? 'kn' : 'en'));
      } else if (e.key === 'v' || e.key === 'V') {
        const el = document.getElementById('resident-verification-module');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === '?') {
        setIsShortcutsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle resident confirmation of CF-2026-038
  const handleConfirmResolution = (id: string, rating: number, comments: string) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'Resolved & Closed',
            isNeedsVerification: false,
            resolutionRating: rating,
            residentComments: comments,
            workOrder: `Resident Approved (${rating}★)`,
            timeline: [
              ...item.timeline,
              {
                time: 'Just now',
                title: 'Resident Verification Approved',
                subtitle: `Signed off with ${rating}-star rating by Dr. A. Sharma`,
                completed: true,
              },
            ],
          };
        }
        return item;
      })
    );

    // Update stats
    setStats((prev) => ({
      ...prev,
      actionRequired: Math.max(0, prev.actionRequired - 1),
      resolvedAndVerified: prev.resolvedAndVerified + 1,
    }));

    // Add to Live Ticker
    setTickerItems((prev) => [
      {
        id: `tick-${Date.now()}`,
        type: 'resolved',
        icon: 'verified',
        statusLabel: 'RESOLVED & VERIFIED',
        timeAgo: 'Just now',
        title: 'Security streetlight verified safe',
        subtitle: `Resident Dr. Sharma signoff • ${rating}★ score`,
      },
      ...prev,
    ]);
  };

  // Handle reopen
  const handleReopenIssue = (id: string, reason: string) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'In Progress',
            isNeedsVerification: false,
            workOrder: 'Escalated for Crew Re-inspection',
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

    alert(`Ticket ${id} has been escalated back to the operations center for urgent remediation.`);
  };

  // Handle new issue submission
  const handleCreateIssue = (newIssueData: Partial<Issue>) => {
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
      progressPercent: 20,
      assignedCrew: 'Duty Rapid Response Crew',
      updatedTime: 'Just now',
      submittedTime: 'Just now',
      reportedBy: 'Dr. A. Sharma (Student Coordinator)',
      division: 'Campus Safety Division',
      description: newIssueData.description || 'Reported campus issue.',
      incidentPhoto: newIssueData.incidentPhoto,
      timeline: [
        {
          time: 'Just now',
          title: 'Reported by Resident Dr. Sharma',
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

    setStats((prev) => ({
      ...prev,
      reportsLogged: prev.reportsLogged + 1,
      activeCrews: prev.activeCrews + 1,
    }));

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
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            assignedCrew: crewName,
            status: 'In Progress',
            workOrder: `Assigned to ${crewName}`,
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
    alert(`Technician ${crewName} successfully assigned to issue ${issueId}!`);
  };

  // Admin update status
  const handleUpdateStatus = (issueId: string, newStatus: Issue['status']) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            status: newStatus,
            isNeedsVerification: newStatus === 'Awaiting Signoff',
          };
        }
        return item;
      })
    );
  };

  // Maintenance upload proof
  const handleUploadRepairProof = (issueId: string, proofUrl: string, note: string) => {
    setIssues((prev) =>
      prev.map((item) => {
        if (item.id === issueId) {
          return {
            ...item,
            repairProofPhoto: proofUrl,
            crewNote: note,
            status: 'Awaiting Signoff',
            isNeedsVerification: true,
            workOrder: 'Field Work Completed',
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
  };

  // Filter issues by search
  const visibleIssues = issues.filter((i) => {
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

  // Verification issue (CF-2026-038)
  const verificationIssue = issues.find(
    (i) => i.id === 'CF-2026-038' || i.isNeedsVerification
  ) || issues[0];

  // If user is not logged in, show the civic access login page
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        lang={lang}
        onLangChange={setLang}
      />
    );
  }

  return (
    <div className="bg-[#faf8ff] font-sans text-[#131b2e] min-h-screen flex flex-col selection:bg-[#dde1ff] selection:text-[#001453]">
      {/* Fixed Header */}
      <Header
        currentRole={role}
        onRoleChange={handleRoleChange}
        lang={lang}
        onLangChange={setLang}
        onOpenReportModal={() => setIsSubmitModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onSelectIssue={(id) => {
          const match = issues.find((i) => i.id === id);
          if (match) setSelectedIssue(match);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        lang={lang}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="pl-64 xl:pl-72 flex flex-col min-h-screen transition-all">
        <main className="relative pt-16 flex-1 w-full px-4 sm:px-6 xl:px-8 bg-[#faf8ff]">
          <div className="flex flex-col w-full pb-10 max-w-[1600px] mx-auto">
            {/* Top Broadcast Alert: Civic Notice Banner */}
            {showBroadcast && (
              <div
                className="w-full mb-4 mt-4 transition-all duration-300 ease-out"
                id="broadcast-alert"
              >
                <div className="bg-[#ffdcc3] text-[#2f1500] px-4 py-2.5 rounded-xl shadow-xs flex items-start sm:items-center justify-between gap-3 border border-[#ffb77d]/40">
                  <div className="flex items-center gap-3">
                    <span className="flex p-1 rounded-lg bg-[#532a00] text-white shrink-0">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-2">
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-[#532a00]">
                        {t.campusBroadcast}
                      </span>
                      <span className="hidden sm:inline text-[#743d00]">•</span>
                      <p className="font-sans text-xs sm:text-sm font-medium text-[#2f1500]">
                        <strong className="font-bold">Urgent:</strong>{' '}
                        {t.broadcastNotice}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsAdvisoryModalOpen(true)}
                      className="hidden md:inline-flex px-2 py-0.5 rounded font-mono text-xs text-[#532a00] hover:bg-[#532a00]/10 transition-colors font-semibold"
                    >
                      {t.viewAdvisory}
                    </button>
                    <button
                      type="button"
                      aria-label="Dismiss alert"
                      onClick={() => setShowBroadcast(false)}
                      className="p-1 rounded text-[#532a00] hover:bg-[#532a00]/15 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DASHBOARD (The primary screen matching screenshot!) */}
            {currentTab === 'dashboard' && (
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

                    {/* Primary Action CTA */}
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1e40af] hover:bg-[#00288e] text-white rounded-lg font-sans text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>{t.reportNewIssueBtn}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric Overview Cards */}
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
                        <span className="text-[#006c4a] font-bold">100%</span>
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
                        0{stats.activeCrews}
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
                          0{stats.actionRequired}
                        </span>
                        <span className="font-mono text-[10px] text-[#444653]">
                          {t.awaitingSignoff}
                        </span>
                      </div>
                      <a
                        href="#resident-verification-module"
                        className="inline-flex items-center gap-1 mt-1 font-mono text-[11px] text-[#00288e] font-bold hover:underline"
                      >
                        <span>{t.reviewProofNow}</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Priority Attention Banner: Resident Verification Module */}
                {verificationIssue && (
                  <ResidentVerificationCard
                    issue={verificationIssue}
                    lang={lang}
                    onConfirmResolution={handleConfirmResolution}
                    onReopenIssue={handleReopenIssue}
                  />
                )}

                {/* Split Panel: Issues Table & Community Live Transparency Hub */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  {/* Left Column (8 cols): My Reported Issues Table & Map */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    <IssuesTable
                      issues={visibleIssues}
                      lang={lang}
                      onOpenDetail={(issue) => setSelectedIssue(issue)}
                      onJumpToVerification={() => {
                        const el = document.getElementById('resident-verification-module');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    />

                    {/* Active Sector Map Card */}
                    <ActiveSectorMap
                      lang={lang}
                      onSelectZone={(zone) => {
                        setSearchQuery(zone);
                      }}
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

            {/* TAB CONTENT: SUBMIT ISSUE */}
            {currentTab === 'submit-issue' && (
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
            {currentTab === 'issues-tracking' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
                      Campus Issues & Tracking Ledger
                    </h2>
                    <p className="font-sans text-xs text-[#757684] mt-0.5">
                      Comprehensive database of verified resident filings, technician work orders, and resolution audit records.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-4 py-2 bg-[#1e40af] text-white rounded-lg text-xs font-semibold hover:bg-[#00288e] flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    Report Issue
                  </button>
                </div>

                <IssuesTable
                  issues={visibleIssues}
                  lang={lang}
                  onOpenDetail={(issue) => setSelectedIssue(issue)}
                />
              </div>
            )}

            {/* TAB CONTENT: ADMIN COMMAND CENTER */}
            {currentTab === 'admin-command-center' && (
              <AdminCommandCenterView
                issues={issues}
                onAssignCrew={handleAssignCrew}
                onUpdateStatus={handleUpdateStatus}
                lang={lang}
              />
            )}

            {/* TAB CONTENT: MAINTENANCE WORKSPACE */}
            {currentTab === 'maintenance-workspace' && (
              <MaintenanceWorkspaceView
                issues={issues}
                onUploadRepairProof={handleUploadRepairProof}
                lang={lang}
              />
            )}

            {/* TAB CONTENT: IMPACT & ANALYTICS */}
            {currentTab === 'impact-analytics' && (
              <ImpactAnalyticsView stats={stats} lang={lang} />
            )}
          </div>
        </main>

        {/* Global Footer */}
        <Footer lang={lang} onLangChange={setLang} />
      </div>

      {/* Modals */}
      <DetailDrawerModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        lang={lang}
      />

      <SubmitIssueModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleCreateIssue}
        lang={lang}
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
