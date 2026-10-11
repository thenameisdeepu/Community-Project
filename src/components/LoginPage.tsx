import React, { useState } from 'react';
import { Role, Language, UserProfile } from '../types';
import { demoUsers } from '../data/mockData';
import { translations } from '../data/translations';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, lang, onLangChange }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('community');
  const [email, setEmail] = useState<string>(demoUsers.community.email);
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const t = translations[lang];

  // Change default email when role pill changes
  const handleRoleTabClick = (role: Role) => {
    setSelectedRole(role);
    setEmail(demoUsers[role].email);
    setPassword('••••••••••••');
  };

  const handleQuickLogin = (role: Role) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(demoUsers[role]);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Find matching user or fallback to selected role profile
      const found = Object.values(demoUsers).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (found) {
        onLogin(found);
      } else {
        // Construct dynamic profile with entered email
        const fallback: UserProfile = {
          ...demoUsers[selectedRole],
          email,
          name: email.split('@')[0] || demoUsers[selectedRole].name,
        };
        onLogin(fallback);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col justify-between selection:bg-[#dde1ff] selection:text-[#001453] relative overflow-hidden">
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#eaedff] rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#82f5c1]/20 rounded-full blur-3xl pointer-events-none opacity-40"></div>

      {/* Top Header Bar with Language Selector */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            alt="CommunityFix Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UOdnNsR0qQTb6dCiNSQEfKZd0qefB16aOKOz6dsEokuqJZKz8cwmcjiSRyrzNicDZeyxzmMUe6AwPjvxmkY6rRlaq5PJmbq2up6NMZXoSU9bGZEhPxdGuh-lXFnDtn25yAb6JJTXvP_F1Ump2ZYytINOdft_YVZLRMVUWBmI-D0bFwRNyOIRx5zeQxASkm0mGPBbvvYQy3ntokF_oeRPrFmq21eKX-s2OnmemPNlI0JKRyd0TDg7Eu96g"
          />
          <div>
            <span className="font-sans font-bold text-lg text-[#00288e] tracking-tight block leading-none">
              CommunityFix
            </span>
            <span className="font-mono text-[10px] text-[#006c4a] font-semibold">
              Greenwood University Campus [Switch Pilot]
            </span>
          </div>
        </div>

        {/* Language switch */}
        <div className="flex items-center bg-[#eaedff] rounded-lg p-0.5" role="group">
          <button
            type="button"
            onClick={() => onLangChange('en')}
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
            onClick={() => onLangChange('kn')}
            className={`px-2.5 py-1 rounded font-mono text-xs transition-all ${
              lang === 'kn'
                ? 'bg-white text-[#00288e] shadow-xs font-bold'
                : 'text-[#444653] hover:text-[#131b2e]'
            }`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#c4c5d5]/30 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Top / Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#00288e] font-mono text-[11px] font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
              Campus Single Sign-On Portal
            </div>
            <h1 className="font-sans font-bold text-2xl text-[#131b2e] tracking-tight">
              Sign In to CommunityFix
            </h1>
            <p className="font-sans text-xs text-[#757684] mt-1">
              Access real-time work orders, verify civic repairs, or manage field technician dispatches.
            </p>
          </div>

          {/* Role Pill Selector */}
          <div className="flex items-center p-1 bg-[#f2f3ff] rounded-xl gap-1 mb-5 border border-[#eaedff]">
            <button
              type="button"
              onClick={() => handleRoleTabClick('community')}
              className={`flex-1 py-1.5 rounded-lg font-mono text-[11px] transition-all text-center ${
                selectedRole === 'community'
                  ? 'bg-white text-[#00288e] font-bold shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              Resident
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('admin')}
              className={`flex-1 py-1.5 rounded-lg font-mono text-[11px] transition-all text-center ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#00288e] font-bold shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              Administrator
            </button>
            <button
              type="button"
              onClick={() => handleRoleTabClick('maintenance')}
              className={`flex-1 py-1.5 rounded-lg font-mono text-[11px] transition-all text-center ${
                selectedRole === 'maintenance'
                  ? 'bg-white text-[#00288e] font-bold shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              Maintenance
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campus Email / ID */}
            <div>
              <label
                htmlFor="login-email"
                className="font-mono text-xs font-semibold text-[#131b2e] block mb-1"
              >
                Institutional Email / Campus ID
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
                  alternate_email
                </span>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. your.name@greenwood.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] placeholder:text-[#757684] focus:outline-none focus:ring-1 focus:ring-[#00288e] focus:border-[#00288e] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="font-mono text-xs font-semibold text-[#131b2e]"
                >
                  Password / Campus PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-sans text-[11px] text-[#00288e] hover:underline"
                >
                  Forgot PIN?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e] focus:border-[#00288e] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#131b2e]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs font-sans">
              <label className="flex items-center gap-2 cursor-pointer text-[#444653]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00288e] focus:ring-[#00288e] border-gray-300"
                />
                <span>Remember this terminal (30 days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#1e40af] hover:bg-[#00288e] text-white font-sans text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75 active:scale-98"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Institutional Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Sign In to Operations Grid</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-[#eaedff]">
            <span className="font-mono text-[10px] uppercase font-bold text-[#757684] tracking-wider block text-center mb-2.5">
              ⚡ Instant Demo Credentials (1-Click)
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('community')}
                className="w-full p-2 bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#eaedff] hover:border-[#dae2fd] rounded-lg text-left transition-all flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00288e] text-white flex items-center justify-center text-[11px] font-bold">
                    S
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-[#131b2e] block leading-none">
                      Dr. A. Sharma (Student Coordinator)
                    </span>
                    <span className="font-mono text-[10px] text-[#757684]">
                      Community Resident Oversight
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#00288e] font-bold group-hover:underline">
                  Sign in →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="w-full p-2 bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#eaedff] hover:border-[#dae2fd] rounded-lg text-left transition-all flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1e40af] text-white flex items-center justify-center text-[11px] font-bold">
                    A
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-[#131b2e] block leading-none">
                      Dean M. Iyer (Operations Desk)
                    </span>
                    <span className="font-mono text-[10px] text-[#757684]">
                      Administrator Control Center
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#00288e] font-bold group-hover:underline">
                  Sign in →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('maintenance')}
                className="w-full p-2 bg-[#f2f3ff] hover:bg-[#eaedff] border border-[#eaedff] hover:border-[#dae2fd] rounded-lg text-left transition-all flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#006c4a] text-white flex items-center justify-center text-[11px] font-bold">
                    M
                  </div>
                  <div>
                    <span className="font-sans font-semibold text-[#131b2e] block leading-none">
                      David K. (Crew #104 Lead)
                    </span>
                    <span className="font-mono text-[10px] text-[#757684]">
                      Field Maintenance Portal
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#006c4a] font-bold group-hover:underline">
                  Sign in →
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs font-sans text-[#757684] z-10 border-t border-[#c4c5d5]/20 bg-white/50 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span>Civic Tech ISO-37120 Accredited</span>
          <span>•</span>
          <span>Greenwood University Campus Identity Network</span>
          <span>•</span>
          <span className="font-mono text-[11px] text-[#006c4a] font-semibold">
            WCAG 2.1 AAA Compliant
          </span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full rounded-xl p-6 shadow-xl border border-[#c4c5d5]/30">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eaedff]">
              <h3 className="font-sans font-bold text-sm text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00288e] text-[18px]">
                  lock_reset
                </span>
                Reset Institutional PIN
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-[#757684] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-3">
                <span className="material-symbols-outlined text-[#006c4a] text-[32px] mb-1">
                  mark_email_read
                </span>
                <p className="font-sans text-xs text-[#131b2e] font-semibold">
                  Recovery Link Dispatched
                </p>
                <p className="font-sans text-[11px] text-[#757684] mt-1">
                  A reset link and authorization token have been sent to your Greenwood campus email.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-4 px-4 py-1.5 rounded-lg bg-[#00288e] text-white text-xs font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div>
                <p className="font-sans text-xs text-[#444653] mb-3">
                  Enter your registered campus email address. An emergency login token will be generated.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.id@greenwood.edu"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-sans text-[#757684]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="px-4 py-1.5 rounded-lg bg-[#00288e] text-white text-xs font-semibold"
                  >
                    Send Recovery PIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
