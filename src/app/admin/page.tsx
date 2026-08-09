'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Store, Users, TrendingUp, Check,
  X, Phone, MessageCircle, AlertTriangle, CheckCircle,
  Clock, RefreshCw, LogOut, Eye, EyeOff,
  DollarSign, Calendar, PauseCircle, PlayCircle,
  ChevronRight, BarChart3, Zap, Crown, Search, Edit2
} from 'lucide-react';
import {
  adminLogin, isAdminLoggedIn, adminLogout, saveAllStores,
  getAllStores, activateStore, suspendStore, unsuspendStore,
  updateStore, StoreRecord, getDaysRemaining
} from '@/lib/licenseManager';

const STATUS_CONFIG = {
  active:    { label: 'Active',    bg: '#d1fae5', color: '#059669', icon: CheckCircle },
  trial:     { label: 'Trial',     bg: '#dbeafe', color: 'var(--primary)', icon: Clock },
  suspended: { label: 'Suspended', bg: '#fee2e2', color: '#dc2626', icon: PauseCircle },
  expired:   { label: 'Expired',   bg: '#f1f5f9', color: '#64748b', icon: AlertTriangle },
};

const PLAN_CONFIG = {
  trial: { label: 'Free Trial', color: '#64748b' },
  basic: { label: 'Basic ₹999/mo', color: 'var(--primary)' },
  pro:   { label: 'Pro ₹1,999/mo', color: '#7c3aed' },
};

