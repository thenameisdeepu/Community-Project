import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';

interface FloatingAIAssistantButtonProps {
  onClick: () => void;
  isOpen: boolean;
  currentTab?: string;
  lang?: Language;
}

// Relaxed hysteresis scroll thresholds
const COLLAPSE_THRESHOLD = 250; // Only collapse after user scrolls down >= 250px
const EXPAND_THRESHOLD = 80;    // Expand when user scrolls back up near top (< 80px)

export const FloatingAIAssistantButton: React.FC<FloatingAIAssistantButtonProps> = ({
  onClick,
  isOpen,
  currentTab,
  lang = 'en',
}) => {
  const isKn = lang === 'kn';

  // State
  const [isScrolledDown, setIsScrolledDown] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const rafIdRef = useRef<number | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up any old legacy pin preference from previous versions
  useEffect(() => {
    try {
      localStorage.removeItem('neighbrly_ai_button_pinned');
    } catch {
      // ignore storage errors
    }
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Check scroll position across all possible scrolling parents (window, documentElement, body, or main container)
  const evaluateScroll = useCallback(() => {
    const winScroll =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const mainEl = document.querySelector('main');
    const mainScroll = mainEl ? mainEl.scrollTop : 0;

    const currentScroll = Math.max(winScroll, mainScroll);

    // Hysteresis: only toggle when crossing unambiguous boundaries
    setIsScrolledDown((prev) => {
      if (!prev && currentScroll > COLLAPSE_THRESHOLD) {
        return true; // Collapse after deep scroll
      }
      if (prev && currentScroll < EXPAND_THRESHOLD) {
        return false; // Restore when returned near top
      }
      return prev; // Maintain current state between 80px and 250px
    });
  }, []);

  // Passive throttled scroll listener using requestAnimationFrame for smooth performance
  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) return;
      rafIdRef.current = window.requestAnimationFrame(() => {
        evaluateScroll();
        rafIdRef.current = null;
      });
    };

    // Evaluate initially on mount
    evaluateScroll();

    // Capture mode ensures scroll events from any nested scrollable container are handled
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleScroll);
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [evaluateScroll]);

  // Re-check scroll state when switching routes or tabs
  useEffect(() => {
    const timer = setTimeout(() => {
      evaluateScroll();
    }, 60);
    return () => clearTimeout(timer);
  }, [currentTab, evaluateScroll]);

  // Gentle hover handlers with graceful exit delay so the button closes slowly and never snaps shut
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Slower, graceful closing delay so button does not abruptly vanish when cursor leaves
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverTimeoutRef.current = null;
    }, 280);
  };

  // Determine expansion: expanded at top of page (< 250px) or on temporary desktop hover/focus
  const isExpanded = !isScrolledDown || isHovered || isFocused;
  const isCompact = !isExpanded;

  // Premium, relaxed easing transitions (880ms for closing transition so it feels calm and luxurious)
  const smoothTransitionStyle: React.CSSProperties = {
    transition: isExpanded
      ? 'width 650ms cubic-bezier(0.16, 1, 0.3, 1), height 650ms cubic-bezier(0.16, 1, 0.3, 1), padding 650ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 650ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 650ms cubic-bezier(0.16, 1, 0.3, 1)'
      : 'width 880ms cubic-bezier(0.22, 1, 0.36, 1), height 880ms cubic-bezier(0.22, 1, 0.36, 1), padding 880ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 880ms cubic-bezier(0.22, 1, 0.36, 1), transform 880ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 880ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const smoothLabelStyle: React.CSSProperties = {
    transition: isExpanded
      ? 'max-width 650ms cubic-bezier(0.16, 1, 0.3, 1), opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) 80ms, margin 650ms cubic-bezier(0.16, 1, 0.3, 1)'
      : 'max-width 850ms cubic-bezier(0.22, 1, 0.36, 1), opacity 680ms cubic-bezier(0.22, 1, 0.36, 1), margin 850ms cubic-bezier(0.22, 1, 0.36, 1)',
  };

  return (
    <div
      className={`fixed z-40 select-none motion-reduce:transition-none ${
        isOpen
          ? 'opacity-0 pointer-events-none scale-90 translate-y-3'
          : 'opacity-100 scale-100 translate-y-0'
      }`}
      style={{
        bottom: 'max(1.5rem, calc(1rem + env(safe-area-inset-bottom, 0px)))',
        right: 'max(1.5rem, calc(1rem + env(safe-area-inset-right, 0px)))',
        transition: 'opacity 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div
        className="relative flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={onClick}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={
            isKn
              ? 'ಕಮ್ಯುನಿಟಿ AI ಸಹಾಯಕವನ್ನು ತೆರೆಯಿರಿ (CommUnity AI)'
              : 'Open CommUnity AI Assistant'
          }
          aria-expanded={isOpen}
          title={
            isCompact
              ? isKn
                ? 'ಕಮ್ಯುನಿಟಿ AI ಸಹಾಯಕ — ತೆರೆಯಲು ಕ್ಲಿಕ್ ಮಾಡಿ'
                : 'CommUnity AI Assistant — Click to open'
              : isKn
              ? 'ಕಮ್ಯುನಿಟಿ AI — "ನೋಡಿ. ವರದಿ ಮಾಡಿ. ಪರಿಹರಿಸಿ."'
              : 'CommUnity AI Assistant — "See It. Report It. Solve It."'
          }
          style={smoothTransitionStyle}
          className={`group relative flex items-center bg-gradient-to-r from-[#00288e] to-[#4f378b] hover:from-[#001d68] hover:to-[#3b276b] text-white shadow-xl hover:shadow-2xl border border-white/20 active:scale-95 cursor-pointer rounded-full motion-reduce:transition-none focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#00288e] ${
            isExpanded
              ? 'h-13 px-4.5 py-2.5'
              : 'w-[54px] h-[54px] p-0 justify-center'
          }`}
        >
          {/* AI Psychology Brain Icon */}
          <span
            className={`material-symbols-outlined text-[#ffdcc3] group-hover:rotate-12 transition-transform shrink-0 ${
              isExpanded ? 'text-[21px]' : 'text-[24px]'
            }`}
          >
            psychology
          </span>

          {/* Smooth Collapsible Label Container */}
          <div
            style={smoothLabelStyle}
            className={`flex items-center gap-2 overflow-hidden whitespace-nowrap motion-reduce:transition-none ${
              isExpanded
                ? 'max-w-[180px] opacity-100 ml-2.5'
                : 'max-w-0 opacity-0 ml-0 pointer-events-none'
            }`}
          >
            <span className="font-sans font-bold text-xs tracking-wide">
              CommUnity AI
            </span>

            {/* Pulsing Live Operational Status Indicator */}
            <span
              className="w-2 h-2 rounded-full bg-[#82f5c1] animate-pulse shrink-0"
              title={isKn ? 'AI ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ' : 'AI Assistant Ready'}
            ></span>
          </div>

          {/* Floating Online Badge in Compact Circular Mode */}
          {isCompact && (
            <span
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#82f5c1] ring-2 ring-[#00288e] animate-pulse shadow-xs pointer-events-none"
              aria-hidden="true"
            ></span>
          )}
        </button>
      </div>
    </div>
  );
};
