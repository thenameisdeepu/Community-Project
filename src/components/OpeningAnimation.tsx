import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../types';

interface OpeningAnimationProps {
  lang: Language;
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({
  lang,
  onComplete,
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play a gentle chord if sound is enabled
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 harmony
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + idx * 0.08 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 1.3);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handleFinish = () => {
    setIsClosing(true);
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  useEffect(() => {
    // Stage sequencing
    const t1 = setTimeout(() => setPhase(1), 150); // Icon glow and beacon line
    const t2 = setTimeout(() => {
      setPhase(2); // Brand letters reveal
      if (soundEnabled) playChime();
    }, 700);
    const t3 = setTimeout(() => setPhase(3), 1500); // Tagline & pillars
    const t4 = setTimeout(() => setPhase(4), 2600); // Culmination pulse
    const t5 = setTimeout(() => handleFinish(), 3400); // Auto complete

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1.25;
      });
    }, 40);

    // Keyboard shortcut (Escape or Space to skip)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      playChime();
    }
  };

  const isKn = lang === 'kn';

  return (
    <div
      className={`fixed inset-0 z-9999 flex flex-col items-center justify-between overflow-hidden bg-[#050b1d] select-none transition-all duration-700 ${
        isClosing ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-label="Neighbrly opening animation"
    >
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-[#00288e]/35 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-[#006c4a]/25 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#82f5c1]/10 rounded-full blur-[100px]"></div>

        {/* Subtle Perspective Grid / Neighborhood Grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(#82f5c1 1px, transparent 1px), linear-gradient(90deg, #82f5c1 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            transform: 'perspective(600px) rotateX(45deg) translateY(120px)',
          }}
        ></div>

        {/* Ambient Ring Wave */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-[360px] h-[360px] rounded-full border border-[#82f5c1]/20 animate-ping opacity-25"></div>
          <div className="absolute inset-0 w-[520px] h-[520px] -m-20 rounded-full border border-[#c2d7ff]/15 animate-pulse"></div>
        </div>
      </div>

      {/* Top Header / Skip Controls */}
      <header className="w-full px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#82f5c1] animate-ping"></span>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#82f5c1]/90 font-bold">
            {isKn ? 'ಪರಿಚಯ ಪೋರ್ಟಲ್' : 'CIVIC LAUNCH'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 backdrop-blur-md text-xs font-mono transition-all"
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'Audio On' : 'Audio Off'}</span>
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md text-xs font-mono font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
          >
            <span>{isKn ? 'ದಾಖಲಿಸಿ / ಸ್ಕಿಪ್' : 'Enter Now'}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </header>

      {/* Center Cinematic Stage */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl z-20">
        {/* Animated Neighborhood Emblem */}
        <div
          className={`relative mb-8 transition-all duration-1000 transform ${
            phase >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'
          }`}
        >
          {/* Glowing Beacon Aura */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00288e] via-[#006c4a] to-[#82f5c1] rounded-3xl blur-2xl opacity-60 animate-pulse"></div>

          {/* Icon Container */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3 border-2 border-[#82f5c1]/60 flex items-center justify-center shadow-[0_0_50px_rgba(130,245,193,0.35)] backdrop-blur-xl">
            {/* SVG Neighbrly N-Shaped House Emblem */}
            <svg
              className="w-full h-full drop-shadow-md"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="openGreenGrad" x1="0.1" y1="0" x2="0.9" y2="1">
                  <stop offset="0%" stopColor="#2ad37a" />
                  <stop offset="35%" stopColor="#22c55e" />
                  <stop offset="75%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#006c4a" />
                </linearGradient>
                <linearGradient id="openNavyGrad" x1="0" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="#142442" />
                  <stop offset="100%" stopColor="#0a1526" />
                </linearGradient>
              </defs>

              <path
                d="M 24.5 75.5 C 24.5 78 26.5 80 29 80 H 33.5 C 35.5 80 36.5 78.5 36.5 76.5 V 45 L 50.5 34 V 28.5 L 38 19 C 36.5 18 34.5 18 33 19 L 24.5 27 Z"
                fill="url(#openNavyGrad)"
              />
              <path
                d="M 50.5 28.5 L 63 19 C 64.5 18 66.5 18 68 19 L 76.5 27 V 75.5 C 76.5 78 74.5 80 72 80 H 64 V 63.5 L 55 63.5 L 63.5 54.5 V 45 L 50.5 34 Z"
                fill="url(#openGreenGrad)"
              />
              <polygon points="55,63.5 64,63.5 64,54.5" fill="#023c26" />
              <rect x="45" y="47.5" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
              <rect x="51.6" y="47.5" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
              <rect x="45" y="54.1" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
              <rect x="51.6" y="54.1" width="4.2" height="4.2" rx="1.2" fill="#0e1e38" />
            </svg>

            {/* Corner civic spark dots */}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#82f5c1] shadow-[0_0_8px_#82f5c1]"></span>
            <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]"></span>
          </div>
        </div>

        {/* Website Brand Name: Neighbrly */}
        <div
          className={`overflow-hidden transition-all duration-1000 transform ${
            phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#82f5c1]"></span>
            <span className="font-mono text-[10px] tracking-wider text-[#c2d7ff] uppercase">
              {isKn ? 'ಕ್ಯಾಂಪಸ್ & ನೆರೆಹೊರೆ ಜಾಲ' : 'CIVIC & NEIGHBORHOOD NETWORK'}
            </span>
          </div>

          <h1
            className="font-sans font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-none inline-flex items-baseline justify-center select-none"
            aria-label="Neighbrly"
          >
            <span className="bg-gradient-to-r from-white via-[#f1f5f9] to-[#93c5fd] bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(0,40,142,0.6)]">
              Ne
            </span>
            <span className="relative inline-block leading-none">
              <span className="bg-gradient-to-r from-white via-[#f1f5f9] to-[#93c5fd] bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(0,40,142,0.6)]">
                ı
              </span>
              {/* Vibrant glowing emerald green dot on the 'i' in the logo */}
              <span
                className="absolute top-[0.06em] left-1/2 -translate-x-1/2 w-[0.22em] h-[0.22em] rounded-full bg-[#22c55e] shadow-[0_0_20px_#22c55e,0_0_8px_#82f5c1] animate-pulse"
                title="Green 'i' dot"
              />
            </span>
            <span className="bg-gradient-to-r from-white via-[#f1f5f9] to-[#93c5fd] bg-clip-text text-transparent drop-shadow-[0_10px_25px_rgba(0,40,142,0.6)]">
              ghbrly
            </span>
          </h1>

          {isKn && (
            <div className="font-sans text-xl sm:text-2xl font-bold text-[#82f5c1] mt-1">
              ನೈಬರ್ಲಿ
            </div>
          )}
        </div>

        {/* Divider with Center Glowing Gem */}
        <div
          className={`flex items-center justify-center gap-3 my-5 sm:my-6 w-full max-w-md transition-all duration-1000 ${
            phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#82f5c1]/60 to-[#82f5c1]"></div>
          <div className="w-2 h-2 rotate-45 bg-[#82f5c1] shadow-[0_0_10px_#82f5c1]"></div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#82f5c1]/60 to-[#82f5c1]"></div>
        </div>

        {/* Website Tagline: Better Neighbourhoods Start Here */}
        <div
          className={`transition-all duration-1000 delay-150 transform ${
            phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="font-sans text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-wide">
            Better Neighbourhoods Start Here
          </h2>

          {isKn && (
            <p className="font-sans text-base sm:text-lg text-[#82f5c1]/90 font-medium mt-1">
              ಉತ್ತಮ ನೆರೆಹೊರೆಗಳು ಇಲ್ಲಿಂದಲೇ ಪ್ರಾರಂಭವಾಗುತ್ತವೆ
            </p>
          )}

          <p className="font-sans text-xs sm:text-sm text-[#c2d7ff]/80 max-w-xl mx-auto mt-3 font-normal leading-relaxed">
            {isKn
              ? 'ಪರಿಶೀಲಿಸಿದ ನಿವಾಸಿ ವರದಿಗಳು, ನೈಜ ಸಮಯದ ದುರಸ್ತಿ ರವಾನೆ, ಮತ್ತು ಸಮುದಾಯ ಮೂಲಸೌಕರ್ಯದ ಪಾರದರ್ಶಕತೆ.'
              : 'Empowering verified residents, real-time civic dispatch, and collaborative neighborhood stewardship.'}
          </p>

          {/* Three Pillars Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 mt-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left">
              <span className="w-8 h-8 rounded-lg bg-[#00288e]/60 flex items-center justify-center text-[#82f5c1] shrink-0">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </span>
              <div>
                <span className="font-sans text-xs font-bold text-white block">
                  {isKn ? 'ನಿವಾಸಿ ಪರಿಶೀಲನೆ' : 'Resident Verified'}
                </span>
                <span className="font-mono text-[10px] text-[#c2d7ff]/70 block">
                  {isKn ? 'ನಿಖರ ಲೆಕ್ಕಪರಿಶೋಧನೆ' : 'Authentic reports'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left">
              <span className="w-8 h-8 rounded-lg bg-[#006c4a]/60 flex items-center justify-center text-[#82f5c1] shrink-0">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
              </span>
              <div>
                <span className="font-sans text-xs font-bold text-white block">
                  {isKn ? 'ತ್ವರಿತ ರವಾನೆ' : 'Real-Time Dispatch'}
                </span>
                <span className="font-mono text-[10px] text-[#c2d7ff]/70 block">
                  {isKn ? 'ವೇಗದ ಪರಿಹಾರ' : 'Fast SLA response'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-left">
              <span className="w-8 h-8 rounded-lg bg-[#1e40af]/60 flex items-center justify-center text-[#82f5c1] shrink-0">
                <span className="material-symbols-outlined text-[18px]">handshake</span>
              </span>
              <div>
                <span className="font-sans text-xs font-bold text-white block">
                  {isKn ? 'ಸಮುದಾಯ ವಿಶ್ವಾಸ' : 'Community Trust'}
                </span>
                <span className="font-mono text-[10px] text-[#c2d7ff]/70 block">
                  {isKn ? 'ಪಾರದರ್ಶಕ ಆಡಳಿತ' : 'Transparent oversight'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Progress & Action Dock */}
      <footer className="w-full max-w-xl px-6 py-6 flex flex-col items-center gap-3 z-20">
        {/* Glowing Progress bar */}
        <div className="w-full flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#82f5c1]/80">0%</span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm relative">
            <div
              className="h-full bg-gradient-to-r from-[#00288e] via-[#006c4a] to-[#82f5c1] rounded-full transition-all duration-75 relative"
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-xs opacity-70"></div>
            </div>
          </div>
          <span className="font-mono text-[10px] text-[#82f5c1] font-bold">
            {Math.min(100, Math.round(progress))}%
          </span>
        </div>

        <div className="flex items-center justify-between w-full text-[#c2d7ff]/60 font-mono text-[11px]">
          <span>Neighbrly v2.4 • Greenwood Sector 4</span>
          <button
            type="button"
            onClick={handleFinish}
            className="hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            {isKn ? 'ಲಾಗಿನ್ ಮುಂದುವರಿಸಿ (Esc)' : 'Continue to Portal (Esc)'}
          </button>
        </div>
      </footer>
    </div>
  );
};
