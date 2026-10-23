import React from 'react';
import { Language } from '../types';

interface PasswordRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  password?: string;
  lang?: Language;
}

export const PasswordRulesModal: React.FC<PasswordRulesModalProps> = ({
  isOpen,
  onClose,
  password = '',
  lang = 'en',
}) => {
  if (!isOpen) return null;

  const hasLength = password.length >= 8;
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const commonWeak = [
    'password',
    'password123',
    '12345678',
    'qwertyuiop',
    'admin1234',
    'neighbrly123',
    '123456789',
    'welcome123',
  ];
  const isNotCommon = !commonWeak.includes(password.toLowerCase()) && password.length > 0;

  const rules = [
    {
      id: 'length',
      label: lang === 'kn' ? 'ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು (Minimum 8 characters)' : 'Minimum 8 characters',
      subtext: lang === 'kn' ? '8 ಅಥವಾ ಹೆಚ್ಚಿನ ಅಕ್ಷರಗಳು' : 'Password must contain at least 8 characters',
      satisfied: hasLength,
    },
    {
      id: 'special',
      label:
        lang === 'kn'
          ? 'ಕನಿಷ್ಠ 1 ವಿಶೇಷ ಅಕ್ಷರ (@, #, $, ಅಥವಾ !)'
          : 'At least 1 special character, such as @, #, $, or !',
      subtext: lang === 'kn' ? '@, #, $, !, %, &, * ಚಿಹ್ನೆಗಳು' : 'Symbols such as @, #, $, !, %, &, *',
      satisfied: hasSpecial,
    },
    {
      id: 'letter',
      label: lang === 'kn' ? 'ಕನಿಷ್ಠ 1 ಅಕ್ಷರ (At least 1 letter)' : 'At least 1 letter',
      subtext: lang === 'kn' ? 'ದೊಡ್ಡಕ್ಷರ ಅಥವಾ ಸಣ್ಣಕ್ಷರ (A-Z, a-z)' : 'Uppercase or lowercase alphabetical letter',
      satisfied: hasLetter,
    },
    {
      id: 'number',
      label: lang === 'kn' ? 'ಕನಿಷ್ಠ 1 ಸಂಖ್ಯೆ (At least 1 number)' : 'At least 1 number',
      subtext: lang === 'kn' ? 'ಸಂಖ್ಯಾ ಅಂಕಿಗಳು (0-9)' : 'Numerical digits 0 through 9',
      satisfied: hasNumber,
    },
    {
      id: 'notCommon',
      label:
        lang === 'kn'
          ? 'ಸಾಮಾನ್ಯ ಅಥವಾ ಸುಲಭವಾಗಿ ಊಹಿಸಬಹುದಾದ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ತಪ್ಪಿಸಿ'
          : 'Avoid common or easily guessed passwords',
      subtext:
        lang === 'kn'
          ? "'password123', '12345678' ನಂತಹ ದುರ್ಬಲ ಪಾಸ್‌ವರ್ಡ್‌ಗಳನ್ನು ತಪ್ಪಿಸಿ"
          : "Avoid 'password123', '12345678', or predictable phrases",
      satisfied: isNotCommon,
    },
    {
      id: 'neverShare',
      label:
        lang === 'kn'
          ? 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ'
          : 'Never share your password with anyone',
      subtext:
        lang === 'kn'
          ? 'ನೈಬರ್ಲಿ ಸಿಬ್ಬಂದಿ ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಎಂದಿಗೂ ಕೇಳುವುದಿಲ್ಲ'
          : 'Neighbrly administrators or technicians will never ask for your password',
      satisfied: true,
      isNotice: true,
    },
  ];

  const coreSatisfiedCount = [hasLength, hasSpecial, hasLetter, hasNumber].filter(Boolean).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-rules-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131b2e]/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-[#c4c5d5]/40 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#00288e] to-[#1e40af] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-[20px] text-white">lock_reset</span>
            </div>
            <div>
              <h2 id="password-rules-title" className="font-sans font-bold text-base leading-tight">
                {lang === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ನಿಯಮಗಳು' : 'Password Rules'}
              </h2>
              <p className="font-sans text-[11px] text-white/80">
                {lang === 'kn' ? 'ನೈಬರ್ಲಿ ಖಾತೆಯ ಭದ್ರತಾ ಮಾನದಂಡಗಳು' : 'Neighbrly account security guidelines'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rules"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Live score banner */}
        <div className="px-5 py-3 bg-[#f2f3ff] border-b border-[#c4c5d5]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#131b2e]">
              {lang === 'kn' ? 'ಅಗತ್ಯತೆಗಳು:' : 'Requirements Met:'}
            </span>
            <span className="px-2 py-0.5 rounded-full font-mono text-[11px] font-bold bg-[#00288e] text-white">
              {coreSatisfiedCount} / 4
            </span>
          </div>
          <div className="w-28 bg-[#c4c5d5]/40 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                coreSatisfiedCount === 4
                  ? 'bg-[#006c4a]'
                  : coreSatisfiedCount >= 2
                  ? 'bg-[#9a6b00]'
                  : 'bg-[#ba1a1a]'
              }`}
              style={{ width: `${(coreSatisfiedCount / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Rules Checklist */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {rules.map((rule) => {
            const isOk = rule.satisfied;
            return (
              <div
                key={rule.id}
                className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                  rule.isNotice
                    ? 'bg-[#fff8f2] border-[#ffb870]/40'
                    : isOk
                    ? 'bg-[#f0fbf5] border-[#a3e5bf]'
                    : 'bg-[#fafafa] border-[#e2e4ed]'
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {rule.isNotice ? (
                    <span className="material-symbols-outlined text-[#b96800] text-[18px]">
                      info
                    </span>
                  ) : isOk ? (
                    <span className="material-symbols-outlined text-[#006c4a] text-[18px]">
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[#757684] text-[18px]">
                      radio_button_unchecked
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-sans text-xs font-semibold ${
                      rule.isNotice
                        ? 'text-[#6e3900]'
                        : isOk
                        ? 'text-[#004d33]'
                        : 'text-[#444653]'
                    }`}
                  >
                    {rule.label}
                  </div>
                  <div className="font-sans text-[11px] text-[#757684] mt-0.5">
                    {rule.subtext}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Privacy Security Notice */}
          <div className="p-3.5 bg-[#eaedff] border border-[#00288e]/20 rounded-xl flex items-start gap-2.5 text-xs text-[#00288e]">
            <span className="material-symbols-outlined text-[18px] shrink-0 text-[#00288e]">
              shield
            </span>
            <div className="font-sans text-[11px] leading-relaxed">
              <strong>{lang === 'kn' ? 'ಗಮನಿಸಿ:' : 'Security Notice:'}</strong>{' '}
              {lang === 'kn'
                ? 'ನಿಮ್ಮ ಜಿಮೇಲ್, ಯಾಹೂ ಅಥವಾ ಔಟ್‌ಲುಕ್ ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಎಂದಿಗೂ ಬಳಸಬೇಡಿ. ನೈಬರ್ಲಿಗಾಗಿ ಪ್ರತ್ಯೇಕ ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ.'
                : 'Never enter your Google, Yahoo, or Microsoft email password. Create a unique password specifically for Neighbrly.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f2f3ff] border-t border-[#c4c5d5]/30 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00288e] text-white text-xs font-semibold hover:bg-[#1e40af] transition-all shadow-xs cursor-pointer"
          >
            {lang === 'kn' ? 'ಅರ್ಥವಾಯಿತು' : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
};
