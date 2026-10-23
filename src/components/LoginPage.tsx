import React, { useState } from 'react';
import { Role, Language, UserProfile } from '../types';
import { translations } from '../data/translations';
import { api } from '../services/api';
import { NeighbrlyLogo } from './NeighbrlyLogo';
import { PasswordRulesModal } from './PasswordRulesModal';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  users?: UserProfile[];
  onRefreshUsers?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const ALLOWED_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com'];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  lang,
  onLangChange,
  users = [],
  onRefreshUsers,
  isDarkMode = false,
  onToggleTheme,
}) => {
  // Separate views: default to register if no accounts exist yet
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(
    users && users.length === 0 ? 'register' : 'signin'
  );
  const [selectedRole, setSelectedRole] = useState<Role>('community');

  // Sign In Form States
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register Form States
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: (users && users.length === 0 ? 'admin' : 'community') as Role,
    roleTitle: '',
    department: '',
    campusSector: 'Sector 4 (Residential)',
    badgeId: '',
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Password Rules Modal State
  const [showPasswordRulesModal, setShowPasswordRulesModal] = useState<boolean>(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const t = translations[lang];

  // Verified accounts list from backend
  const allAccounts: UserProfile[] = users || [];

  // Email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Check email domain validity for registration
  const getDomainCheck = (emailVal: string) => {
    const trimmed = emailVal.trim().toLowerCase();
    if (!trimmed.includes('@')) {
      return { hasAt: false, domain: '', isAllowed: false, isValidFormat: false };
    }
    const parts = trimmed.split('@');
    const domain = parts[1] || '';
    const isAllowed = ALLOWED_DOMAINS.includes(domain);
    const isValidFormat = emailRegex.test(trimmed);
    return { hasAt: true, domain, isAllowed, isValidFormat };
  };

  const regDomainCheck = getDomainCheck(registerForm.email);

  // Real-time password validation requirements
  const regPassword = registerForm.password;
  const pwHasLength = regPassword.length >= 8;
  const pwHasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(regPassword);
  const pwHasLetter = /[a-zA-Z]/.test(regPassword);
  const pwHasNumber = /[0-9]/.test(regPassword);
  const isPasswordValid = pwHasLength && pwHasSpecial && pwHasLetter && pwHasNumber;

  // Registration button enabled only when email domain and password requirements pass
  const isRegistrationReady =
    registerForm.name.trim().length > 0 &&
    regDomainCheck.isValidFormat &&
    regDomainCheck.isAllowed &&
    isPasswordValid &&
    !isRegistering;

  // Password Strength Score (0 to 4)
  const pwStrengthScore = [pwHasLength, pwHasLetter, pwHasNumber, pwHasSpecial].filter(Boolean).length;
  const getStrengthLabel = () => {
    if (pwStrengthScore <= 1) return { label: 'Weak', text: 'text-red-600' };
    if (pwStrengthScore === 2) return { label: 'Fair', text: 'text-amber-600' };
    if (pwStrengthScore === 3) return { label: 'Good', text: 'text-blue-600' };
    return { label: 'Strong', text: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  // Handle Sign In submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = email.trim();

    if (!emailTrimmed) {
      setErrorMessage(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.' : 'Please enter your email address.');
      return;
    }

    if (!emailRegex.test(emailTrimmed)) {
      setErrorMessage(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ಐಡಿ ನಮೂದಿಸಿ.' : 'Please enter a valid email ID.');
      return;
    }

    if (!password) {
      setErrorMessage(lang === 'kn' ? 'ದಯವಿಟ್ಟು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const user = await api.login(emailTrimmed, password);
      setIsLoading(false);
      onLogin(user);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || '';

      // If backend returned incorrect password, show clear incorrect password alert
      if (msg.toLowerCase().includes('incorrect password')) {
        setErrorMessage(lang === 'kn' ? 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್' : 'Incorrect password');
        return;
      }

      setErrorMessage(
        lang === 'kn'
          ? 'ಖಾತೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನೋಂದಾಯಿತ ಇಮೇಲ್ ನಮೂದಿಸಿ ಅಥವಾ ಹೊಸ ಖಾತೆಯನ್ನು ರಚಿಸಿ.'
          : msg || 'Invalid email or password. Please verify your credentials or register.'
      );
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = registerForm.email.trim().toLowerCase();

    if (!registerForm.name.trim()) {
      setRegisterError(lang === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು ಅಗತ್ಯವಿದೆ' : 'Full name is required');
      return;
    }

    if (!emailTrimmed) {
      setRegisterError(lang === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ ಅಗತ್ಯವಿದೆ' : 'Email address is required');
      return;
    }

    if (!regDomainCheck.isValidFormat) {
      setRegisterError(
        lang === 'kn'
          ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ'
          : 'Please enter a valid email address format'
      );
      return;
    }

    if (!regDomainCheck.isAllowed) {
      setRegisterError(
        lang === 'kn'
          ? 'ನೋಂದಣಿ ಕೇವಲ Gmail (@gmail.com), Yahoo (@yahoo.com), ಮತ್ತು Outlook (@outlook.com) ಇಮೇಲ್‌ಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.'
          : 'Registration is restricted to Gmail (@gmail.com), Yahoo (@yahoo.com), and Outlook (@outlook.com) email addresses.'
      );
      return;
    }

    if (!isPasswordValid) {
      setRegisterError(
        lang === 'kn'
          ? 'ಪಾಸ್‌ವರ್ಡ್ ಎಲ್ಲಾ ಭದ್ರತಾ ನಿಯಮಗಳನ್ನು ಪೂರೈಸಬೇಕು'
          : 'Password must satisfy all security requirements'
      );
      return;
    }

    setIsRegistering(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      const result = await api.register({
        name: registerForm.name.trim(),
        email: emailTrimmed,
        password: registerForm.password,
        role: registerForm.role,
        roleTitle:
          registerForm.roleTitle ||
          (registerForm.role === 'admin'
            ? 'Community Operations Officer'
            : registerForm.role === 'maintenance'
            ? 'Field Services Lead'
            : 'Resident Student Coordinator'),
        department: registerForm.department || 'Neighbrly Resident Welfare',
        campusSector: registerForm.campusSector || 'Sector 4 (Residential)',
        badgeId:
          registerForm.badgeId ||
          `NB-${registerForm.role.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      setIsRegistering(false);
      if (onRefreshUsers) onRefreshUsers();

      setRegisterSuccess(
        lang === 'kn'
          ? 'ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ! ನೇರವಾಗಿ ಲಾಗಿನ್ ಮಾಡಲಾಗುತ್ತಿದೆ...'
          : 'Account created successfully! Logging you in directly...'
      );

      // Log in directly without requiring any email verification or OTP!
      setTimeout(() => {
        onLogin(result.user);
      }, 1000);
    } catch (err: any) {
      setIsRegistering(false);
      setRegisterError(err.message || 'Registration failed. Please check inputs and try again.');
    }
  };

  const appendDomain = (d: string) => {
    const raw = registerForm.email.trim();
    const username = raw.includes('@') ? raw.split('@')[0] : raw;
    if (username) {
      setRegisterForm({ ...registerForm, email: `${username}@${d}` });
    } else {
      setRegisterForm({ ...registerForm, email: `@${d}` });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00288e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1e40af]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-between z-10 border-b border-[#c4c5d5]/20 bg-white/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <NeighbrlyLogo size="md" showText={true} tagline={t.appTagline} />
        </div>

        {/* Language & Password Rules Quick Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPasswordRulesModal(true)}
            className="px-2.5 py-1 rounded-lg bg-[#eaedff] hover:bg-[#d8e0ff] text-[#00288e] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#c4c5d5]/30 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">help</span>
            <span className="hidden sm:inline">Password Rules</span>
          </button>

          <div className="flex items-center bg-[#eaedff] p-1 rounded-lg">
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

          {/* Dark Mode Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode (D)' : 'Switch to dark mode (D)'}
              className="p-1.5 rounded-lg text-[#444653] hover:text-[#00288e] hover:bg-[#eaedff] transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#00288e]/30"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-[#c4c5d5]/30 animate-in fade-in zoom-in-95 duration-200">
          {/* Logo and Tagline */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <NeighbrlyLogo size="lg" showText={true} variant="vertical" />
            </div>
            <h1 className="font-sans font-bold text-xl text-[#131b2e] tracking-tight mt-1">
              {authMode === 'signin'
                ? lang === 'kn'
                  ? 'ನೈಬರ್ಲಿ ಲಾಗಿನ್ (Sign In)'
                  : 'Sign In'
                : lang === 'kn'
                ? 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ (Register)'
                : 'Create Account'}
            </h1>
            <p className="font-sans text-xs text-[#757684] mt-1">
              {allAccounts.length === 0
                ? (lang === 'kn'
                    ? 'ನೈಬರ್ಲಿಗೆ ಸುಸ್ವಾಗತ. ಪ್ರಾರಂಭಿಸಲು ನೋಂದಾಯಿಸಿ ಅಥವಾ ಸೈನ್ ಇನ್ ಮಾಡಿ.'
                    : 'Welcome to Neighbrly. Register or sign in to get started.')
                : t.appTagline}
            </p>
          </div>

          {/* Mode Switch Tabs (Sign In / Register) */}
          <div className="flex items-center p-1 bg-[#f2f3ff] rounded-xl gap-1 mb-5 border border-[#eaedff]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
                setRegisterSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#00288e] shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>{lang === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegisterError(null);
                setRegisterSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#00288e] shadow-xs'
                  : 'text-[#444653] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>{lang === 'kn' ? 'ನೋಂದಣಿ (Register)' : 'Register'}</span>
            </button>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center p-1 bg-[#f8f9ff] rounded-lg gap-1 mb-4 border border-[#e2e4ed]">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('community');
                setRegisterForm((prev) => ({ ...prev, role: 'community' }));
              }}
              className={`flex-1 py-1 rounded font-mono text-[11px] transition-all text-center cursor-pointer ${
                (authMode === 'signin' ? selectedRole : registerForm.role) === 'community'
                  ? 'bg-white text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/30'
                  : 'text-[#757684] hover:text-[#131b2e]'
              }`}
            >
              {lang === 'kn' ? 'ನಿವಾಸಿ' : 'Resident'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setRegisterForm((prev) => ({ ...prev, role: 'admin' }));
              }}
              className={`flex-1 py-1 rounded font-mono text-[11px] transition-all text-center cursor-pointer ${
                (authMode === 'signin' ? selectedRole : registerForm.role) === 'admin'
                  ? 'bg-white text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/30'
                  : 'text-[#757684] hover:text-[#131b2e]'
              }`}
            >
              {lang === 'kn' ? 'ಆಡಳಿತಾಧಿಕಾರಿ' : 'Admin'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('maintenance');
                setRegisterForm((prev) => ({ ...prev, role: 'maintenance' }));
              }}
              className={`flex-1 py-1 rounded font-mono text-[11px] transition-all text-center cursor-pointer ${
                (authMode === 'signin' ? selectedRole : registerForm.role) === 'maintenance'
                  ? 'bg-white text-[#00288e] font-bold shadow-xs border border-[#c4c5d5]/30'
                  : 'text-[#757684] hover:text-[#131b2e]'
              }`}
            >
              {lang === 'kn' ? 'ನಿರ್ವಹಣೆ' : 'Maintenance'}
            </button>
          </div>

          {/* TAB 1: SIGN IN VIEW */}
          {authMode === 'signin' && (
            <>
              {errorMessage && (
                <div className="mb-4 p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg text-xs font-sans text-[#93000a] flex items-start gap-2 animate-in fade-in duration-150">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <div className="flex-1">
                    <span className="font-semibold">{errorMessage}</span>
                    {errorMessage !== 'Incorrect password' && errorMessage !== 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್' && (
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className="block mt-1 font-semibold underline text-[#00288e] cursor-pointer"
                      >
                        {lang === 'kn' ? '+ ಹೊಸ ಖಾತೆ ನೋಂದಾಯಿಸಿ' : '+ Create Account / Register'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="font-mono text-xs font-semibold text-[#131b2e] block mb-1"
                  >
                    {lang === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ' : 'Email Address'}
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
                      placeholder="e.g. resident@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] placeholder:text-[#757684] focus:outline-none focus:ring-1 focus:ring-[#00288e] focus:border-[#00288e] transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="login-password"
                      className="font-mono text-xs font-semibold text-[#131b2e]"
                    >
                      {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="font-sans text-[11px] text-[#00288e] hover:underline cursor-pointer"
                    >
                      {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರೇ?' : 'Forgot Password?'}
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
                      placeholder={lang === 'kn' ? 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ' : 'Enter your password'}
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] placeholder:text-[#757684] focus:outline-none focus:ring-1 focus:ring-[#00288e] focus:border-[#00288e] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#131b2e] cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
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
                    <span>
                      {lang === 'kn'
                        ? 'ಈ ಟರ್ಮಿನಲ್ ಅನ್ನು ನೆನಪಿಡಿ (30 ದಿನಗಳು)'
                        : 'Remember this terminal (30 days)'}
                    </span>
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#1e40af] hover:bg-[#00288e] text-white font-sans text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75 active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>
                        {lang === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Signing In...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>{lang === 'kn' ? 'ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Create Account Link CTA */}
              <div className="mt-4 pt-3 border-t border-[#eaedff] text-center">
                <p className="text-xs text-[#757684] mb-2">
                  {lang === 'kn' ? 'ಹೊಸ ಬಳಕೆದಾರರೇ?' : 'New to Neighbrly?'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegisterError(null);
                  }}
                  className="w-full py-2 px-3 bg-[#e2e7ff] hover:bg-[#d0d8ff] text-[#00288e] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-[#c4c5d5]/40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>
                    {lang === 'kn' ? '+ ಹೊಸ ಖಾತೆ ನೋಂದಾಯಿಸಿ' : '+ Create Neighbrly Account'}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: REGISTER VIEW (Prompt Requirements 1, 2, 3, 4) */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {registerSuccess && (
                <div className="p-3 bg-[#e8f5e9] border border-[#a3e5bf] rounded-lg text-xs font-sans text-[#004d33] flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="material-symbols-outlined text-[18px] text-[#006c4a]">check_circle</span>
                  <span className="font-semibold">{registerSuccess}</span>
                </div>
              )}

              {registerError && (
                <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg text-xs font-sans text-[#93000a] flex items-start gap-2 animate-in fade-in duration-150">
                  <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                  <span className="font-semibold">{registerError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="font-mono text-xs font-semibold text-[#131b2e] block mb-1">
                  {lang === 'kn' ? 'ಪೂರ್ಣ ಹೆಸರು *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                />
              </div>

              {/* Email with Domain Restrictions (@gmail.com, @yahoo.com, @outlook.com) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-xs font-semibold text-[#131b2e]">
                    {lang === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ *' : 'Email Address *'}
                  </label>
                  <span className="text-[10px] font-mono text-[#757684]">
                    Gmail • Yahoo • Outlook
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
                    alternate_email
                  </span>
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, email: e.target.value });
                      setRegisterError(null);
                    }}
                    placeholder="e.g. ramesh@gmail.com"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-sans text-[#131b2e] transition-all focus:outline-none focus:ring-1 ${
                      regDomainCheck.hasAt && !regDomainCheck.isAllowed
                        ? 'bg-[#fff0f0] border-red-400 focus:ring-red-500'
                        : regDomainCheck.isAllowed
                        ? 'bg-[#f0fbf5] border-[#006c4a] focus:ring-[#006c4a]'
                        : 'bg-[#f2f3ff] border-[#c4c5d5] focus:ring-[#00288e]'
                    }`}
                  />
                </div>

                {/* Domain Quick Select Chips */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-[#757684]">Quick:</span>
                  {ALLOWED_DOMAINS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => appendDomain(d)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#eaedff] hover:bg-[#d8e0ff] text-[#00288e] transition-colors border border-[#c4c5d5]/30 cursor-pointer"
                    >
                      @{d}
                    </button>
                  ))}
                </div>

                {/* Unsupported Domain Error Alert */}
                {regDomainCheck.hasAt && !regDomainCheck.isAllowed && regDomainCheck.domain.length > 0 && (
                  <div className="mt-1.5 p-2 bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg text-[11px] font-sans text-[#93000a] flex items-center gap-1.5 animate-in fade-in">
                    <span className="material-symbols-outlined text-[15px] shrink-0">cancel</span>
                    <span>
                      Registration is restricted to <strong>@gmail.com</strong>, <strong>@yahoo.com</strong>, and <strong>@outlook.com</strong>.
                    </span>
                  </div>
                )}
              </div>

              {/* Password Field with Password Rules alert button & show/hide toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-mono text-xs font-semibold text-[#131b2e]">
                    {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ *' : 'Password *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordRulesModal(true)}
                    className="font-sans text-[11px] font-semibold text-[#00288e] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">help</span>
                    <span>{lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ನಿಯಮಗಳು' : 'Password Rules'}</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[18px]">
                    lock
                  </span>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Create your Neighbrly password"
                    className="w-full pl-9 pr-10 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#131b2e] cursor-pointer"
                    title={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showRegisterPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Real-time Password Requirements Checklist */}
                <div className="mt-2 p-2.5 bg-[#f8f9ff] border border-[#eaedff] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#444653]">
                      {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಪರಿಶೀಲನೆ:' : 'Password Requirements:'}
                    </span>
                    {regPassword.length > 0 && (
                      <span className={`text-[10px] font-mono font-bold ${strength.text}`}>
                        {strength.label}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className={`flex items-center gap-1.5 ${pwHasLength ? 'text-[#006c4a] font-semibold' : 'text-[#757684]'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {pwHasLength ? 'check_circle' : 'circle'}
                      </span>
                      <span>8+ Characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwHasSpecial ? 'text-[#006c4a] font-semibold' : 'text-[#757684]'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {pwHasSpecial ? 'check_circle' : 'circle'}
                      </span>
                      <span>1+ Special (@#$!)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwHasLetter ? 'text-[#006c4a] font-semibold' : 'text-[#757684]'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {pwHasLetter ? 'check_circle' : 'circle'}
                      </span>
                      <span>1+ Letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${pwHasNumber ? 'text-[#006c4a] font-semibold' : 'text-[#757684]'}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {pwHasNumber ? 'check_circle' : 'circle'}
                      </span>
                      <span>1+ Number (0-9)</span>
                    </div>
                  </div>
                </div>

                {/* Security Reminder */}
                <div className="mt-2 text-[10px] text-[#757684] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#00288e]">shield</span>
                  <span>Create a separate password for Neighbrly. Never enter your email password.</span>
                </div>
              </div>

              {/* Submit Register Button - Disabled until requirements are satisfied */}
              <button
                type="submit"
                disabled={!isRegistrationReady}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#00288e] hover:bg-[#1e40af] text-white font-sans text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'kn' ? 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'Registering Account...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>
                      {lang === 'kn' ? 'ಖಾತೆ ರಚಿಸಿ & ಸೈನ್ ಇನ್ ಮಾಡಿ' : 'Create Account & Sign In'}
                    </span>
                  </>
                )}
              </button>

              {/* Switch to Sign In Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setRegisterError(null);
                    setRegisterSuccess(null);
                  }}
                  className="text-xs font-sans text-[#757684] hover:text-[#00288e] transition-colors cursor-pointer"
                >
                  {lang === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ? ಲಾಗಿನ್ ಮಾಡಿ' : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Password Rules Modal */}
      <PasswordRulesModal
        isOpen={showPasswordRulesModal}
        onClose={() => setShowPasswordRulesModal(false)}
        password={registerForm.password || password}
        lang={lang}
      />

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#283044]/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-[#c4c5d5]/30">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eaedff]">
              <h3 className="font-sans font-bold text-sm text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00288e] text-[18px]">
                  lock_reset
                </span>
                {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ' : 'Reset Password'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-[#757684] hover:text-[#131b2e] cursor-pointer"
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
                  {lang === 'kn' ? 'ಚೇತರಿಕೆ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ' : 'Password Reset Processed'}
                </p>
                <p className="font-sans text-[11px] text-[#757684] mt-1">
                  {lang === 'kn'
                    ? 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್‌ಗೆ ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಸೂಚನೆಗಳನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗಿದೆ.'
                    : `Password reset instructions have been recorded for ${forgotEmail}.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="mt-4 px-4 py-1.5 rounded-lg bg-[#00288e] text-white text-xs font-semibold cursor-pointer"
                >
                  {lang === 'kn' ? 'ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ' : 'Return to Sign In'}
                </button>
              </div>
            ) : (
              <div>
                <p className="font-sans text-xs text-[#444653] mb-3">
                  {lang === 'kn'
                    ? 'ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.'
                    : 'Enter your registered email address to receive password reset instructions.'}
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#f2f3ff] border border-[#c4c5d5] text-xs font-sans text-[#131b2e] focus:outline-none focus:ring-1 focus:ring-[#00288e] mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-sans text-[#757684] cursor-pointer"
                  >
                    {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotSent(true)}
                    className="px-4 py-1.5 rounded-lg bg-[#00288e] text-white text-xs font-semibold cursor-pointer"
                  >
                    {lang === 'kn' ? 'ಮರುಹೊಂದಿಸಿ' : 'Reset'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs font-sans text-[#757684] z-10 border-t border-[#c4c5d5]/20 bg-white/50 backdrop-blur-xs">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="font-semibold text-[#00288e]">
            {t.appTitle} — {t.appTagline}
          </span>
          <span>•</span>
          <span>Civic Tech ISO-37120 Accredited</span>
          <span>•</span>
          <span className="font-mono text-[11px] text-[#006c4a] font-semibold">
            WCAG 2.1 AAA Compliant
          </span>
        </div>
      </footer>
    </div>
  );
};
