import React, { useState, useEffect } from 'react';
import { UserProfile, Role, Language } from '../types';
import { api } from '../services/api';

interface AccountsManagementViewProps {
  users: UserProfile[];
  onRefreshUsers: () => void | Promise<void>;
  onDeleteUser?: (id: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  onSelectUserToLogin: (user: UserProfile) => void;
  lang: Language;
}

export const AccountsManagementView: React.FC<AccountsManagementViewProps> = ({
  users,
  onRefreshUsers,
  onDeleteUser,
  onSelectUserToLogin,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [activeTab, setActiveTab] = useState<'table' | 'json'>('table');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Automatically fetch freshest backend dataset when component mounts
  useEffect(() => {
    const fetchLatest = async () => {
      setIsRefreshing(true);
      try {
        await onRefreshUsers();
      } catch (err) {
        console.warn('Error fetching latest accounts on mount:', err);
      } finally {
        setIsRefreshing(false);
      }
    };
    fetchLatest();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshUsers();
      showNotify(lang === 'kn' ? 'ಖಾತೆಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ' : 'Accounts directory synchronized from backend.');
    } catch (err: any) {
      showNotify(err?.message || 'Failed to refresh accounts', 'error');
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // Modal States: viewing user details and creating accounts
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Create Form State
  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'community' as Role,
    roleTitle: '',
    department: '',
    campusSector: 'Sector 4 (Residential)',
    badgeId: '',
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.badgeId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.roleTitle.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.email) {
      showNotify('Name and Login ID (Email) are required', 'error');
      return;
    }

    try {
      await api.createUser(newForm);
      showNotify(`Login ID ${newForm.email} registered successfully!`);
      setShowCreateModal(false);
      setNewForm({
        name: '',
        email: '',
        password: '',
        role: 'community',
        roleTitle: '',
        department: '',
        campusSector: 'Sector 4 (Residential)',
        badgeId: '',
      });
      onRefreshUsers();
    } catch (err: any) {
      showNotify(err.message || 'Failed to create user', 'error');
    }
  };

  // Delete confirmation modal state (bypasses iframe window.confirm restriction)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Administrator deletion trigger - opens safe in-UI confirmation modal
  const handleDeleteUser = (id: string, name: string, email?: string) => {
    setDeleteTarget({ id, name, email: email || '' });
  };

  const confirmPermanentDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const targetToDelete = { ...deleteTarget };
    try {
      const res = onDeleteUser
        ? await onDeleteUser(targetToDelete.id, targetToDelete.email)
        : await api.deleteUser(targetToDelete.id, targetToDelete.email);

      if (res.success) {
        showNotify(`Account "${targetToDelete.name}" (${targetToDelete.email || targetToDelete.id}) permanently deleted from backend database.`);
        
        // If the account being deleted is saved in localStorage, clean it up immediately
        try {
          const savedUserStr = localStorage.getItem('neighbrly_user');
          if (savedUserStr) {
            const savedUser = JSON.parse(savedUserStr);
            if (
              savedUser.id === targetToDelete.id ||
              (targetToDelete.email && savedUser.email?.toLowerCase() === targetToDelete.email.toLowerCase())
            ) {
              localStorage.removeItem('neighbrly_user');
            }
          }
        } catch {
          // ignore parsing error
        }

        if (viewingUser?.id === targetToDelete.id || viewingUser?.email === targetToDelete.email) {
          setViewingUser(null);
        }
        setDeleteTarget(null);
        await onRefreshUsers();
      } else {
        showNotify(res.message || 'Failed to delete account from server', 'error');
      }
    } catch (err: any) {
      showNotify(err.message || 'Error deleting account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sanitize users for JSON export so passwords are never exported or visible
  const sanitizedUsers = users.map(({ password, ...u }) => ({
    ...u,
    password: '[CONFIDENTIAL • PROTECTED BY SECURITY POLICY]',
  }));

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sanitizedUsers, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `neighbrly_accounts_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotify('Accounts directory JSON exported (passwords redacted for confidentiality).');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-sans font-semibold flex items-center justify-between shadow-md animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600 text-emerald-800 dark:text-emerald-200'
              : 'bg-[#ffdad6] dark:bg-red-950/80 border border-[#ba1a1a] dark:border-red-600 text-[#93000a] dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {notification.type === 'success' ? 'verified' : 'error'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-current opacity-70 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase font-bold text-[#00288e] bg-[#eaedff] px-2 py-0.5 rounded">
              {lang === 'kn' ? 'ಬಳಕೆದಾರ ಖಾತೆಗಳ ಡೈರೆಕ್ಟರಿ' : 'Campus Identity & Account Registry'}
            </span>
            <span className="text-xs text-[#757684]">
              {lang === 'kn' ? 'ಆಡಳಿತ ನಿರ್ವಹಣೆ' : 'Administrator Control Panel'}
            </span>
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#131b2e]">
            {lang === 'kn' ? 'ಬಳಕೆದಾರರ ಖಾತೆಗಳ ನಿರ್ವಹಣೆ' : 'User Accounts & Directory'}
          </h2>
          <p className="font-sans text-xs text-[#444653] max-w-2xl mt-0.5">
            {lang === 'kn'
              ? 'ಖಾತೆ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅನಗತ್ಯ ಖಾತೆಗಳನ್ನು ಅಳಿಸಿ. ಭದ್ರತಾ ನೀತಿಯ ಪ್ರಕಾರ ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಗೌಪ್ಯವಾಗಿದ್ದು ನಿರ್ವಾಹಕರಿಗೆ ಗೋಚರಿಸುವುದಿಲ್ಲ.'
              : 'Inspect verified resident and staff account details and exercise account deletion rights. Passwords remain confidential and are strictly hidden from administrators.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onRefreshUsers}
            className="px-3 py-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#c4c5d5]/30"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>{lang === 'kn' ? 'ಖಾತೆಗಳನ್ನು ನವೀಕರಿಸಿ' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-lg bg-[#1e40af] hover:bg-[#00288e] text-white font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>{lang === 'kn' ? 'ಹೊಸ ಖಾತೆ ನೋಂದಾಯಿಸಿ' : 'Register Account'}</span>
          </button>
        </div>
      </div>

      {/* Role Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#151e2e] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {lang === 'kn' ? 'ಒಟ್ಟು ಖಾತೆಗಳು' : 'Total Accounts'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#131b2e] dark:text-slate-100 block mt-1">
            {users.length}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {lang === 'kn' ? 'ನೋಂದಾಯಿತ ಸದಸ್ಯರು' : 'Verified Registered'}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-[#151e2e] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {lang === 'kn' ? 'ನಿವಾಸಿಗಳು' : 'Community Residents'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#00288e] dark:text-blue-400 block mt-1">
            {users.filter((u) => u.role === 'community').length}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {lang === 'kn' ? 'ವಿದ್ಯಾರ್ಥಿಗಳು & ಪ್ರಾಧ್ಯಾಪಕರು' : 'Students & Faculty'}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-[#151e2e] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {lang === 'kn' ? 'ನಿರ್ವಾಹಕರು' : 'Administrators'}
          </span>
          <span className="font-sans text-2xl font-bold text-[#4f378b] dark:text-purple-400 block mt-1">
            {users.filter((u) => u.role === 'admin').length}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {lang === 'kn' ? 'ನಿಯಂತ್ರಣ ಕೇಂದ್ರ ಸಿಬ್ಬಂದಿ' : 'Control Center Staff'}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-[#151e2e] rounded-xl border border-[#c4c5d5]/30 dark:border-slate-800 shadow-xs transition-colors">
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase">
            {lang === 'kn' ? 'ಕ್ಷೇತ್ರ ನಿರ್ವಹಣೆ' : 'Field Maintenance'}
          </span>
          <span className="font-sans text-2xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
            {users.filter((u) => u.role === 'maintenance').length}
          </span>
          <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">
            {lang === 'kn' ? 'ತಂತ್ರಜ್ಞರು & ತಂಡಗಳು' : 'Technicians & Crews'}
          </span>
        </div>
      </div>

      {/* View Mode Toggle & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#c4c5d5]/30 shadow-xs">
        <div className="flex items-center gap-2">
          {/* View Tab Buttons */}
          <div className="inline-flex items-center p-1 bg-[#f2f3ff] rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1 rounded text-xs font-sans transition-all cursor-pointer ${
                activeTab === 'table' ? 'bg-white font-bold text-[#00288e] shadow-2xs' : 'text-[#444653]'
              }`}
            >
              {lang === 'kn' ? 'ಖಾತೆಗಳ ಡೈರೆಕ್ಟರಿ' : 'Account Directory'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'json' ? 'bg-white font-bold text-[#00288e] shadow-2xs' : 'text-[#444653]'
              }`}
            >
              {lang === 'kn' ? 'ಖಾತೆಗಳ ಬ್ಯಾಕಪ್ (JSON)' : 'Accounts Backup (JSON)'}
            </button>
          </div>

          {/* Role Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(['all', 'community', 'admin', 'maintenance'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 rounded-full font-mono text-[11px] transition-all capitalize cursor-pointer ${
                  roleFilter === r
                    ? 'bg-[#00288e] text-white font-semibold'
                    : 'bg-[#eaedff] text-[#444653] hover:text-[#131b2e]'
                }`}
              >
                {r === 'all'
                  ? (lang === 'kn' ? 'ಎಲ್ಲಾ ಪಾತ್ರಗಳು' : 'All Roles')
                  : r === 'community'
                  ? (lang === 'kn' ? 'ನಿವಾಸಿಗಳು' : 'Residents')
                  : r === 'admin'
                  ? (lang === 'kn' ? 'ಆಡಳಿತ' : 'Admin')
                  : (lang === 'kn' ? 'ನಿರ್ವಹಣೆ' : 'Maintenance')}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'kn' ? 'ಖಾತೆಗಳು, ಲಾಗಿನ್ ಐಡಿ ಹುಡುಕಿ...' : 'Search accounts, Login ID...'}
            className="w-full pl-8 pr-3 py-1.5 bg-[#f2f3ff] rounded-lg text-xs font-sans text-[#131b2e] border border-[#c4c5d5] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'table' ? (
        <div className="bg-white rounded-xl shadow-xs border border-[#c4c5d5]/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f3ff] text-[#444653] font-mono text-[10px] tracking-wider uppercase border-b border-[#c4c5d5]/30">
                  <th className="py-3 px-4 font-semibold">
                    {lang === 'kn' ? 'ಲಾಗಿನ್ ಐಡಿ / ಇಮೇಲ್' : 'Login ID / Email'}
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    {lang === 'kn' ? 'ಹೆಸರು & ಹುದ್ದೆ' : 'Name & Title'}
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    {lang === 'kn' ? 'ವ್ಯವಸ್ಥಾ ಪಾತ್ರ (Role)' : 'Role'}
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    {lang === 'kn' ? 'ವಿಭಾಗ & ಸೆಕ್ಟರ್' : 'Department & Sector'}
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    {lang === 'kn' ? 'ಬ್ಯಾಡ್ಜ್ ಐಡಿ' : 'Badge ID'}
                  </th>
                  <th className="py-3 px-3 font-semibold">
                    {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಸ್ಥಿತಿ' : 'Password Security'}
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">
                    {lang === 'kn' ? 'ಕ್ರಮಗಳು' : 'Administrator Rights'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs font-sans">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#757684]">
                      {lang === 'kn'
                        ? 'ಹುಡುಕಾಟ ಫಿಲ್ಟರ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಖಾತೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
                        : 'No accounts found matching search filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#f2f3ff]/60 transition-colors">
                      {/* Login ID / Email */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#00288e] font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px] text-[#757684]">
                            alternate_email
                          </span>
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Name & Title */}
                      <td className="py-3.5 px-3 min-w-[170px]">
                        <strong className="font-sans text-xs text-[#131b2e] block">{u.name}</strong>
                        <span className="font-mono text-[11px] text-[#757684]">{u.roleTitle}</span>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="px-2.5 py-1 rounded-md font-mono text-[10px] font-bold bg-[#dde1ff] text-[#00288e] dark:bg-blue-950/70 dark:text-blue-300 dark:border dark:border-blue-700/50">
                            Administrator
                          </span>
                        ) : u.role === 'maintenance' ? (
                          <span className="px-2.5 py-1 rounded-md font-mono text-[10px] font-bold bg-[#ffdcc3] text-[#6e3900] dark:bg-amber-950/70 dark:text-amber-300 dark:border dark:border-amber-700/50">
                            Maintenance
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border dark:border-emerald-600/60 shadow-2xs">
                            Resident
                          </span>
                        )}
                      </td>

                      {/* Department & Sector */}
                      <td className="py-3.5 px-3 min-w-[180px]">
                        <span className="text-xs text-[#131b2e] dark:text-slate-100 block leading-tight font-medium">{u.department}</span>
                        <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400">{u.campusSector}</span>
                      </td>

                      {/* Badge ID */}
                      <td className="py-3.5 px-3 font-mono text-xs text-[#444653] dark:text-slate-300 font-semibold whitespace-nowrap">
                        {u.badgeId}
                      </td>

                      {/* Password Security Status: strictly non-visible, protected by security policy */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-600/60 shadow-2xs"
                          title="User password is encrypted and confidential. Inaccessible by administrators."
                        >
                          <span className="material-symbols-outlined text-[14px] text-emerald-600 dark:text-emerald-400">lock</span>
                          <span>Protected • Confidential</span>
                        </span>
                      </td>

                      {/* Administrator Rights: See details & Delete account */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setViewingUser(u)}
                            className="px-2.5 py-1 bg-[#eaedff] text-[#00288e] hover:bg-[#dde1ff] rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                            title="View complete account details"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                            <span>{lang === 'kn' ? 'ವಿವರಗಳು' : 'Details'}</span>
                          </button>

                          {/* Delete Account Button (Exclusive administrator right) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, u.name, u.email)}
                            className="px-2.5 py-1 bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffb4ab] rounded text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer border border-[#ba1a1a]/20"
                            title="Permanently delete this account"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                            <span>{lang === 'kn' ? 'ಅಳಿಸಿ' : 'Delete'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Raw JSON Inspector View (Passwords Redacted) */
        <div className="bg-white rounded-xl shadow-xs border border-[#c4c5d5]/30 p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#eaedff]">
            <span className="font-mono text-xs font-bold text-[#00288e]">
              /api/users ({users.length} verified records • Passwords Redacted)
            </span>
            <button
              type="button"
              onClick={handleExportJson}
              className="text-xs font-mono text-[#00288e] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              Download JSON
            </button>
          </div>
          <pre className="p-4 bg-[#131b2e] text-[#a8b8ff] rounded-lg font-mono text-xs overflow-x-auto max-h-[500px]">
            {JSON.stringify(sanitizedUsers, null, 2)}
          </pre>
        </div>
      )}

      {/* --- MODAL 1: VIEW ACCOUNT DETAILS (NO PASSWORD SHOWN) --- */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#151e2e] max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-[#c4c5d5]/40 dark:border-[#2a3648] max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eaedff] dark:border-[#2a3648]">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-[#eaedff] dark:bg-[#1e293b] text-[#00288e] dark:text-[#60a5fa] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">badge</span>
                </span>
                <div>
                  <h3 className="font-sans font-bold text-base text-[#131b2e] dark:text-[#f1f5f9]">
                    {lang === 'kn' ? 'ಬಳಕೆದಾರರ ಖಾತೆಯ ವಿವರಗಳು' : 'User Account Details'}
                  </h3>
                  <span className="font-mono text-[11px] text-[#757684] dark:text-slate-400">
                    ID: {viewingUser.id} • {viewingUser.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="text-[#757684] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              {/* Full Name */}
              <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                  Full Name
                </span>
                <span className="font-sans font-bold text-sm text-[#131b2e] dark:text-[#f1f5f9]">
                  {viewingUser.name}
                </span>
              </div>

              {/* Login ID (Email) & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                  <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                    Login ID (Email)
                  </span>
                  <span className="font-mono font-semibold text-xs text-[#00288e] dark:text-[#60a5fa]">
                    {viewingUser.email}
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                  <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                    Role Clearance
                  </span>
                  <span className="font-mono font-semibold text-xs capitalize text-[#131b2e] dark:text-[#f1f5f9]">
                    {viewingUser.role}
                  </span>
                </div>
              </div>

              {/* Role Title & Badge ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                  <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                    Role Title / Designation
                  </span>
                  <span className="font-sans text-xs text-[#131b2e] dark:text-[#f1f5f9]">
                    {viewingUser.roleTitle || '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                  <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                    Badge ID / Employee ID
                  </span>
                  <span className="font-mono text-xs text-[#131b2e] dark:text-[#f1f5f9]">
                    {viewingUser.badgeId || '—'}
                  </span>
                </div>
              </div>

              {/* Department & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                  <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                    Department / Division
                  </span>
                  <span className="font-sans text-xs text-[#131b2e] dark:text-[#f1f5f9]">
                    {viewingUser.department || '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#f8f9ff] dark:bg-[#1b2638] rounded-xl border border-[#eaedff] dark:border-[#2a3648]">
                  <span className="font-mono text-[10px] text-[#757684] dark:text-slate-400 uppercase font-bold block mb-0.5">
                    Campus Sector
                  </span>
                  <span className="font-sans text-xs text-[#131b2e] dark:text-[#f1f5f9]">
                    {viewingUser.campusSector || '—'}
                  </span>
                </div>
              </div>

              {/* Account Security Notice: Password hidden for privacy */}
              <div className="p-3.5 bg-emerald-50/90 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-700/60 flex items-start gap-2.5 transition-colors">
                <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  verified_user
                </span>
                <div>
                  <span className="font-sans font-bold text-xs text-emerald-900 dark:text-emerald-200 block">
                    Password Protected & Confidential
                  </span>
                  <p className="font-sans text-[11px] text-emerald-800/90 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
                    Under platform privacy and security regulations, user passwords are encrypted and strictly hidden from administrators.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions: Administrator Delete Right & Close */}
            <div className="flex items-center justify-between gap-2 pt-4 mt-5 border-t border-[#eaedff] dark:border-[#2a3648]">
              <button
                type="button"
                onClick={() => handleDeleteUser(viewingUser.id, viewingUser.name, viewingUser.email)}
                className="px-4 py-2 bg-[#ffdad6] dark:bg-[#ba1a1a]/20 hover:bg-[#ffb4ab] dark:hover:bg-[#ba1a1a]/30 text-[#93000a] dark:text-[#fca5a5] rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-[#ba1a1a]/20 dark:border-[#ba1a1a]/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>{lang === 'kn' ? 'ಖಾತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ' : 'Delete Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-[#eaedff] dark:bg-[#1e293b] text-[#00288e] dark:text-[#93c5fd] hover:bg-[#dde1ff] dark:hover:bg-[#334155] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {lang === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: REGISTER NEW ACCOUNT --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#151e2e] max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-[#c4c5d5]/40 dark:border-[#2a3648] max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#eaedff] dark:border-[#2a3648]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#dde1ff] dark:bg-[#1e293b] text-[#00288e] dark:text-[#60a5fa] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </span>
                <h3 className="font-sans font-bold text-base text-[#131b2e] dark:text-[#f1f5f9]">
                  Register New Login ID & Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#757684] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="e.g. Maya Chen"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                    Login ID (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="e.g. user@greenwood.edu"
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newForm.password}
                    onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                    placeholder="Set user password"
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                    Role Clearance *
                  </label>
                  <select
                    value={newForm.role}
                    onChange={(e) => setNewForm({ ...newForm, role: e.target.value as Role })}
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  >
                    <option value="community">Community Member / Resident</option>
                    <option value="admin">Campus Administrator</option>
                    <option value="maintenance">Field Maintenance Staff</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={newForm.roleTitle}
                    onChange={(e) => setNewForm({ ...newForm, roleTitle: e.target.value })}
                    placeholder="e.g. Postgraduate Scholar"
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                    Badge ID / UID
                  </label>
                  <input
                    type="text"
                    value={newForm.badgeId}
                    onChange={(e) => setNewForm({ ...newForm, badgeId: e.target.value })}
                    placeholder="e.g. ID-4091"
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newForm.department}
                    onChange={(e) => setNewForm({ ...newForm, department: e.target.value })}
                    placeholder="e.g. Environmental Engineering"
                    className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] dark:text-slate-200 block mb-1">
                  Campus Sector
                </label>
                <input
                  type="text"
                  value={newForm.campusSector}
                  onChange={(e) => setNewForm({ ...newForm, campusSector: e.target.value })}
                  placeholder="e.g. Sector 4 (Hostel Quad)"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] dark:bg-[#1b2638] text-[#131b2e] dark:text-white border border-[#c4c5d5] dark:border-[#2a3648] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#eaedff] dark:border-[#2a3648]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-sans text-[#444653] dark:text-slate-300 hover:bg-[#eaedff] dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#1e40af] hover:bg-[#00288e] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CONFIRM ACCOUNT PERMANENT DELETION --- */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#283044]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#151e2e] max-w-md w-full rounded-2xl p-6 shadow-2xl border border-[#ba1a1a]/30 dark:border-[#ba1a1a]/50 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdad6] dark:bg-[#ffdad6]/20 text-[#93000a] dark:text-[#ffb4ab] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-[#131b2e] dark:text-[#f1f5f9]">
                  {lang === 'kn' ? 'ಖಾತೆ ಅಳಿಸುವಿಕೆಯನ್ನು ದೃಢೀಕರಿಸಿ' : 'Confirm Permanent Deletion'}
                </h3>
                <span className="font-mono text-[11px] text-[#757684] dark:text-slate-400">
                  UID: {deleteTarget.id}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#ffdad6]/40 dark:bg-[#93000a]/20 border border-[#ba1a1a]/30 dark:border-[#ba1a1a]/40 rounded-xl mb-4 text-xs font-sans text-[#444653] dark:text-slate-200 leading-relaxed">
              <p className="font-semibold text-[#93000a] dark:text-[#fca5a5] mb-1">
                {lang === 'kn'
                  ? `ನೀವು "${deleteTarget.name}" ಖಾತೆಯನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ಬಯಸುವಿರಾ?`
                  : `Are you sure you want to permanently delete the account for "${deleteTarget.name}"?`}
              </p>
              {deleteTarget.email && (
                <p className="font-mono text-[11px] text-[#555] dark:text-slate-300 mb-1">
                  Email: {deleteTarget.email}
                </p>
              )}
              <p className="text-[11px] text-[#93000a] dark:text-[#fca5a5]/90">
                {lang === 'kn'
                  ? 'ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ. ಬಳಕೆದಾರರು ತಕ್ಷಣವೇ Neighbrly ಗೆ ಪ್ರವೇಶವನ್ನು ಕಳೆದುಕೊಳ್ಳುತ್ತಾರೆ.'
                  : 'This action is irreversible. The user credentials and profile will be permanently wiped from the database.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg text-xs font-sans font-medium text-[#444653] dark:text-slate-300 hover:bg-[#eaedff] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmPermanentDelete}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{lang === 'kn' ? 'ಅಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    <span>{lang === 'kn' ? 'ಖಚಿತವಾಗಿ ಅಳಿಸಿ' : 'Delete Account'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
