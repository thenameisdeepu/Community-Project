export type Role = 'community' | 'admin' | 'maintenance';
export type Language = 'en' | 'kn';

export type IssueCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'Damaged Infra'
  | 'Internet'
  | 'Waste'
  | 'Safety'
  | 'Elevator'
  | 'Other';

export type Severity = 'Low' | 'Medium' | 'Hazard / High' | 'Critical';

export type IssueStatus =
  | 'Reported'
  | 'In Progress'
  | 'Scheduled'
  | 'Awaiting Signoff'
  | 'Resolved & Closed';

export interface TimelineEvent {
  time: string;
  title: string;
  subtitle?: string;
  completed?: boolean;
  active?: boolean;
}

export interface Issue {
  id: string;
  category: IssueCategory;
  categoryIcon: string;
  title: string;
  location: string;
  zone: string;
  severity: Severity;
  status: IssueStatus;
  workOrder?: string;
  progressPercent?: number;
  assignedCrew?: string;
  updatedTime: string;
  submittedTime: string;
  reportedBy: string;
  reportedByEmail?: string;
  reportedById?: string;
  description: string;
  incidentPhoto?: string;
  repairProofPhoto?: string;
  crewNote?: string;
  resolutionRating?: number;
  residentComments?: string;
  isNeedsVerification?: boolean;
  division?: string;
  titleKn?: string;
  locationKn?: string;
  descriptionKn?: string;
  workOrderKn?: string;
  crewNoteKn?: string;
  divisionKn?: string;
  timeline: TimelineEvent[];
}

export interface TickerItem {
  id: string;
  type: 'resolved' | 'dispatch' | 'scheduled';
  icon: string;
  statusLabel: string;
  timeAgo: string;
  title: string;
  subtitle: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  department: string;
  campusSector: string;
  badgeId: string;
  password?: string;
  createdAt?: string;
  status?: string;
  emailVerified?: boolean;
  verificationOtp?: string;
  verificationToken?: string;
  verificationExpiresAt?: number;
  lastOtpSentAt?: number;
}

export interface CampusStats {
  reportsLogged: number;
  activeCrews: number;
  resolvedAndVerified: number;
  actionRequired: number;
  onTimeSlaRate: number | null;
  avgFirstResponseMinutes: number | null;
  avgResolutionHours: number | null;
  citizenSatisfaction: number | null;
}
