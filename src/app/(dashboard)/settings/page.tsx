'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Check, X, Edit2, Save, Bell, Shield, Globe,
  Download, Database, RefreshCw, AlertTriangle, Fingerprint,
  Cpu, Lock, Key, BarChart3, Tag, Package, User, LogOut,
  Settings2, HardDrive, Store
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!value)}
      className="w-12 h-6 rounded-full relative flex-shrink-0 transition-colors"
      style={{ background: value ? 'var(--primary)' : '#e2e8f0' }}
      whileTap={{ scale: 0.94 }}>
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
        animate={{ left: value ? '1.6rem' : '0.25rem' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
    </motion.button>
  );
}

function SettingRow({ label, description, value, onChange, type = 'toggle', options }: {
  label: string; description?: string; value: any; onChange?: (v: any) => void;
  type?: 'toggle' | 'nav' | 'select'; options?: string[];
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b last:border-0 hover:bg-gray-50/50 transition-colors"
      style={{ borderColor: 'var(--border)' }}>
      <div className="flex-1 mr-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      {type === 'toggle' && <Toggle value={!!value} onChange={onChange!} />}
      {type === 'nav' && (
        <div className="flex items-center gap-1.5">
          {value && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{value}</span>}
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
      {type === 'select' && options && (
        <select className="text-xs font-semibold rounded-lg px-2 py-1.5 border"
          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
          value={value} onChange={e => onChange?.(e.target.value)}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, iconColor = 'var(--primary)', delay = 0, children }: {
  title: string; icon: React.ElementType; iconColor?: string; delay?: number; children: React.ReactNode;
}) {
  return (
    <div className="px-4 mb-4">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-warm)' }}>
          <Icon size={15} style={{ color: iconColor }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function ProfileEditModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: 'Shree Ram Medical & General Stores',
    owner: 'Rajesh Kumar', phone: '9876543200',
    gst: '29ABCDE1234F1Z5', upi: 'shriram@upi',
    address: '15, Brigade Road, Bangalore', email: 'shriram@gmail.com',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const [saved, setSaved] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 28 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {saved ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-green-600">Profile Saved!</h2>
            <button onClick={onClose} className="mt-4 btn-primary !px-8">Done</button>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold">Edit Business Profile</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Store Name', key: 'name' }, { label: 'Owner Name', key: 'owner' },
                { label: 'Phone', key: 'phone' }, { label: 'Email', key: 'email' },
                { label: 'GST Number', key: 'gst' }, { label: 'UPI ID', key: 'upi' },
                { label: 'Address', key: 'address' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                  <input className="input-premium text-sm" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setSaved(true)}
              className="btn-primary w-full !rounded-2xl !py-4 mt-5 flex items-center justify-center gap-2">
              <Save size={18} /> Save Profile
            </motion.button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { products, customers, sales } = useAppStore();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [notifications, setNotifications] = useState({ lowStock: true, expiry: true, paymentReminders: true, dailyReport: false, aiInsights: true, birthdayReminders: true });
  const [security, setSecurity] = useState({ pinLock: true, biometric: false, autoBackup: true, autoLogout: false });
  const [preferences, setPreferences] = useState({ language: 'English', dateFormat: 'DD/MM/YYYY', theme: 'Light' });

  const storageUsed = Math.round((JSON.stringify({ products, customers, sales })).length / 1024);

  return (
    <div className="page-enter pb-8">
      {/* Profile Card */}
      <div className="px-4 pt-4 pb-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="gradient-primary rounded-3xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              R
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold">Rajesh Kumar</h2>
              <p className="text-blue-200 text-sm">Shree Ram Medical & General</p>
              <p className="text-blue-200 text-xs mt-0.5">GST: 29ABCDE1234F1Z5</p>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowProfileEdit(true)}
              className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Edit2 size={16} className="text-white" />
            </motion.button>
          </div>

          {/* Live metrics */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Products', value: products.length },
              { label: 'Customers', value: customers.length },
              { label: 'Sales', value: sales.length },
            ].map((m, i) => (
              <div key={i} className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-white text-lg font-bold">{m.value}</p>
                <p className="text-blue-200 text-[11px]">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell} delay={0.1}>
        <SettingRow label="Low Stock Alerts" description="Alert when stock falls below minimum" value={notifications.lowStock} onChange={v => setNotifications(n => ({ ...n, lowStock: v }))} />
        <SettingRow label="Expiry Alerts" description="30-day advance warning for medicines" value={notifications.expiry} onChange={v => setNotifications(n => ({ ...n, expiry: v }))} />
        <SettingRow label="Payment Reminders" description="Remind customers about pending dues" value={notifications.paymentReminders} onChange={v => setNotifications(n => ({ ...n, paymentReminders: v }))} />
        <SettingRow label="Daily Profit Report" description="8 PM summary every day" value={notifications.dailyReport} onChange={v => setNotifications(n => ({ ...n, dailyReport: v }))} />
        <SettingRow label="AI Insights" description="Morning briefing from your AI assistant" value={notifications.aiInsights} onChange={v => setNotifications(n => ({ ...n, aiInsights: v }))} />
        <SettingRow label="Birthday Reminders" description="Know when customers have birthdays" value={notifications.birthdayReminders} onChange={v => setNotifications(n => ({ ...n, birthdayReminders: v }))} />
      </Section>

      {/* Security */}
      <Section title="Security" icon={Shield} iconColor="#7c3aed" delay={0.15}>
        <SettingRow label="PIN Lock" description="Require PIN to open app" value={security.pinLock} onChange={v => setSecurity(s => ({ ...s, pinLock: v }))} />
        <SettingRow label="Biometric Login" description="Use fingerprint or face ID" value={security.biometric} onChange={v => setSecurity(s => ({ ...s, biometric: v }))} />
        <SettingRow label="Auto Backup" description="Daily automatic data backup" value={security.autoBackup} onChange={v => setSecurity(s => ({ ...s, autoBackup: v }))} />
        <SettingRow label="Auto Logout" description="Logout after 30 minutes of inactivity" value={security.autoLogout} onChange={v => setSecurity(s => ({ ...s, autoLogout: v }))} />
      </Section>

      {/* Preferences */}
      <Section title="Preferences" icon={Settings2} iconColor="#d97706" delay={0.2}>
        <SettingRow label="Language" value={preferences.language} onChange={v => setPreferences(p => ({ ...p, language: v }))} type="select" options={['English', 'हिन्दी', 'ಕನ್ನಡ', 'தமிழ்', 'తెలుగు']} />
        <SettingRow label="Date Format" value={preferences.dateFormat} onChange={v => setPreferences(p => ({ ...p, dateFormat: v }))} type="select" options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} />
        <SettingRow label="Theme" value={preferences.theme} onChange={v => setPreferences(p => ({ ...p, theme: v }))} type="select" options={['Light', 'Dark', 'System']} />
      </Section>

      {/* AI Config */}
      <Section title="AI Assistant" icon={Cpu} iconColor="#059669" delay={0.25}>
        <div className="px-4 py-3">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Google Gemini API Key</p>
          <div className="flex gap-2">
            <input type="password" className="input-premium flex-1 text-sm"
              defaultValue={process.env.NEXT_PUBLIC_GEMINI_API_KEY ? '••••••••••••••••••••' : ''}
              placeholder="Paste your free Gemini API key..." />
            <button className="px-3 py-2 rounded-xl text-xs font-bold" style={{ background: 'var(--primary)', color: 'white' }}>
              <Save size={14} />
            </button>
          </div>
          <p className="text-[11px] mt-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            {process.env.NEXT_PUBLIC_GEMINI_API_KEY
              ? <><Check size={12} className="text-green-500" /> AI key configured — Real Gemini AI is active!</>
              : <><Key size={12} /> No key set — using smart offline mode. Get free key at aistudio.google.com</>}
          </p>
        </div>
        <SettingRow label="AI Daily Briefing" description="Morning business insights at 9 AM" value={true} onChange={() => {}} />
        <SettingRow label="Smart Pricing Suggestions" description="AI recommends price adjustments" value={true} onChange={() => {}} />
      </Section>

      {/* Data & Storage */}
      <Section title="Data & Storage" icon={HardDrive} iconColor="#6366f1" delay={0.3}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Storage Used</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{storageUsed} KB of local storage</p>
          </div>
          <div className="w-24 bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full gradient-primary" style={{ width: `${Math.min(storageUsed / 100, 100)}%` }} />
          </div>
        </div>
        <SettingRow label="Export All Data" value={null} type="nav" />
        <SettingRow label="Sync to Cloud" description="Coming soon with Supabase" value="Soon" type="nav" />
        <SettingRow label="Import Products (CSV)" value={null} type="nav" />
      </Section>

      {/* Danger Zone */}
      <div className="px-4 mb-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: '#fff5f5' }}>
            <AlertTriangle size={15} className="text-red-500" />
            <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
          </div>
          {[
            { label: 'Export Backup File', icon: Download, color: 'text-blue-600' },
            { label: 'Clear Demo/Test Data', icon: Database, color: 'text-orange-500' },
            { label: 'Reset All Settings', icon: RefreshCw, color: 'text-orange-500' },
            { label: 'Sign Out', icon: LogOut, color: 'text-red-600' },
          ].map((item, i) => (
            <motion.button key={i} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-4 py-3.5 text-sm font-medium border-b last:border-0 transition-colors hover:bg-red-50 flex items-center gap-2.5 ${item.color}`}
              style={{ borderColor: 'var(--border)' }}>
              <item.icon size={15} /> {item.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Version info */}
      <div className="text-center py-2 pb-4">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Store size={14} style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>RetailOS AI v1.0 · Made in India</p>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Next.js 16 · Gemini AI · Tailwind CSS v4</p>
      </div>

      <AnimatePresence>
        {showProfileEdit && <ProfileEditModal onClose={() => setShowProfileEdit(false)} />}
      </AnimatePresence>
    </div>
  );
}
