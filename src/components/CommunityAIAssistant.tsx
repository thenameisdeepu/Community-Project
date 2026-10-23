import React, { useState, useRef, useEffect } from 'react';
import { Language, UserProfile, Role, Issue } from '../types';
import { api } from '../services/api';

interface CommunityAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUser: UserProfile | null;
  userRole: Role;
  onIssueCreated?: (newIssue: Issue) => void;
  onOpenReportModalWithData?: (prefill: { title?: string; category?: string; location?: string; description?: string }) => void;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  structuredAnalysis?: any;
}

export const CommunityAIAssistant: React.FC<CommunityAIAssistantProps> = ({
  isOpen,
  onClose,
  lang,
  currentUser,
  userRole,
  onIssueCreated,
  onOpenReportModalWithData,
}) => {
  const isKn = lang === 'kn';
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      text: isKn
        ? 'ನಮಸ್ಕಾರ! ನಾನು ಕಮ್ಯುನಿಟಿ AI (CommUnity AI) - ನಿಮ್ಮ ಅಧಿಕೃತ ಸಮುದಾಯ ಸಮಸ್ಯೆ ಸಹಾಯಕ. "ನೋಡಿ. ವರದಿ ಮಾಡಿ. ಪರಿಹರಿಸಿ." (See It. Report It. Solve It.) ನೀವು ನೈಸರ್ಗಿಕ ಭಾಷೆಯಲ್ಲಿ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಬಹುದು, ತುರ್ತುಸ್ಥಿತಿಯನ್ನು (P1-P4) ಪರಿಶೀಲಿಸಬಹುದು ಅಥವಾ ನಿಮ್ಮ ದೂರುಗಳ ಸ್ಥಿತಿಯನ್ನು ವಿಚಾರಿಸಬಹುದು.'
        : 'Hello! I am CommUnity AI, the intelligent assistance engine for the CommUnity platform.\n\n"See It. Report It. Solve It."\n\nI can help you convert natural language descriptions into structured reports, categorize problems, assess urgency (P1–P4), detect duplicate complaints, and explain verified platform status. How can I help you today?',
      timestamp: 'Just now',
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittingIssueId, setSubmittingIssueId] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth exit animation state so closing the assistant is gentle and not instantaneous
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When user toggles language, dynamically update initial greeting if user hasn't chatted yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [
          {
            id: 'msg-0',
            sender: 'ai',
            text: isKn
              ? 'ನಮಸ್ಕಾರ! ನಾನು ಕಮ್ಯುನಿಟಿ AI (CommUnity AI) - ನಿಮ್ಮ ಅಧಿಕೃತ ಸಮುದಾಯ ಸಮಸ್ಯೆ ಸಹಾಯಕ. "ನೋಡಿ. ವರದಿ ಮಾಡಿ. ಪರಿಹರಿಸಿ." (See It. Report It. Solve It.) ನೀವು ಕನ್ನಡದಲ್ಲಿ ಯಾವುದೇ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಬಹುದು, ತುರ್ತುಸ್ಥಿತಿಯನ್ನು (P1-P4) ಪರಿಶೀಲಿಸಬಹುದು ಅಥವಾ ನಿಮ್ಮ ದೂರುಗಳ ಸ್ಥಿತಿಯನ್ನು ವಿಚಾರಿಸಬಹುದು. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
              : 'Hello! I am CommUnity AI, the intelligent assistance engine for the CommUnity platform.\n\n"See It. Report It. Solve It."\n\nI can help you convert natural language descriptions into structured reports, categorize problems, assess urgency (P1–P4), detect duplicate complaints, and explain verified platform status. How can I help you today?',
            timestamp: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [lang, isKn]);

  if (!shouldRender) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);
    setSubmissionSuccess(null);

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        content: m.text,
      }));

      const res = await api.chatWithAI(conversationHistory, currentUser, userRole, lang);

      const aiMessage: ChatMessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredAnalysis: res.structuredAnalysis || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('CommUnity AI Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: isKn
            ? 'ಕ್ಷಮಿಸಿ, ಸಂದೇಶವನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.'
            : 'CommUnity AI encountered a communication error. Please try again or use the direct intake form.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSubmitFromAI = async (analysis: any) => {
    if (!analysis) return;
    setSubmittingIssueId(analysis.title || 'active');

    // Map CommUnity AI category to system category
    let cat = 'Other';
    const c = (analysis.category || '').toLowerCase();
    if (c.includes('water')) cat = 'Plumbing';
    else if (c.includes('light') || c.includes('electric')) cat = 'Electrical';
    else if (c.includes('waste') || c.includes('sanitation')) cat = 'Waste';
    else if (c.includes('internet') || c.includes('connect')) cat = 'Internet';
    else if (c.includes('road') || c.includes('footpath')) cat = 'Damaged Infra';
    else if (c.includes('safety') || c.includes('security')) cat = 'Safety';
    else if (c.includes('building') || c.includes('facility')) cat = 'Elevator';

    // Map priority P1-P4 to Severity
    let sev: any = 'Medium';
    if (analysis.priority === 'P1') sev = 'Critical';
    else if (analysis.priority === 'P2') sev = 'Hazard / High';
    else if (analysis.priority === 'P4') sev = 'Low';

    const locationStr = analysis.location || 'Greenwood Campus Quad';
    const zoneStr = locationStr.includes('Hostel')
      ? 'Sector 4'
      : locationStr.includes('Science')
      ? 'Science Wing'
      : locationStr.includes('Library')
      ? 'Sector 3'
      : 'Sector 4';

    const newIssuePayload: Partial<Issue> = {
      category: cat as any,
      categoryIcon: cat === 'Plumbing' ? 'plumbing' : cat === 'Electrical' ? 'lightbulb' : 'build',
      title: analysis.title || 'Community Issue logged via CommUnity AI',
      description: `${analysis.description || ''}\n\n[CommUnity AI Triage: ${analysis.priority || 'P3'} — ${analysis.priority_reason || 'Verified via community rules'}. Safety Risk: ${analysis.safety_risk || 'Standard'}]`,
      location: locationStr,
      zone: zoneStr,
      severity: sev,
      status: 'Reported',
      reportedBy: currentUser ? `${currentUser.name} (${currentUser.roleTitle})` : 'Resident Dr. Sharma',
      reportedByEmail: currentUser?.email,
      reportedById: currentUser?.id,
      submittedTime: 'Just now',
      updatedTime: 'Just now',
      timeline: [
        {
          time: 'Just now',
          title: `Reported via CommUnity AI (${analysis.priority})`,
          subtitle: `Category: ${analysis.category} • Urgency: ${analysis.priority}`,
          completed: true,
        },
      ],
    };

    try {
      const created = await api.createIssue(newIssuePayload);
      if (onIssueCreated) onIssueCreated(created);
      setSubmissionSuccess(created.id || 'Submitted');

      // Append confirmation message from AI
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-confirm-${Date.now()}`,
          sender: 'ai',
          text: isKn
            ? `✅ **ದೂರು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದೆ!**\n\nನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಗ್ರೀನ್‌ವುಡ್ ಪುರಸಭೆಯ ರವಾನೆ ಗ್ರಿಡ್‌ನಲ್ಲಿ ಔಪಚಾರಿಕವಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.\n\n- **ಟ್ರ್ಯಾಕಿಂಗ್ ಐಡಿ (Tracking ID)**: \`${created.id}\`\n- **ವಿಭಾಗ (Category)**: ${analysis.category}\n- **ಆದ್ಯತೆ (Priority)**: ${analysis.priority}\n- **ಸ್ಥಳ (Location)**: ${locationStr}\n\nಕ್ಷೇತ್ರ ದುರಸ್ತಿ ಸಿಬ್ಬಂದಿಯನ್ನು ನಿಯೋಜಿಸಿದಂತೆ ನಿಮಗೆ ನೈಜ-ಸಮಯದ ನವೀಕರಣಗಳು ಲಭ್ಯವಾಗುತ್ತವೆ.`
            : `✅ **Verified Report Registered!**\n\nYour issue has been formally registered into the Greenwood University Municipal Dispatch Grid.\n\n- **Tracking ID**: \`${created.id}\`\n- **Category**: ${analysis.category}\n- **Priority Assigned**: ${analysis.priority}\n- **Location**: ${locationStr}\n\nUnder our transparency protocols, you will receive real-time updates as field crews are deployed.`,
          timestamp: 'Just now',
        },
      ]);
    } catch (err) {
      console.error('Failed to submit issue from AI:', err);
    } finally {
      setSubmittingIssueId(null);
    }
  };

  const quickPrompts = isKn
    ? [
        { label: '💧 ಸೈನ್ಸ್ ವಿಂಗ್‌ನಲ್ಲಿ ನೀರಿನ ಸೋರಿಕೆ', prompt: 'ಸೈನ್ಸ್ ವಿಂಗ್ ಶೌಚಾಲಯ 204 ಬಳಿ 2 ನೇ ಮಹಡಿಯ ಕಾರಿಡಾರ್‌ನಲ್ಲಿ ನೀರಿನ ಪೈಪ್ ಒಡೆದು ನೀರು ಹರಿಯುತ್ತಿದೆ.' },
        { label: '💡 ಹಾಸ್ಟೆಲ್ ಸಿ ಬಳಿ ಬೀದಿದೀಪ ಮಿನುಗುತ್ತಿದೆ', prompt: 'ಹಾಸ್ಟೆಲ್ ಬ್ಲಾಕ್ ಸಿ ಬಳಿಯ ಬೀದಿದೀಪ ಕಂಬ ಸಿ-12 ಮಿನುಗುತ್ತಿದೆ ಮತ್ತು ರಾತ್ರಿ ಆಫ್ ಆಗುತ್ತದೆ.' },
        { label: '⚠️ ತೆರೆದ ವಿದ್ಯುತ್ ತಂತಿ ಅಪಾಯ (P1)', prompt: 'ಈಸ್ಟ್ ಗೇಟ್ ಮಾರ್ಗದ ಬಳಿ ತೆರೆದ ವಿದ್ಯುತ್ ತಂತಿಯಿಂದ ಕಿಡಿಗಳು ಬರುತ್ತಿವೆ, ಇದು ತುರ್ತು ಅಪಾಯ.' },
        { label: '📋 ನನ್ನ ದೂರುಗಳ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ', prompt: 'ನಾನು ದಾಖಲಿಸಿದ ದೂರುಗಳ ಪ್ರಸ್ತುತ ದುರಸ್ತಿ ಮತ್ತು ಪರಿಶೀಲನೆ ಸ್ಥಿತಿ ಏನು?' },
        { label: '🛡️ ಗೌಪ್ಯತೆ ಮತ್ತು ರಕ್ಷಣೆ ನಿಯಮಗಳು', prompt: 'CommUnity AI ನನ್ನ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ ಮತ್ತು ದೂರಿನ ಗೌಪ್ಯತೆಯನ್ನು ಹೇಗೆ ರಕ್ಷಿಸುತ್ತದೆ?' },
      ]
    : [
        { label: '💧 Water leak in Science Wing', prompt: 'There is a severe water leak flooding the 2nd floor corridor near Science Wing washroom 204.' },
        { label: '💡 Streetlight flickering near Hostel C', prompt: 'Streetlight pole C-12 near Hostel Block C is flickering and goes dark at night.' },
        { label: '⚠️ Exposed live wire hazard (P1)', prompt: 'There is an exposed live electrical wire sparking near the East Gate pathway.' },
        { label: '📋 Status of my complaints', prompt: 'What is the current verification and repair status of my reported issues?' },
        { label: '🛡️ Privacy & Confidentiality rules', prompt: 'How does CommUnity AI protect my personal information and complaint privacy?' },
      ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0c1322]/60 backdrop-blur-xs transition-opacity duration-400 ease-out ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in fade-in duration-200'
      }`}
    >
      <div
        className={`bg-white w-full max-w-2xl h-[92vh] max-h-[760px] rounded-2xl shadow-2xl border border-[#c4c5d5]/40 flex flex-col overflow-hidden transition-all duration-400 ease-out ${
          isClosing ? 'opacity-0 scale-95 translate-y-3' : 'opacity-100 scale-100 translate-y-0 animate-in zoom-in-95 duration-150'
        }`}
      >
        {/* Assistant Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#00288e] via-[#1e40af] to-[#4f378b] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/25 shadow-inner">
              <span className="material-symbols-outlined text-[24px] text-[#ffdcc3]">
                psychology
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-extrabold text-base tracking-tight">
                  CommUnity AI
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#82f5c1]/25 text-[#82f5c1] border border-[#82f5c1]/40">
                  LLM • Gemini 3.8 Flash
                </span>
              </div>
              <p className="font-mono text-[11px] text-white/80">
                {isKn ? 'ನೋಡಿ. ವರದಿ ಮಾಡಿ. ಪರಿಹರಿಸಿ.' : '"See It. Report It. Solve It."'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block font-mono text-[10px] text-white/70 bg-white/10 px-2 py-1 rounded">
              {userRole === 'community'
                ? isKn ? 'ನಿವಾಸಿ ಗೌಪ್ಯತೆ ಸಕ್ರಿಯ' : 'Resident Privacy Active'
                : 'Admin Oversight Mode'}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close CommUnity AI"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Safety & Confidentiality Bar */}
        <div className="px-4 py-2 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between text-xs font-mono text-[#444653]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[15px] text-[#00288e]">
              verified_user
            </span>
            <span className="truncate">
              {userRole === 'community'
                ? isKn
                  ? 'ನಿಮ್ಮ ಸ್ವಂತ ದೂರುಗಳ ಡೇಟಾವನ್ನು ಮಾತ್ರ AI ಪ್ರವೇಶಿಸುತ್ತದೆ.'
                  : 'Confidential Session: CommUnity AI accesses only your personal filed issues.'
                : 'Administrator Triage: Full verified platform ledger accessible for analysis.'}
            </span>
          </div>
          <span className="text-[10px] text-[#757684] shrink-0 font-semibold">
            P1-P4 Urgency Matrix
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-[#f8f9ff]/50 to-white dark:from-[#0b1120] dark:to-[#111827]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-xs font-sans shadow-xs transition-all ${
                  msg.sender === 'user'
                    ? 'bg-[#00288e] text-white rounded-tr-xs'
                    : 'bg-white border border-[#c4c5d5]/40 text-[#131b2e] rounded-tl-xs shadow-sm'
                }`}
              >
                {/* AI Assistant Avatar / Name Badge */}
                {msg.sender === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#eaedff]">
                    <span className="material-symbols-outlined text-[16px] text-[#00288e]">
                      smart_toy
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#00288e] uppercase tracking-wider">
                      CommUnity AI Assistant
                    </span>
                    <span className="text-[10px] text-[#757684] ml-auto font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Message Text with simple line breaks & markdown bold formatting */}
                <div className="leading-relaxed whitespace-pre-wrap break-words">
                  {msg.text}
                </div>

                {/* Structured Issue Analysis Card if provided by Section 14 */}
                {msg.structuredAnalysis && msg.structuredAnalysis.intent === 'report_issue' && (
                  <div className="mt-3.5 p-3.5 bg-[#f8f9ff] rounded-xl border border-[#00288e]/20 space-y-2 text-[#131b2e]">
                    <div className="flex items-center justify-between gap-2 border-b border-[#eaedff] pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-[#00288e]">
                          assignment
                        </span>
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#00288e]">
                          Structured Issue Intake
                        </span>
                      </div>

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase ${
                          msg.structuredAnalysis.priority === 'P1'
                            ? 'bg-[#ba1a1a] text-white animate-pulse'
                            : msg.structuredAnalysis.priority === 'P2'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : msg.structuredAnalysis.priority === 'P3'
                            ? 'bg-[#e2e7ff] text-[#00288e]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {msg.structuredAnalysis.priority} • {msg.structuredAnalysis.priority === 'P1' ? 'CRITICAL' : msg.structuredAnalysis.priority === 'P2' ? 'HIGH' : msg.structuredAnalysis.priority === 'P3' ? 'MEDIUM' : 'LOW'}
                      </span>
                    </div>

                    <div className="font-sans font-bold text-xs text-[#131b2e]">
                      {msg.structuredAnalysis.title || 'Untitled Community Issue'}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-[#757684]">Category: </span>
                        <strong className="text-[#00288e]">{msg.structuredAnalysis.category}</strong>
                      </div>
                      <div>
                        <span className="text-[#757684]">Location: </span>
                        <strong className="text-[#131b2e]">
                          {msg.structuredAnalysis.location || 'Pending specific room/landmark'}
                        </strong>
                      </div>
                    </div>

                    {msg.structuredAnalysis.priority_reason && (
                      <p className="text-[11px] font-sans text-[#444653] bg-white p-2 rounded border border-[#eaedff]">
                        <strong>Priority Rule: </strong>
                        {msg.structuredAnalysis.priority_reason}
                      </p>
                    )}

                    {/* Safety Risk & Next Steps */}
                    {msg.structuredAnalysis.suggested_next_action && (
                      <div className="text-[11px] font-sans text-[#006c4a] bg-[#82f5c1]/20 p-2 rounded flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">
                          health_and_safety
                        </span>
                        <div>
                          <strong>Recommended Next Action: </strong>
                          {msg.structuredAnalysis.suggested_next_action}
                        </div>
                      </div>
                    )}

                    {/* Duplicate Alerts */}
                    {msg.structuredAnalysis.possible_duplicates && msg.structuredAnalysis.possible_duplicates.length > 0 && (
                      <div className="text-[11px] font-mono text-[#ba1a1a] bg-[#ffdad6]/40 p-2 rounded flex items-start gap-1.5 border border-[#ba1a1a]/20">
                        <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">
                          content_copy
                        </span>
                        <div>
                          <strong>Possible Existing Reports: </strong>
                          {msg.structuredAnalysis.possible_duplicates.map((dup: any) => (
                            <div key={dup.id} className="mt-0.5">
                              • #{dup.id}: {dup.title} ({dup.similarityReason})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Direct Action Buttons */}
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={submittingIssueId !== null}
                        onClick={() => handleDirectSubmitFromAI(msg.structuredAnalysis)}
                        className="flex-1 py-2 px-3 bg-[#00288e] hover:bg-[#001d68] text-white rounded-lg text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">send</span>
                        <span>
                          {submittingIssueId
                            ? (isKn ? 'ದಾಖಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Registering in Dispatch...')
                            : (isKn ? 'ಈ ದೂರನ್ನು ನೇರವಾಗಿ ರವಾನೆ ಸೇವೆಗೆ ಸಲ್ಲಿಸಿ' : 'Submit This Issue to Campus Dispatch')}
                        </span>
                      </button>

                      {onOpenReportModalWithData && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenReportModalWithData({
                              title: msg.structuredAnalysis.title,
                              category: msg.structuredAnalysis.category,
                              location: msg.structuredAnalysis.location,
                              description: msg.structuredAnalysis.description,
                            });
                            onClose();
                          }}
                          className="py-2 px-3 bg-white hover:bg-gray-50 border border-[#c4c5d5] text-[#131b2e] rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer"
                        >
                          {isKn ? 'ಫಾರ್ಮ್‌ನಲ್ಲಿ ತಿದ್ದುಪಡಿ' : 'Edit in Form'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#c4c5d5]/30 shadow-xs max-w-sm">
              <span className="material-symbols-outlined text-[18px] text-[#00288e] animate-spin">
                sync
              </span>
              <span className="font-mono text-xs text-[#444653]">
                {isKn ? 'ಕಮ್ಯುನಿಟಿ AI ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...' : 'CommUnity AI is analyzing your issue...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#f8f9ff] border-t border-[#eaedff] flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="font-mono text-[10px] text-[#757684] uppercase font-bold shrink-0">
            {isKn ? 'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:' : 'Quick Prompts:'}
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#eaedff] text-[#00288e] border border-[#00288e]/20 text-[11px] font-sans font-medium shrink-0 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Chat Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 bg-white border-t border-[#c4c5d5]/30 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              isKn
                ? 'ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ (ಉದಾ: ಸೈನ್ಸ್ ವಿಭಾಗದಲ್ಲಿ ಪೈಪ್ ಒಡೆದು ನೀರು ಹರಿಯುತ್ತಿದೆ...)'
                : 'Describe an issue (e.g., Burst water pipe near Science Wing 204 causing flooding...)'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#f2f3ff] border border-[#c4c5d5]/50 text-xs font-sans text-[#131b2e] placeholder:text-[#757684] focus:outline-none focus:ring-2 focus:ring-[#00288e] focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-[#00288e] hover:bg-[#001d68] text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{isKn ? 'ಕಳುಹಿಸಿ' : 'Send'}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
          </button>
        </form>
      </div>
    </div>
  );
};
