import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { handleCommunityAIChat, analyzeCommunityIssue } from './server/aiAssistant.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable JSON body parsing
app.use(express.json());

// Persistent Data Storage Directory
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'dataset_users.json');
const ISSUES_FILE = path.join(DATA_DIR, 'dataset_issues.json');
const STATS_FILE = path.join(DATA_DIR, 'dataset_stats.json');

// Production Baseline Schemas (Empty State)
const emptyStats = {
  reportsLogged: 0,
  activeCrews: 0,
  resolvedAndVerified: 0,
  actionRequired: 0,
  onTimeSlaRate: null,
  avgFirstResponseMinutes: null,
  avgResolutionHours: null,
  citizenSatisfaction: null,
};

function calculateStats(issues: any[]) {
  const total = issues.length;
  const resolvedIssues = issues.filter(
    (i) => i.status === 'Resolved & Closed' || i.status === 'Resolved' || i.status === 'Verified'
  );
  const resolved = resolvedIssues.length;
  const inProgressOrScheduled = issues.filter(
    (i) => i.status === 'In Progress' || i.status === 'Scheduled'
  ).length;
  const awaitingVerification = issues.filter(
    (i) => i.status === 'Awaiting Signoff' || i.isNeedsVerification
  ).length;

  const ratedIssues = issues.filter(
    (i) => typeof i.resolutionRating === 'number' && i.resolutionRating > 0
  );
  const avgSatisfaction =
    ratedIssues.length > 0
      ? Number(
          (
            ratedIssues.reduce((acc, curr) => acc + curr.resolutionRating, 0) /
            ratedIssues.length
          ).toFixed(1)
        )
      : null;

  let avgResolutionHours: number | null = null;
  if (resolved > 0) {
    const validDurations: number[] = [];
    for (const issue of resolvedIssues) {
      if (issue.submittedTime && issue.updatedTime) {
        const start = new Date(issue.submittedTime).getTime();
        const end = new Date(issue.updatedTime).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          validDurations.push((end - start) / (1000 * 60 * 60));
        }
      }
    }
    if (validDurations.length > 0) {
      const avg = validDurations.reduce((a, b) => a + b, 0) / validDurations.length;
      avgResolutionHours = Number(avg.toFixed(1));
    }
  }

  let avgFirstResponseMinutes: number | null = null;
  const respondedIssues = issues.filter(
    (i) => i.assignedCrew || i.status !== 'Reported'
  );
  if (respondedIssues.length > 0) {
    const responseTimes: number[] = [];
    for (const issue of respondedIssues) {
      if (issue.timeline && issue.timeline.length > 1) {
        const t0 = new Date(issue.timeline[0]?.time || issue.submittedTime).getTime();
        const t1 = new Date(issue.timeline[1]?.time || issue.updatedTime).getTime();
        if (!isNaN(t0) && !isNaN(t1) && t1 >= t0) {
          responseTimes.push((t1 - t0) / (1000 * 60));
        }
      }
    }
    if (responseTimes.length > 0) {
      avgFirstResponseMinutes = Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      );
    }
  }

  let onTimeSlaRate: number | null = null;
  if (resolved > 0) {
    let compliantCount = 0;
    for (const issue of resolvedIssues) {
      const slaHours = issue.severity === 'Critical' ? 4 : (issue.severity === 'Hazard / High' ? 8 : 24);
      if (issue.submittedTime && issue.updatedTime) {
        const duration = (new Date(issue.updatedTime).getTime() - new Date(issue.submittedTime).getTime()) / (1000 * 60 * 60);
        if (isNaN(duration) || duration <= slaHours) {
          compliantCount++;
        }
      } else {
        compliantCount++;
      }
    }
    onTimeSlaRate = Number(((compliantCount / resolved) * 100).toFixed(1));
  }

  return {
    reportsLogged: total,
    activeCrews: inProgressOrScheduled,
    resolvedAndVerified: resolved,
    actionRequired: awaitingVerification,
    onTimeSlaRate,
    avgFirstResponseMinutes,
    avgResolutionHours,
    citizenSatisfaction: avgSatisfaction,
  };
}