// Seed some demo stores for the admin panel to look impressive
const DEMO_STORES: StoreRecord[] = [
  {
    phone: '9876543200', ownerName: 'Rajesh Kumar', storeName: 'Shree Ram Medical & General',
    city: 'Bangalore', registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastLogin: new Date().toISOString(), status: 'active',
    trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    paidUntil: new Date(Date.now() + 25 * 86400000).toISOString(),
    plan: 'basic', notes: '', monthlyFee: 999,
  },
  {
    phone: '9845001234', ownerName: 'Suresh Patel', storeName: 'Patel Kirana Store',
    city: 'Ahmedabad', registeredAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    lastLogin: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'trial',
    trialEndsAt: new Date(Date.now() + 6 * 86400000).toISOString(),
    paidUntil: null, plan: 'trial', notes: '', monthlyFee: 999,
  },
  {
    phone: '9900112233', ownerName: 'Ramesh Babu', storeName: 'Sri Venkateshwara Medicals',
    city: 'Hyderabad', registeredAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastLogin: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'trial',
    trialEndsAt: new Date(Date.now() + 9 * 86400000).toISOString(),
    paidUntil: null, plan: 'trial', notes: '', monthlyFee: 999,
  },
];

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (adminLogin(password)) { onLogin(); }
    else { setError('Invalid master password. Access denied.'); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1a2e' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
            <Crown size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">RetailOS Admin</h1>
          <p className="text-sm mt-1 text-white/50">Master Control Panel</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/60 block mb-1.5">Master Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-blue-400"
                  autoFocus
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs flex items-center gap-1.5">
                <AlertTriangle size={12} /> {error}
              </p>
            )}

            <button type="submit" disabled={loading || !password}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
              style={{ background: password ? 'linear-gradient(135deg, #1a56db, #7c3aed)' : 'rgba(255,255,255,0.1)' }}>
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Shield size={15} />}
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>
          <p className="text-center text-xs mt-4 text-white/30">
            This panel is restricted to RetailOS administrators only
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StoreCard({ store, onUpdate }: { store: StoreRecord; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [months, setMonths] = useState(1);
  const [fee, setFee] = useState(store.monthlyFee.toString());
  const [notes, setNotes] = useState(store.notes);

  const statusCfg = STATUS_CONFIG[store.status];
  const daysLeft = getDaysRemaining(store.phone);

  const handleAction = async (action: 'activate' | 'suspend' | 'unsuspend') => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (action === 'activate')  activateStore(store.phone, months, Number(fee));
    if (action === 'suspend')   suspendStore(store.phone, notes);
    if (action === 'unsuspend') unsuspendStore(store.phone);
    onUpdate(); setLoading(false); setShowEdit(false);
  };

  const sendWhatsApp = () => {
    const msg = store.status === 'suspended'
      ? `Dear ${store.ownerName}, your RetailOS AI subscription has been suspended. Please renew at ₹${store.monthlyFee}/month to restore access. Reply to this message to pay.`
      : `Dear ${store.ownerName}, your RetailOS AI trial ends in ${daysLeft} days. Upgrade to ₹${store.monthlyFee}/month for uninterrupted access. Reply to renew!`;
    window.open(`https://wa.me/91${store.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
            {store.ownerName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{store.ownerName}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: statusCfg.bg, color: statusCfg.color }}>
                {statusCfg.label}
              </span>
              <span className="text-[10px] font-semibold" style={{ color: PLAN_CONFIG[store.plan].color }}>
                {PLAN_CONFIG[store.plan].label}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{store.storeName}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{store.city} · +91 {store.phone}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Joined {new Date(store.registeredAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              {daysLeft > 0 && (
                <span className={`text-xs font-semibold ${daysLeft <= 5 ? 'text-red-500' : daysLeft <= 10 ? 'text-amber-600' : 'text-green-600'}`}>
                  {daysLeft}d remaining
                </span>
              )}
              {store.notes && (
                <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{store.notes}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 flex-shrink-0">
          <button onClick={sendWhatsApp}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80"
            style={{ background: '#25D366' }} title="Send WhatsApp">
            <MessageCircle size={15} className="text-white" />
          </button>
          <button onClick={() => setShowEdit(!showEdit)}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-blue-50 border"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
            <Edit2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {showEdit && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="pt-3 mt-3 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
              {/* Activate with months */}
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Months</label>
                  <select value={months} onChange={e => setMonths(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                    {[1, 3, 6, 12].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Fee ₹/mo</label>
                  <input type="number" value={fee} onChange={e => setFee(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: 'var(--border)' }} />
                </div>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('activate')} disabled={loading}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 mt-4"
                  style={{ background: '#059669' }}>
                  {loading ? '...' : 'Activate'}
                </motion.button>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Notes</label>
                <input value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Optional note..." className="w-full px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: 'var(--border)' }} />
              </div>

              {/* Suspend / Unsuspend */}
              <div className="flex gap-2">
                {store.status !== 'suspended' ? (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('suspend')} disabled={loading}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: '#dc2626' }}>
                    <PauseCircle size={12} className="inline mr-1" /> Suspend Access
                  </motion.button>
                ) : (
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAction('unsuspend')} disabled={loading}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: '#059669' }}>
                    <PlayCircle size={12} className="inline mr-1" /> Restore Access
                  </motion.button>
                )}
                <button onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border" style={{ borderColor: 'var(--border)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'trial' | 'suspended'>('all');

  const loadStores = useCallback(() => {
    // Seed demo stores if empty
    let all = getAllStores();
    if (all.length === 0) {
      saveAllStores(DEMO_STORES);
      all = [...DEMO_STORES];
    }
    setStores([...all].sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()));
  }, []);

  useEffect(() => {
    setAuthed(isAdminLoggedIn());
    if (isAdminLoggedIn()) loadStores();
  }, [loadStores]);

  const onLogin = () => { setAuthed(true); loadStores(); };

  const filtered = stores.filter(s => {
    const matchSearch = s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: stores.length,
    active: stores.filter(s => s.status === 'active').length,
    trial: stores.filter(s => s.status === 'trial').length,
    suspended: stores.filter(s => s.status === 'suspended').length,
    mrr: stores.filter(s => s.status === 'active').reduce((s, x) => s + x.monthlyFee, 0),
  };

  if (!authed) return <LoginForm onLogin={onLogin} />;

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ff' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur-md" style={{ borderColor: '#e2e8f0' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
                <Crown size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>RetailOS Admin</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Master Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadStores}
                className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}>
                <RefreshCw size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button onClick={() => { adminLogout(); setAuthed(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors text-red-600 border border-red-100">
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Stores', value: stats.total, color: 'var(--primary)', bg: '#e8f0fe' },
            { label: 'Active Paid', value: stats.active, color: '#059669', bg: '#d1fae5' },
            { label: 'On Trial', value: stats.trial, color: '#d97706', bg: '#fef3c7' },
            { label: 'MRR', value: `₹${stats.mrr.toLocaleString()}`, color: '#7c3aed', bg: '#ede9fe', isText: true },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-3.5 border text-center" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue banner */}
        <div className="bg-white rounded-2xl border p-4 mb-5 flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)' }}>
            <BarChart3 size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Monthly Recurring Revenue: ₹{stats.mrr.toLocaleString('en-IN')}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {stats.trial} stores on trial · Potential: ₹{(stats.trial * 999 + stats.mrr).toLocaleString('en-IN')}/month if all convert
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black" style={{ color: '#059669' }}>
              +{stats.active > 0 ? Math.round((stats.active / Math.max(stats.total, 1)) * 100) : 0}%
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>conversion</p>
          </div>
        </div>

        {/* Expiring trial alert */}
        {stores.filter(s => s.status === 'trial' && getDaysRemaining(s.phone) <= 3).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              {stores.filter(s => s.status === 'trial' && getDaysRemaining(s.phone) <= 3).length} trial store(s) expiring in ≤3 days — Send payment reminders!
            </p>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-white" placeholder="Search stores..."
              value={search} onChange={e => setSearch(e.target.value)} style={{ borderColor: 'var(--border)' }} />
          </div>
          {(['all', 'active', 'trial', 'suspended'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all capitalize"
              style={{
                background: filter === f ? 'var(--primary)' : 'white',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Store list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
              <Store size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No stores found</p>
            </div>
          ) : (
            filtered.map(store => (
              <StoreCard key={store.phone} store={store} onUpdate={loadStores} />
            ))
          )}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
          RetailOS Admin v1.0 · Secured · Only for authorized personnel
        </p>
      </div>
    </div>
  );
}
