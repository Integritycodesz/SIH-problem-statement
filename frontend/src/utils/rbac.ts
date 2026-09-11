import { type User } from '../services/api';

export type UserRole = 'FARMER' | 'BUYER' | 'OFFICIAL' | 'FPO' | 'ADMIN';

export interface RolePermissions {
  role: UserRole | 'GUEST';
  titleEn: string;
  titleMr: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  canListProduce: boolean;
  canInitiateRFQ: boolean;
  canCounterOffer: boolean;
  canAcceptRFQ: boolean;
  canSignAsFarmer: boolean;
  canSignAsBuyer: boolean;
  canLockAdvanceEscrow: boolean;
  canDispatchProduce: boolean;
  canReleaseFinalSettlement: boolean;
  canFileDispute: boolean;
  canArbitrateDispute: boolean;
  canEscalateDispute: boolean;
  primaryTabs: string[];
  defaultTab: string;
}

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  GUEST: {
    role: 'GUEST',
    titleEn: 'Public Visitor',
    titleMr: 'सार्वजनिक दर्शक',
    badgeBg: '#f1f5f9',
    badgeColor: '#475569',
    badgeBorder: '#cbd5e1',
    canListProduce: false,
    canInitiateRFQ: false,
    canCounterOffer: false,
    canAcceptRFQ: false,
    canSignAsFarmer: false,
    canSignAsBuyer: false,
    canLockAdvanceEscrow: false,
    canDispatchProduce: false,
    canReleaseFinalSettlement: false,
    canFileDispute: false,
    canArbitrateDispute: false,
    canEscalateDispute: false,
    primaryTabs: ['intelligence'],
    defaultTab: 'intelligence'
  },
  FARMER: {
    role: 'FARMER',
    titleEn: 'Farmer / FPO Producer',
    titleMr: 'शेतकरी / उत्पादक',
    badgeBg: '#ecfdf5',
    badgeColor: '#065f46',
    badgeBorder: '#a7f3d0',
    canListProduce: true,
    canInitiateRFQ: false,
    canCounterOffer: true,
    canAcceptRFQ: true,
    canSignAsFarmer: true,
    canSignAsBuyer: false,
    canLockAdvanceEscrow: false,
    canDispatchProduce: true,
    canReleaseFinalSettlement: false,
    canFileDispute: true,
    canArbitrateDispute: false,
    canEscalateDispute: true,
    primaryTabs: ['farmer', 'rfq', 'intelligence', 'contracts', 'disputes'],
    defaultTab: 'farmer'
  },
  FPO: {
    role: 'FPO',
    titleEn: 'FPO Aggregator Desk',
    titleMr: 'शेतकरी उत्पादक कंपनी (FPO)',
    badgeBg: '#f5f3ff',
    badgeColor: '#5b21b6',
    badgeBorder: '#ddd6fe',
    canListProduce: true,
    canInitiateRFQ: false,
    canCounterOffer: true,
    canAcceptRFQ: true,
    canSignAsFarmer: true,
    canSignAsBuyer: false,
    canLockAdvanceEscrow: false,
    canDispatchProduce: true,
    canReleaseFinalSettlement: false,
    canFileDispute: true,
    canArbitrateDispute: false,
    canEscalateDispute: true,
    primaryTabs: ['farmer', 'rfq', 'intelligence', 'contracts', 'disputes'],
    defaultTab: 'farmer'
  },
  BUYER: {
    role: 'BUYER',
    titleEn: 'Corporate Institutional Buyer',
    titleMr: 'संस्थात्मक खरेदीदार',
    badgeBg: '#eff6ff',
    badgeColor: '#1e40af',
    badgeBorder: '#bfdbfe',
    canListProduce: false,
    canInitiateRFQ: true,
    canCounterOffer: true,
    canAcceptRFQ: true,
    canSignAsFarmer: false,
    canSignAsBuyer: true,
    canLockAdvanceEscrow: true,
    canDispatchProduce: false,
    canReleaseFinalSettlement: true,
    canFileDispute: true,
    canArbitrateDispute: false,
    canEscalateDispute: true,
    primaryTabs: ['buyer', 'rfq', 'intelligence', 'contracts', 'disputes'],
    defaultTab: 'buyer'
  },
  OFFICIAL: {
    role: 'OFFICIAL',
    titleEn: 'APMC Mandi Arbiter / Official',
    titleMr: 'बाजार समिती लवाद अधिकारी',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    badgeBorder: '#fde68a',
    canListProduce: false,
    canInitiateRFQ: false,
    canCounterOffer: false,
    canAcceptRFQ: false,
    canSignAsFarmer: false,
    canSignAsBuyer: false,
    canLockAdvanceEscrow: false,
    canDispatchProduce: false,
    canReleaseFinalSettlement: false,
    canFileDispute: true,
    canArbitrateDispute: true,
    canEscalateDispute: true,
    primaryTabs: ['disputes', 'contracts', 'intelligence', 'farmer', 'buyer'],
    defaultTab: 'disputes'
  },
  ADMIN: {
    role: 'ADMIN',
    titleEn: 'State Super Admin',
    titleMr: 'प्रशासक (Admin)',
    badgeBg: '#fdf2f8',
    badgeColor: '#9d174d',
    badgeBorder: '#fbcfe8',
    canListProduce: true,
    canInitiateRFQ: true,
    canCounterOffer: true,
    canAcceptRFQ: true,
    canSignAsFarmer: true,
    canSignAsBuyer: true,
    canLockAdvanceEscrow: true,
    canDispatchProduce: true,
    canReleaseFinalSettlement: true,
    canFileDispute: true,
    canArbitrateDispute: true,
    canEscalateDispute: true,
    primaryTabs: ['intelligence', 'farmer', 'buyer', 'rfq', 'contracts', 'disputes'],
    defaultTab: 'intelligence'
  }
};

/**
 * Returns permissions for a given user or GUEST
 */
export function getRolePermissions(user: User | null): RolePermissions {
  if (!user || !user.role) return ROLE_PERMISSIONS.GUEST;
  const roleKey = user.role.toUpperCase();
  return ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS.FARMER;
}

/**
 * Check if user has permission for a specific action
 */
export function hasPermission(user: User | null, action: keyof Omit<RolePermissions, 'role' | 'titleEn' | 'titleMr' | 'badgeBg' | 'badgeColor' | 'badgeBorder' | 'primaryTabs' | 'defaultTab'>): boolean {
  const perms = getRolePermissions(user);
  return !!perms[action];
}
