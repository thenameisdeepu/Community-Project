import { UserProfile, Issue, CampusStats, Role } from '../types';

const BASE_URL = '/api';

const baselineStats: CampusStats = {
  reportsLogged: 0,
  activeCrews: 0,
  resolvedAndVerified: 0,
  actionRequired: 0,
  onTimeSlaRate: null,
  avgFirstResponseMinutes: null,
  avgResolutionHours: null,
  citizenSatisfaction: null,
};

export const api = {
  // --- USERS / LOGIN ID DATASET ---
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${BASE_URL}/users?_ts=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        return data.users;
      }
    } catch (err) {
      console.warn('API /api/users unavailable:', err);
    }
    return [];
  },

  async createUser(userData: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create login account on backend');
    }
    return data.user;
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update account');
    }
    return data.user;
  },

  async deleteUser(id: string, email?: string): Promise<{ success: boolean; message?: string }> {
    const cleanId = (id || '').trim();
    const cleanEmail = (email || '').trim();

    if (!cleanId && !cleanEmail) {
      return { success: false, message: 'Valid User ID or Email is required for deletion.' };
    }

    let lastError = 'Failed to delete user account from backend database.';

    // Strategy 1: Dedicated POST /api/users/delete (Robust through all cloud proxies, reverse gateways, and HTTP/2)
    try {
      const postRes = await fetch(`${BASE_URL}/users/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        body: JSON.stringify({ id: cleanId, email: cleanEmail }),
        cache: 'no-store',
      });

      const data = await postRes.json().catch(() => ({}));
      if (postRes.ok && data.success) {
        return { success: true, message: data.message };
      }

      // If server returned specific business logic / permission error (e.g. 403, 404, 400), don't mask it
      if (data && data.message) {
        lastError = data.message;
        if (postRes.status === 403 || postRes.status === 400 || postRes.status === 404) {
          return { success: false, message: data.message };
        }
      }
    } catch (err: any) {
      console.warn('POST /api/users/delete failed, attempting REST DELETE fallback:', err);
      lastError = err?.message || lastError;
    }

    // Strategy 2: Body-less DELETE /api/users/:id using unique stable account ID
    try {
      const targetParam = encodeURIComponent(cleanId || cleanEmail);
      const delRes = await fetch(`${BASE_URL}/users/${targetParam}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        cache: 'no-store',
      });

      const data = await delRes.json().catch(() => ({}));
      if (delRes.ok && data.success) {
        return { success: true, message: data.message };
      }
      if (data && data.message) {
        lastError = data.message;
      }
    } catch (err: any) {
      console.error('REST DELETE fallback failed:', err);
      lastError = err?.message || lastError;
    }

    return {
      success: false,
      message: lastError,
    };
  },

  async login(email: string, password?: string): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid Login ID or Password');
    }
    return data.user;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    roleTitle?: string;
    department?: string;
    campusSector?: string;
    badgeId?: string;
  }): Promise<{ success: boolean; user: UserProfile; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      cache: 'no-store',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  // --- ISSUES DATASET ---
  async getIssues(): Promise<Issue[]> {
    try {
      const res = await fetch(`${BASE_URL}/issues`);
      if (res.ok) {
        const data = await res.json();
        return data.issues;
      }
    } catch (err) {
      console.warn('API /api/issues unavailable:', err);
    }
    return [];
  },

  async createIssue(issueData: Partial<Issue>): Promise<Issue> {
    try {
      const res = await fetch(`${BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      });
      const data = await res.json();
      if (res.ok) return data.issue;
    } catch (err) {
      console.warn('API /api/issues POST failed, fallback local creation:', err);
    }
    return issueData as Issue;
  },

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue> {
    try {
      const res = await fetch(`${BASE_URL}/issues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) return data.issue;
    } catch (err) {
      console.warn('API /api/issues PUT failed:', err);
    }
    return updates as Issue;
  },

  async deleteIssue(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/issues/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('API /api/issues DELETE failed:', err);
      return false;
    }
  },

  async deleteAllIssues(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/issues`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('API /api/issues bulk DELETE failed:', err);
      return false;
    }
  },

  // --- STATS ---
  async getStats(): Promise<CampusStats> {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      if (res.ok) {
        const data = await res.json();
        return data.stats;
      }
    } catch (err) {
      console.warn('API /api/stats unavailable:', err);
    }
    return baselineStats;
  },

  async updateStats(stats: Partial<CampusStats>): Promise<CampusStats> {
    try {
      const res = await fetch(`${BASE_URL}/stats`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
      const data = await res.json();
      if (res.ok) return data.stats;
    } catch (err) {
      console.warn('API /api/stats PUT failed:', err);
    }
    return baselineStats;
  },

  async resetDataset(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/reset-dataset`, { method: 'POST' });
      return res.ok;
    } catch (err) {
      console.warn('Reset dataset failed:', err);
      return false;
    }
  },

  // --- COMMUNITY AI ASSISTANT (LLM) ---
  async chatWithAI(
    messages: Array<{ role: 'user' | 'model'; content: string }>,
    user?: any,
    userRole?: string,
    lang?: string
  ): Promise<{ reply: string; structuredAnalysis?: any }> {
    try {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, user, userRole, lang }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return {
          reply: data.reply,
          structuredAnalysis: data.structuredAnalysis,
        };
      }
    } catch (err) {
      console.warn('API /api/ai/chat failed:', err);
    }
    return {
      reply: lang === 'kn'
        ? 'ಕಮ್ಯುನಿಟಿ AI: "ನೋಡಿ. ವರದಿ ಮಾಡಿ. ಪರಿಹರಿಸಿ." ನಿಮ್ಮ ಸಮಸ್ಯೆಯ ವಿಭಾಗ ಹಾಗೂ ತುರ್ತುಸ್ಥಿತಿಯನ್ನು (P1-P4) ನಿರ್ಧರಿಸಲು ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ವಿವರ ಹಾಗೂ ಸ್ಥಳವನ್ನು ತಿಳಿಸಿ.'
        : 'CommUnity AI: See It. Report It. Solve It. I am here to help classify your issue, assess urgency (P1-P4), or inspect campus report ledgers. Please describe the issue and location.',
    };
  },

  async analyzeIssueWithAI(text: string, userRole?: string): Promise<any | null> {
    try {
      const res = await fetch(`${BASE_URL}/ai/analyze-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.analysis;
      }
    } catch (err) {
      console.warn('API /api/ai/analyze-issue failed:', err);
    }
    return null;
  },
};
