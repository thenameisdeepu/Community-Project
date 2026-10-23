import { Issue, TickerItem, CampusStats, UserProfile } from '../types';

// Clean production defaults (zero dummy data)
export const demoUsers: Record<string, UserProfile> = {};

export const initialStats: CampusStats = {
  reportsLogged: 0,
  activeCrews: 0,
  resolvedAndVerified: 0,
  actionRequired: 0,
  onTimeSlaRate: null,
  avgFirstResponseMinutes: null,
  avgResolutionHours: null,
  citizenSatisfaction: null,
};

export const initialIssues: Issue[] = [];

export const initialTickerItems: TickerItem[] = [];

export const campusNotifications: any[] = [];

// Static lookup metadata for community sectors
export const campusZones = [
  'Sector 4 (Residential)',
  'Sector 1 (Administrative & Main Gate)',
  'Sector 2 (Dormitory & Dining Commons)',
  'Sector 3 (Research Laboratories)',
  'Sector 5 (Community Recreation & Sports)',
  'Sector 6 (Logistics Depot & Utility Substations)',
];