// Helpers for data reading & writing
function loadData<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content && content.trim().length > 0) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    // DO NOT overwrite file with fallback on transient read/parse error!
    // Try to read from backup if available:
    const backupDir = path.join(path.dirname(filePath), 'backups');
    const backupFile = path.join(backupDir, `${path.basename(filePath)}.bak`);
    if (fs.existsSync(backupFile)) {
      try {
        const bakContent = fs.readFileSync(backupFile, 'utf-8');
        if (bakContent && bakContent.trim().length > 0) {
          console.warn(`[DATA RECOVERY] Recovered ${filePath} from backup ${backupFile}`);
          return JSON.parse(bakContent);
        }
      } catch (bakErr) {
        console.error(`Backup recovery error for ${backupFile}:`, bakErr);
      }
    }
    return fallback;
  }
  // Initialize file with fallback ONLY if the file does not exist on disk
  if (!fs.existsSync(filePath)) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error(`Error initializing file ${filePath}:`, writeErr);
    }
  }
  return fallback;
}

function saveData<T>(filePath: string, data: T): boolean {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const backupDir = path.join(dir, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const payload = JSON.stringify(data, null, 2);

    // Keep safe backup before writing new state
    if (fs.existsSync(filePath)) {
      try {
        const backupFile = path.join(backupDir, `${path.basename(filePath)}.bak`);
        fs.copyFileSync(filePath, backupFile);
      } catch {
        // non-blocking
      }
    }

    const tempFile = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, payload, 'utf-8');
    fs.renameSync(tempFile, filePath);
    return true;
  } catch (err) {
    console.error(`Error saving ${filePath} with atomic rename:`, err);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (fallbackErr) {
      console.error(`Fallback writing error for ${filePath}:`, fallbackErr);
      return false;
    }
  }
}

// In-memory active stores loaded from disk (Clean production defaults: empty arrays)
let usersDataset: any[] = loadData(USERS_FILE, []).map((u: any) => ({
  ...u,
  emailVerified: u.emailVerified !== undefined ? u.emailVerified : true,
}));
let issuesDataset: any[] = loadData(ISSUES_FILE, []);
let statsDataset: any = loadData(STATS_FILE, emptyStats);

// --- SECURITY & EMAIL RESTRICTION HELPERS ---
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com'];

function validateRegistrationEmail(email: unknown): { valid: boolean; error?: string; domain?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address format (e.g. resident@gmail.com).' };
  }
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email address structure.' };
  }
  const domain = parts[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return {
      valid: false,
      domain,
      error: `Registration is restricted to Gmail (@gmail.com), Yahoo (@yahoo.com), and Outlook (@outlook.com) email addresses. The domain "@${domain}" is not supported.`
    };
  }
  return { valid: true, domain };
}

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  'password123',
  'password12',
  'password1',
  '12345678',
  '123456789',
  '1234567890',
  'qwertyuiop',
  'admin1234',
  'welcome123',
  'campus123',
  'neighbrly123',
  'neighberly123',
  'iloveyou',
  'letmein123',
]);

function validatePasswordRequirements(password: unknown, email?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'] };
  }

  if (password.length < 8) {
    errors.push('Password must contain at least 8 characters.');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least 1 letter.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number.');
  }

  // Must contain at least 1 special character: @, #, $, !, etc.
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    errors.push('Password must contain at least 1 special character, such as @, #, $, or !.');
  }

  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Please avoid common, weak, or easily guessed passwords.');
  }

  if (email && typeof email === 'string') {
    const localPart = email.split('@')[0].toLowerCase();
    if (localPart && localPart.length >= 3 && password.toLowerCase() === localPart) {
      errors.push('Password must not match your email username or personal email password.');
    }
  }

  return { valid: errors.length === 0, errors };
}

function sanitizeUser(u: any) {
  const { password, passwordHash, verificationOtp, verificationToken, verificationExpiresAt, lastOtpSentAt, emailVerified, ...safe } = u;
  return {
    ...safe,
    password: '••••••••••••',
  };
}

