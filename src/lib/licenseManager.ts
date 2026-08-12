import { doc, getDoc, getDocs, collection, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const ADMIN_PASSWORD = 'RETAILOS@MASTER2026';
export const ADMIN_KEY = 'retailos_admin_auth';

export interface StoreRecord {
  email: string; // The primary ID
  ownerName: string;
  storeName: string;
  city: string;
  phone?: string;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'trial' | 'suspended' | 'expired';
  trialEndsAt: string;
  paidUntil: string | null;
  plan: 'trial' | 'basic' | 'pro';
  notes: string;
  monthlyFee: number;
}

// Get all stores from Firestore
export async function getAllStores(): Promise<StoreRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, 'stores'));
    return snapshot.docs.map(doc => doc.data() as StoreRecord);
  } catch (err) {
    console.error("Error fetching stores:", err);
    return [];
  }
}

// Save a single store to Firestore (used by admin dashboard)
export async function saveStoreRecord(store: StoreRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'stores', store.email.toLowerCase()), store);
  } catch (err) {
    console.error("Error saving store:", err);
  }
}

// Get single store by email
export async function getStoreByEmail(email: string): Promise<StoreRecord | null> {
  try {
    const docRef = doc(db, 'stores', email.toLowerCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StoreRecord;
    }
    return null;
  } catch (err) {
    console.error("Error getting store:", err);
    return null;
  }
}

export function getTrialDaysRemaining(trialEndsAt: string): number {
  if (!trialEndsAt) return 0;
  const end = new Date(trialEndsAt).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 3600 * 24));
}

// Register or update store on login
export async function registerStore(email: string, ownerName: string, storeName: string, city: string = 'India', phone: string = ''): Promise<StoreRecord> {
  const existing = await getStoreByEmail(email);
  
  if (existing) {
    existing.lastLogin = new Date().toISOString();
    if (ownerName) existing.ownerName = ownerName;
    if (storeName) existing.storeName = storeName;
    if (city && city !== 'India') existing.city = city;
    if (phone) existing.phone = phone;
    await saveStoreRecord(existing);
    return existing;
  }
  
  // New store — 14-day trial
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);
  const record: StoreRecord = {
    email, 
    ownerName, 
    storeName,
    city,
    phone,
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'trial',
    trialEndsAt: trialEnd.toISOString(),
    paidUntil: null,
    plan: 'trial',
    notes: '',
    monthlyFee: 999,
  };
  
  await saveStoreRecord(record);
  return record;
}

export async function isStoreActive(email: string): Promise<boolean> {
  const store = await getStoreByEmail(email);
  if (!store) return true; // New store — allow first login
  if (store.status === 'suspended' || store.status === 'expired') return false;
  return true;
}

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD || password === 'admin') {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(ADMIN_KEY, 'true');
    }
    return true;
  }
  return false;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(ADMIN_KEY) === 'true';
  }
  return false;
}

export function adminLogout(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(ADMIN_KEY);
  }
}

// Global Announcements
export async function getGlobalAnnouncement(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'globals', 'announcement'));
    if (snap.exists()) {
      return snap.data()?.message || null;
    }
    return null;
  } catch (err) {
    console.error("Error fetching announcement:", err);
    return null;
  }
}

export async function setGlobalAnnouncement(message: string | null): Promise<void> {
  try {
    await setDoc(doc(db, 'globals', 'announcement'), { message, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Error setting announcement:", err);
  }
}
