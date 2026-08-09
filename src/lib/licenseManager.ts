// RetailOS AI — License Management System
// This module handles store registration, license status, and admin access

export const ADMIN_PASSWORD = 'RETAILOS@MASTER2024';
export const ADMIN_KEY = 'retailos_admin_auth';
export const STORES_KEY = 'retailos_registered_stores';

export interface StoreRecord {
  phone: string;
  ownerName: string;
  storeName: string;
  city: string;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'trial' | 'suspended' | 'expired';
  trialEndsAt: string;        // ISO date string
  paidUntil: string | null;   // ISO date string or null
  plan: 'trial' | 'basic' | 'pro';
  notes: string;
  monthlyFee: number;
}

// Register or update a store on login
export function registerStore(phone: string, ownerName: string, storeName: string): StoreRecord {
  const stores = getAllStores();
  const existing = stores.find(s => s.phone === phone);
  if (existing) {
    existing.lastLogin = new Date().toISOString();
    existing.ownerName = ownerName;
    saveAllStores(stores);
    return existing;
  }
  // New store — 14-day trial
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  const record: StoreRecord = {
    phone, ownerName, storeName,
    city: 'India',
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'trial',
    trialEndsAt: trialEnd.toISOString(),
    paidUntil: null,
    plan: 'trial',
    notes: '',
    monthlyFee: 999,
  };
  stores.push(record);
  saveAllStores(stores);
  return record;
}

export function getStoreByPhone(phone: string): StoreRecord | null {
  return getAllStores().find(s => s.phone === phone) || null;
}

export function isStoreActive(phone: string): boolean {
  const store = getStoreByPhone(phone);
  if (!store) return true; // New store — allow first login
  if (store.status === 'suspended' || store.status === 'expired') return false;
  if (store.status === 'trial') {
    return new Date() < new Date(store.trialEndsAt);
  }
  if (store.status === 'active' && store.paidUntil) {
    return new Date() < new Date(store.paidUntil);
  }
  return true;
}

export function getDaysRemaining(phone: string): number {
  const store = getStoreByPhone(phone);
  if (!store) return 14;
  if (store.paidUntil) {
    const diff = new Date(store.paidUntil).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  }
  const diff = new Date(store.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function getAllStores(): StoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORES_KEY) || '[]');
  } catch { return []; }
}

export function saveAllStores(stores: StoreRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
}

export function updateStore(phone: string, updates: Partial<StoreRecord>): void {
  const stores = getAllStores();
  const idx = stores.findIndex(s => s.phone === phone);
  if (idx >= 0) {
    stores[idx] = { ...stores[idx], ...updates };
    saveAllStores(stores);
  }
}

// Admin auth
export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

export function adminLogout(): void {
  sessionStorage.removeItem(ADMIN_KEY);
}

// Activate a store after payment
export function activateStore(phone: string, months: number = 1, fee: number = 999): void {
  const store = getStoreByPhone(phone);
  const base = store?.paidUntil && new Date(store.paidUntil) > new Date()
    ? new Date(store.paidUntil)
    : new Date();
  base.setMonth(base.getMonth() + months);
  updateStore(phone, {
    status: 'active',
    paidUntil: base.toISOString(),
    plan: 'basic',
    monthlyFee: fee,
  });
}

export function suspendStore(phone: string, notes: string = ''): void {
  updateStore(phone, { status: 'suspended', notes });
}

export function unsuspendStore(phone: string): void {
  const store = getStoreByPhone(phone);
  if (!store) return;
  // If paid, activate; else restore trial
  const status = store.paidUntil && new Date(store.paidUntil) > new Date() ? 'active' : 'trial';
  updateStore(phone, { status, notes: '' });
}
