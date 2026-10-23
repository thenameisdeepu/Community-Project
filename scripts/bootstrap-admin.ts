import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'dataset_users.json');

const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com'];

function validateEmail(email: string) {
  if (!email || !email.includes('@')) return false;
  const parts = email.trim().toLowerCase().split('@');
  return parts.length === 2 && ALLOWED_EMAIL_DOMAINS.includes(parts[1]);
}

function validatePassword(pw: string) {
  if (!pw || pw.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pw);
  return hasLetter && hasNumber && hasSpecial;
}

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];
const name = args[2] || 'System Administrator';

if (!email || !password) {
  console.log(`
Usage: npx tsx scripts/bootstrap-admin.ts <email> <password> "[Full Name]"

Requirements:
- Email must use @gmail.com, @yahoo.com, or @outlook.com
- Password must be at least 8 characters with 1 letter, 1 number, and 1 special character
`);
  process.exit(1);
}

if (!validateEmail(email)) {
  console.error(`Error: Email must be from an allowed domain: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`);
  process.exit(1);
}

if (!validatePassword(password)) {
  console.error('Error: Password does not meet security rules (8+ chars, letter, number, special char).');
  process.exit(1);
}

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let users: any[] = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    users = [];
  }
}

const emailTrimmed = email.trim().toLowerCase();
if (users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
  console.error(`Error: User with email "${emailTrimmed}" already exists.`);
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(password, salt);

const newAdmin = {
  id: `usr-${Date.now().toString().slice(-4)}`,
  name: name.trim(),
  email: emailTrimmed,
  password: '••••••••••••',
  passwordHash,
  role: 'admin',
  roleTitle: 'Chief Operations Administrator',
  department: 'Campus Provost Operations Directorate',
  campusSector: 'Central Administrative Wing',
  badgeId: `NB-ADM-${Math.floor(1000 + Math.random() * 9000)}`,
  createdAt: new Date().toISOString(),
  status: 'Active',
  emailVerified: true,
};

users.unshift(newAdmin);
fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');

console.log(`Successfully created bootstrap production administrator:`);
console.log(`  Name:     ${newAdmin.name}`);
console.log(`  Email:    ${newAdmin.email}`);
console.log(`  Role:     ${newAdmin.role} (${newAdmin.roleTitle})`);
console.log(`  Badge ID: ${newAdmin.badgeId}`);