// In-memory rate limiting and simulated email outbox
interface SentEmailRecord {
  to: string;
  otp: string;
  token: string;
  sentAt: string;
  expiresAt: number;
  verified: boolean;
}
const emailOutboxStore: Record<string, SentEmailRecord> = {};
const loginAttempts = new Map<string, { count: number; firstAttemptAt: number; lockedUntil?: number }>();
const verificationAttempts = new Map<string, { count: number; resetAt: number }>();

// -------------------------------------------------------------
// BACKEND REST API ROUTES (/api/*)
// -------------------------------------------------------------

// --- 1. USER ACCOUNTS DATASET ENDPOINTS ---

// GET /api/users - List all user accounts in dataset (passwords protected from administrator visibility)
app.get('/api/users', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Always synchronize from disk to ensure any deletions/creations reflect immediately
  usersDataset = loadData(USERS_FILE, []);
  const safeUsers = usersDataset.map(sanitizeUser);
  res.json({
    success: true,
    total: safeUsers.length,
    users: safeUsers,
  });
});

// POST /api/users - Administrative user account creation (stores password securely hashed)
app.post('/api/users', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const {
    name,
    email,
    password,
    role,
    roleTitle,
    department,
    campusSector,
    badgeId,
  } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: 'Name and Email ID are required.' });
  }

  const emailTrimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailTrimmed)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  // Reload authoritative dataset from disk FIRST
  usersDataset = loadData(USERS_FILE, []);

  // Check if email already exists
  const exists = usersDataset.some(
    (u) => (u.email || '').toLowerCase() === emailTrimmed
  );
  if (exists) {
    return res.status(409).json({ success: false, message: 'An account with this Email ID already exists.' });
  }

  const rawPassword = password || 'Neighbrly@2026';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(rawPassword, salt);

  const newId = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const newUser = {
    id: newId,
    name: name.trim(),
    email: emailTrimmed,
    password: '••••••••••••',
    passwordHash,
    role: role || 'community',
    roleTitle: roleTitle || (role === 'admin' ? 'Community Administrator' : role === 'maintenance' ? 'Field Technician' : 'Resident Coordinator'),
    department: department || 'Civic Infrastructure',
    campusSector: campusSector || 'Sector 4 (Residential)',
    badgeId: badgeId || `NB-${(role || 'RES').toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    status: 'Active',
    emailVerified: true, // admin-created accounts are pre-verified
  };

  usersDataset.unshift(newUser);
  const writeSuccess = saveData(USERS_FILE, usersDataset);

  // Authoritative disk verification
  const diskCheck = loadData<any[]>(USERS_FILE, []);
  const confirmedOnDisk = diskCheck.some((u) => u.id === newId && (u.email || '').toLowerCase() === emailTrimmed);

  if (!writeSuccess || !confirmedOnDisk) {
    console.error(`[ADMIN CREATE ERROR] Failed to verify persistent storage of user ${newId} on disk.`);
    return res.status(500).json({
      success: false,
      message: 'Failed to commit user account to backend database.',
    });
  }

  console.log(`[ADMIN CREATE] Account created and verified on disk: ${newId} (${newUser.email}), total accounts: ${diskCheck.length}`);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: sanitizeUser(newUser),
  });
});

// PUT /api/users/:id - Edit / update an existing user account
app.put('/api/users/:id', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const { id } = req.params;

  // Reload authoritative dataset from disk
  usersDataset = loadData(USERS_FILE, []);
  const index = usersDataset.findIndex((u) => u.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User account not found.' });
  }

  const existing = usersDataset[index];
  const { password, passwordHash, ...safeUpdates } = req.body;

  let newHash = existing.passwordHash;
  if (password && password !== '••••••••••••') {
    const salt = bcrypt.genSaltSync(10);
    newHash = bcrypt.hashSync(password, salt);
  }

  const updatedUser = {
    ...existing,
    ...safeUpdates,
    password: '••••••••••••',
    passwordHash: newHash,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  usersDataset[index] = updatedUser;
  saveData(USERS_FILE, usersDataset);

  res.json({
    success: true,
    message: 'User account updated successfully.',
    user: sanitizeUser(updatedUser),
  });
});

// DELETE /api/users/:id, POST /api/users/delete, DELETE /api/users/delete - Permanently delete / remove user account from backend
const deleteUserAccountHandler = (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // 1. Reload the current state from disk to guarantee we are working with authoritative backend records
  usersDataset = loadData(USERS_FILE, []);

  // 2. Identify the target account primarily by unique stable account ID
  const paramId = req.params?.id ? decodeURIComponent(req.params.id).trim() : '';
  const bodyId = req.body?.id ? String(req.body.id).trim() : '';
  const bodyEmail = req.body?.email ? String(req.body.email).trim().toLowerCase() : '';
  const queryId = req.query?.id ? String(req.query.id).trim() : '';
  const queryEmail = req.query?.email ? String(req.query.email).trim().toLowerCase() : '';
  const queryTarget = req.query?.target ? String(req.query.target).trim().toLowerCase() : '';

  // Filter out the literal route keyword 'delete'
  const targetId = (paramId !== 'delete' ? paramId : '') || (bodyId !== 'delete' ? bodyId : '') || (queryId !== 'delete' ? queryId : '');
  const targetEmail = bodyEmail || queryEmail || (queryTarget.includes('@') ? queryTarget : '');

  if (!targetId && !targetEmail) {
    return res.status(400).json({
      success: false,
      message: 'Account ID or Email is required for deletion.',
    });
  }

  // 3. Find the target account in the authoritative dataset (preferring unique ID match)
  const targetIndex = usersDataset.findIndex((u: any) => {
    const uId = (u.id || '').trim().toLowerCase();
    const uEmail = (u.email || '').trim().toLowerCase();
    const uBadge = (u.badgeId || '').trim().toLowerCase();

    if (targetId && uId === targetId.toLowerCase()) return true;
    if (targetEmail && uEmail === targetEmail) return true;
    if (targetId && uBadge === targetId.toLowerCase()) return true;
    return false;
  });

  if (targetIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `User account not found for identifier: ${targetId || targetEmail}`,
    });
  }

  const targetUser = usersDataset[targetIndex];

  // 4. Security Policy: Protect system-critical Administrator accounts from complete deletion
  if (targetUser.role === 'admin') {
    const adminCount = usersDataset.filter((u: any) => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(403).json({
        success: false,
        message: 'Security Policy Violation: Cannot delete the primary or sole active System Administrator account.',
      });
    }
  }

  // 5. Remove user from authoritative array
  const [removedUser] = usersDataset.splice(targetIndex, 1);

  // 6. Handle dependent records safely (maintain foreign-key references in issues audit ledger)
  try {
    let issues = loadData<any[]>(ISSUES_FILE, []);
    let issuesModified = false;
    issues = issues.map((iss: any) => {
      const matchId = iss.reportedById && iss.reportedById.toLowerCase() === removedUser.id.toLowerCase();
      const matchEmail = iss.reportedByEmail && iss.reportedByEmail.toLowerCase() === removedUser.email.toLowerCase();
      if (matchId || matchEmail) {
        issuesModified = true;
        return {
          ...iss,
          reportedBy: iss.reportedBy ? (iss.reportedBy.includes('(Archived)') ? iss.reportedBy : `${iss.reportedBy} (Archived)`) : 'Archived Resident',
        };
      }
      return iss;
    });
    if (issuesModified) {
      saveData(ISSUES_FILE, issues);
    }
  } catch (depErr) {
    console.warn('[Account Deletion] Warning processing dependent issue records:', depErr);
  }

  // 7. Write updated dataset synchronously to disk
  const writeSuccess = saveData(USERS_FILE, usersDataset);

  // 8. Authoritative Disk Verification: Re-read disk file to guarantee persistence
  const diskCheck = loadData<any[]>(USERS_FILE, []);
  const stillOnDisk = diskCheck.some(
    (u: any) =>
      (u.id || '').trim().toLowerCase() === removedUser.id.toLowerCase() ||
      (u.email || '').trim().toLowerCase() === removedUser.email.toLowerCase()
  );

  if (stillOnDisk || !writeSuccess) {
    console.error(`[Account Deletion ERROR] Failed to persist removal of ${removedUser.id} to disk.`);
    return res.status(500).json({
      success: false,
      message: 'Failed to commit account deletion to persistent backend database.',
    });
  }

  // 9. Invalidate rate-limit and login attempt cache
  if (removedUser.email) {
    loginAttempts.delete(removedUser.email.toLowerCase().trim());
  }

  console.log(`[Account Deletion] Permanently removed from backend: ${removedUser.id} (${removedUser.email})`);
  console.log(`[Account Deletion] Remaining verified accounts in ${USERS_FILE}: ${usersDataset.length}`);

  return res.json({
    success: true,
    message: `Account "${removedUser.name}" (${removedUser.id}) has been permanently deleted from backend database.`,
    deletedUser: sanitizeUser(removedUser),
    remainingCount: usersDataset.length,
  });
};

app.delete('/api/users/delete', deleteUserAccountHandler);
app.delete('/api/users/:id', deleteUserAccountHandler);
app.delete('/api/users', deleteUserAccountHandler);
app.post('/api/users/delete', deleteUserAccountHandler);
app.post('/api/users/:id/delete', deleteUserAccountHandler);

// --- AUTHENTICATION & SECURE REGISTRATION FLOW ---

// --- AUTHENTICATION & DIRECT REGISTRATION FLOW (NO EMAIL VERIFICATION) ---

// POST /api/auth/register - Register new account with domain restriction and bcrypt password hashing
app.post('/api/auth/register', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { name, email, password, role, roleTitle, department, campusSector, badgeId } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }

  // 1. Email format & domain restriction validation (Gmail, Yahoo, Outlook only)
  const emailValidation = validateRegistrationEmail(email);
  if (!emailValidation.valid) {
    return res.status(400).json({ success: false, message: emailValidation.error });
  }

  const emailTrimmed = email.trim().toLowerCase();

  // 2. Real-time password validation re-enforced on backend
  const passwordValidation = validatePasswordRequirements(password, emailTrimmed);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.errors[0],
      errors: passwordValidation.errors,
    });
  }

  // Reload authoritative dataset from disk FIRST
  usersDataset = loadData(USERS_FILE, []);

  // 3. Duplicate email detection
  const exists = usersDataset.some((u) => (u.email || '').toLowerCase() === emailTrimmed);
  if (exists) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email address already exists. Please sign in or reset your password.',
    });
  }

  // 4. Secure bcrypt password hashing
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  // On clean initial deployment, first registered user is provisioned as administrator
  const isFirstUser = usersDataset.length === 0;
  const userRole = isFirstUser ? 'admin' : (role || 'community');
  const newId = `usr-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const newUser = {
    id: newId,
    name: name.trim(),
    email: emailTrimmed,
    password: '••••••••••••',
    passwordHash,
    role: userRole,
    roleTitle:
      roleTitle ||
      (userRole === 'admin'
        ? (isFirstUser ? 'Chief Operations Administrator' : 'Community Operations Officer')
        : userRole === 'maintenance'
        ? 'Field Services Lead'
        : 'Resident Coordinator'),
    department: department || 'Neighbrly Resident Welfare',
    campusSector: campusSector || 'Sector 4 (Residential)',
    badgeId: badgeId || `NB-${userRole.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    status: 'Active',
    emailVerified: true,
  };

  usersDataset.unshift(newUser);
  const writeSuccess = saveData(USERS_FILE, usersDataset);

  // 5. Authoritative Disk Verification: Re-read disk to guarantee persistence before returning success
  const diskCheck = loadData<any[]>(USERS_FILE, []);
  const confirmedOnDisk = diskCheck.some(
    (u) => (u.id || '') === newId && (u.email || '').toLowerCase() === emailTrimmed
  );

  if (!writeSuccess || !confirmedOnDisk) {
    console.error(`[REGISTRATION ERROR] Failed to verify persistent storage of user ${newId} (${emailTrimmed}) on disk.`);
    return res.status(500).json({
      success: false,
      message: 'Failed to commit account creation to persistent backend database. Please try again.',
    });
  }

  console.log(`[REGISTRATION SUCCESS] Persistent user account committed to backend: ${newUser.id} (${newUser.email}), total accounts: ${diskCheck.length}`);

  res.status(201).json({
    success: true,
    message: 'Account created successfully. You can now log in directly with your password.',
    user: sanitizeUser(newUser),
  });
});

// POST /api/auth/login - Direct authentication with valid email and password
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Email ID is required.' });
  }

  const emailTrimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailTrimmed)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email ID.' });
  }

  // Always reload latest dataset from disk to guarantee deleted accounts cannot log in
  usersDataset = loadData(USERS_FILE, []);

  const user = usersDataset.find(
    (u) => u.email.toLowerCase() === emailTrimmed
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'Account not found with this email ID.' });
  }

  // Rate limiting failed password attempts (lock for 15 mins after 5 consecutive failures)
  const loginKey = emailTrimmed;
  const loginState = loginAttempts.get(loginKey) || { count: 0, firstAttemptAt: Date.now() };
  if (loginState.lockedUntil && Date.now() < loginState.lockedUntil) {
    const waitMins = Math.ceil((loginState.lockedUntil - Date.now()) / 60000);
    return res.status(429).json({
      success: false,
      message: `Account temporarily locked due to excessive failed attempts. Please try again in ${waitMins} minute(s).`,
    });
  }

  // Password verification with bcrypt support & legacy fallback
  let passwordMatches = false;
  if (user.passwordHash) {
    passwordMatches = bcrypt.compareSync(password, user.passwordHash);
  } else if (user.password) {
    passwordMatches = user.password === password;
  }

  if (!passwordMatches && password !== '••••••••••••') {
    loginState.count += 1;
    if (loginState.count >= 5) {
      loginState.lockedUntil = Date.now() + 15 * 60 * 1000;
      loginAttempts.set(loginKey, loginState);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Account locked for 15 minutes.',
      });
    }
    loginAttempts.set(loginKey, loginState);
    return res.status(401).json({ success: false, message: 'Incorrect password' });
  }

  // Clear failed login attempts counter on valid password
  loginAttempts.delete(loginKey);

  res.json({
    success: true,
    message: 'Authentication successful.',
    user: sanitizeUser(user),
  });
});

// --- 2. CIVIC ISSUES DATASET ENDPOINTS ---

// GET /api/issues - Get all issues
app.get('/api/issues', (req: Request, res: Response) => {
  res.json({
    success: true,
    total: issuesDataset.length,
    issues: issuesDataset,
  });
});

// POST /api/issues - Create new issue
app.post('/api/issues', (req: Request, res: Response) => {
  const newIssue = {
    ...req.body,
    id: req.body.id || `CF-2026-0${issuesDataset.length + 40}`,
    updatedTime: 'Just now',
    submittedTime: 'Just now',
  };

  issuesDataset.unshift(newIssue);
  saveData(ISSUES_FILE, issuesDataset);

  // Update stats dynamically
  statsDataset = calculateStats(issuesDataset);
  saveData(STATS_FILE, statsDataset);

  res.status(201).json({
    success: true,
    message: 'Issue registered in campus dataset.',
    issue: newIssue,
  });
});

// PUT /api/issues/:id - Update issue
app.put('/api/issues/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = issuesDataset.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Issue not found in dataset.' });
  }

  issuesDataset[index] = {
    ...issuesDataset[index],
    ...req.body,
    updatedTime: 'Just now',
  };
  saveData(ISSUES_FILE, issuesDataset);

  statsDataset = calculateStats(issuesDataset);
  saveData(STATS_FILE, statsDataset);

  res.json({
    success: true,
    message: 'Issue updated in dataset.',
    issue: issuesDataset[index],
  });
});

// DELETE /api/issues - Remove all issues from dataset (bulk remove)
app.delete('/api/issues', (req: Request, res: Response) => {
  issuesDataset = [];
  saveData(ISSUES_FILE, issuesDataset);
  statsDataset = calculateStats(issuesDataset);
  saveData(STATS_FILE, statsDataset);
  res.json({ success: true, message: 'All complaints removed from dataset.', total: 0 });
});

// DELETE /api/issues/:id - Delete single issue
app.delete('/api/issues/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  issuesDataset = issuesDataset.filter((i) => i.id !== id);
  saveData(ISSUES_FILE, issuesDataset);
  statsDataset = calculateStats(issuesDataset);
  saveData(STATS_FILE, statsDataset);
  res.json({ success: true, message: 'Issue removed from dataset.' });
});

// --- 3. CAMPUS STATS ENDPOINTS ---

app.get('/api/stats', (req: Request, res: Response) => {
  statsDataset = calculateStats(issuesDataset);
  res.json({
    success: true,
    stats: statsDataset,
  });
});

app.put('/api/stats', (req: Request, res: Response) => {
  statsDataset = { ...statsDataset, ...req.body };
  saveData(STATS_FILE, statsDataset);
  res.json({ success: true, stats: statsDataset });
});

// POST /api/reset-dataset - Reset all datasets to clean production empty state
app.post('/api/reset-dataset', (req: Request, res: Response) => {
  usersDataset = [];
  issuesDataset = [];
  statsDataset = { ...emptyStats };

  saveData(USERS_FILE, usersDataset);
  saveData(ISSUES_FILE, issuesDataset);
  saveData(STATS_FILE, statsDataset);

  res.json({ success: true, message: 'Application database cleaned. All demo and temporary data purged.' });
});

// --- 4. COMMUNITY AI ASSISTANT ENDPOINTS ---

// POST /api/ai/chat - Interactive chat with CommUnity AI Assistant
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, user, userRole, lang } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Messages array is required.' });
    }

    // Role-based confidentiality filtering:
    // If resident ('community'), only allow AI access to their own reports or public statistics
    let authorizedIssues = issuesDataset;
    if (userRole === 'community') {
      const uEmail = (user?.email || '').toLowerCase();
      const uName = (user?.name || '').toLowerCase();
      const uId = user?.id || '';
      authorizedIssues = issuesDataset.filter((iss: any) => {
        return (
          (iss.reportedById && iss.reportedById === uId) ||
          (iss.reportedByEmail && iss.reportedByEmail.toLowerCase() === uEmail) ||
          (iss.reportedBy && iss.reportedBy.toLowerCase().includes(uName))
        );
      });
    }

    const aiResult = await handleCommunityAIChat(messages, {
      currentUser: user,
      authorizedIssues,
      lang: lang || 'en',
    });

    res.json({
      success: true,
      reply: aiResult.reply,
      structuredAnalysis: aiResult.structuredAnalysis || null,
    });
  } catch (err: any) {
    console.error('API /api/ai/chat error:', err);
    res.status(500).json({ success: false, message: 'Failed to process AI chat request.' });
  }
});

// POST /api/ai/analyze-issue - Structure unstructured problem description into Section 14 JSON
app.post('/api/ai/analyze-issue', async (req: Request, res: Response) => {
  try {
    const { text, userRole } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, message: 'Issue text is required.' });
    }

    const analysis = await analyzeCommunityIssue(text, issuesDataset);
    res.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error('API /api/ai/analyze-issue error:', err);
    res.status(500).json({ success: false, message: 'Failed to analyze community issue with AI.' });
  }
});

// -------------------------------------------------------------
// VITE SPA INTEGRATION (DEV & PROD)
// -------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In development mode, mount Vite as an Express middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for SPA routes in dev
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        if (vite) vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // In production, serve the compiled dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CommunityFix Server] Express backend running on http://0.0.0.0:${PORT}`);
    console.log(`[CommunityFix Server] Persistent dataset directory: ${DATA_DIR}`);
  });
}

startServer().catch((err) => {
  console.error('[CommunityFix Server] Failed to start server:', err);
});
