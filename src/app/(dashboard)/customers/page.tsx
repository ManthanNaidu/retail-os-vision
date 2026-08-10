'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Phone, MessageCircle, CreditCard,
  Star, Edit2, Trash2, Check, Users, TrendingUp,
  Send, ChevronRight, Gift, Tag, Radio
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';

type Segment = 'all' | 'VIP' | 'Regular' | 'Inactive' | 'New';

const SEGMENT_CONFIG: Record<string, { bg: string; color: string }> = {
  VIP:      { bg: '#fef3c7', color: '#d97706' },
  Regular:  { bg: '#d1fae5', color: '#059669' },
  Inactive: { bg: '#f1f5f9', color: '#64748b' },
  New:      { bg: '#e8f0fe', color: 'var(--primary)' },
};

const getDefaultTemplates = (storeName: string) => [
  { label: 'Weekend Sale',   text: `Dear {name}, Weekend Special at ${storeName}! Get 10% off on all items this Saturday & Sunday. Visit us or call to order. Valid 2 days only!` },
  { label: 'New Stock',      text: `Hi {name}! Fresh stock arrived at ${storeName}. Come early for best availability. See you soon!` },
  { label: 'Festive Offer',  text: `Wishing you a happy festive season, {name}! Special offers at ${storeName} — flat 15% off. Celebrate with us!` },
  { label: 'Credit Reminder', text: `Dear {name}, a gentle reminder that your account has a pending balance at ${storeName}. Please settle at your earliest convenience. Thank you!` },
  { label: 'Birthday',       text: `Happy Birthday {name}! As a special birthday gift from ${storeName}, enjoy 20% off your next purchase. Valid this week. Have a wonderful day!` },
];

// ── WhatsApp Broadcast Modal ────────────────────────────────────
function WhatsAppBroadcastModal({ customers, onClose }: {
  customers: Customer[]; onClose: () => void;
}) {
  const [storeName, setStoreName] = useState('Our Store');
  const [templates, setTemplates] = useState(() => getDefaultTemplates('Our Store'));
  const [message, setMessage] = useState(templates[0].text);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'compose' | 'send' | 'done'>('compose');
  const [sendIndex, setSendIndex] = useState(0);

  // Fetch actual store name on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const profileStr = localStorage.getItem('retailos_profile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          if (profile.storeName) {
            setStoreName(profile.storeName);
            const newTemplates = getDefaultTemplates(profile.storeName);
            setTemplates(newTemplates);
            setMessage(newTemplates[0].text);
          }
        }
      } catch (e) {}
    }
  });

  const toggle = (id: string) => setSelected(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const selectAll = () => {
    if (selected.size === customers.length) setSelected(new Set());
    else setSelected(new Set(customers.map(c => c.id)));
  };

  const selectedCustomers = customers.filter(c => selected.has(c.id));

  const sendNext = () => {
    const customer = selectedCustomers[sendIndex];
    if (!customer) { setStep('done'); return; }
    const personalizedMsg = message.replace(/\{name\}/g, customer.name.split(' ')[0]);
    window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(personalizedMsg)}`, '_blank');
    if (sendIndex + 1 >= selectedCustomers.length) {
      setTimeout(() => setStep('done'), 500);
    } else {
      setSendIndex(i => i + 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#d1fae5' }}>
              <MessageCircle size={18} style={{ color: '#059669' }} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>WhatsApp Broadcast</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Send offers to customers</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        {/* Done state */}
        {step === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check size={36} className="text-green-600" />
            </motion.div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Messages Sent!</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              WhatsApp broadcast sent to {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''}
            </p>
            <button onClick={onClose} className="btn-primary mt-6 !px-8">Done</button>
          </div>
        ) : step === 'send' ? (
          /* Send step — queue */
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4 p-3.5 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-xs font-semibold" style={{ color: '#166534' }}>
                Sending to {selectedCustomers.length} customers via WhatsApp
              </p>
              <p className="text-xs mt-1" style={{ color: '#166534' }}>
                {sendIndex} of {selectedCustomers.length} sent
              </p>
              {/* Progress bar */}
              <div className="w-full bg-green-100 rounded-full h-1.5 mt-2">
                <motion.div className="h-1.5 rounded-full bg-green-500"
                  animate={{ width: `${(sendIndex / selectedCustomers.length) * 100}%` }} />
              </div>
            </div>

            {selectedCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--border)', opacity: i < sendIndex ? 0.4 : 1 }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: i < sendIndex ? '#059669' : 'var(--primary)' }}>
                  {i < sendIndex ? <Check size={14} /> : c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {c.phone}</p>
                </div>
                {i === sendIndex && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>
                    Next
                  </span>
                )}
              </div>
            ))}

            <motion.button whileTap={{ scale: 0.97 }} onClick={sendNext}
              className="w-full mt-5 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
              style={{ background: '#25D366' }}>
              <MessageCircle size={18} />
              {sendIndex === 0 ? 'Start Sending' : `Send to ${selectedCustomers[sendIndex]?.name?.split(' ')[0]}`}
            </motion.button>
          </div>
        ) : (
          /* Compose step */
          <div className="flex-1 overflow-y-auto">
            {/* Templates */}
            <div className="px-5 pt-4 pb-3">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Quick Templates</p>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {templates.map((t, i) => (
                  <button key={i} onClick={() => setMessage(t.text)}
                    className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                    style={{
                      background: message === t.text ? '#25D366' : 'white',
                      color: message === t.text ? 'white' : 'var(--text-secondary)',
                      borderColor: message === t.text ? '#25D366' : 'var(--border)',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message compose */}
            <div className="px-5 pb-3">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Message <span style={{ color: 'var(--text-muted)' }}>({"{name}"} = customer's first name)</span>
              </p>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                className="input-premium text-sm resize-none"
                placeholder="Type your offer message..." />
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{message.length}/300 characters</p>
            </div>

            {/* Customer selector */}
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Select Customers ({selected.size} selected)
                </p>
                <button onClick={selectAll} className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  {selected.size === customers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-1.5 max-h-44 overflow-y-auto">
                {customers.map(c => (
                  <button key={c.id} onClick={() => toggle(c.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left"
                    style={{
                      borderColor: selected.has(c.id) ? '#25D366' : 'var(--border)',
                      background: selected.has(c.id) ? '#f0fdf4' : 'var(--bg-pearl)',
                    }}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${selected.has(c.id) ? 'bg-green-500' : 'border-2'}`}
                      style={{ borderColor: selected.has(c.id) ? 'transparent' : 'var(--border-strong)' }}>
                      {selected.has(c.id) && <Check size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {c.phone}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: SEGMENT_CONFIG[c.segment]?.bg, color: SEGMENT_CONFIG[c.segment]?.color }}>
                      {c.segment}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Send button */}
            <div className="px-5 pb-6">
              <motion.button whileTap={{ scale: 0.97 }}
                disabled={selected.size === 0 || !message.trim()}
                onClick={() => { setSendIndex(0); setStep('send'); }}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: selected.size > 0 && message.trim() ? '#25D366' : '#e2e8f0',
                  color: selected.size > 0 && message.trim() ? 'white' : 'var(--text-muted)',
                }}>
                <MessageCircle size={18} />
                Send to {selected.size} Customer{selected.size !== 1 ? 's' : ''} via WhatsApp
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Customer Form ───────────────────────────────────────────────
function CustomerForm({ customer, onSave, onClose }: {
  customer?: Customer; onSave: (c: Customer) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    birthday: customer?.birthday || '',
    segment: customer?.segment || ('New' as Customer['segment']),
    loyaltyPoints: customer?.loyaltyPoints?.toString() || '0',
    creditBalance: customer?.creditBalance?.toString() || '0',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: customer?.id || `c-${Date.now()}`,
      name: form.name, phone: form.phone,
      email: form.email || undefined, address: form.address || undefined,
      birthday: form.birthday || undefined,
      segment: form.segment as Customer['segment'],
      loyaltyPoints: Number(form.loyaltyPoints),
      creditBalance: Number(form.creditBalance),
      totalPurchases: customer?.totalPurchases || 0,
      createdAt: customer?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex justify-between items-center px-5 pt-5 pb-4 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {customer ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
            <input className="input-premium" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Rahul Sharma" autoFocus />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>WhatsApp Number *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>+91</span>
              <input className="input-premium pl-10" type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                required placeholder="10-digit number" maxLength={10} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input className="input-premium text-sm" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Birthday</label>
              <input className="input-premium text-sm" type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address</label>
            <input className="input-premium text-sm" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Optional" />
          </div>

          {/* Segment */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Segment</label>
            <div className="grid grid-cols-4 gap-2">
              {(['New', 'Regular', 'VIP', 'Inactive'] as const).map(seg => (
                <button key={seg} type="button" onClick={() => set('segment', seg)}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: form.segment === seg ? 'var(--primary)' : 'var(--bg-pearl)',
                    color: form.segment === seg ? 'white' : 'var(--text-secondary)',
                    border: `1.5px solid ${form.segment === seg ? 'var(--primary)' : 'var(--border)'}`,
                  }}>
                  {seg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Credit Balance ₹</label>
              <input className="input-premium text-sm" type="number" min="0" value={form.creditBalance} onChange={e => set('creditBalance', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Loyalty Points</label>
              <input className="input-premium text-sm" type="number" min="0" value={form.loyaltyPoints} onChange={e => set('loyaltyPoints', e.target.value)} />
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Check size={17} /> {customer ? 'Save Changes' : 'Add Customer'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Customer Row ───────────────────────────────────────────────
function CustomerRow({ customer, onEdit, onDelete, onWhatsApp, index }: {
  customer: Customer; onEdit: () => void; onDelete: () => void;
  onWhatsApp: () => void; index: number;
}) {
  const seg = SEGMENT_CONFIG[customer.segment] || SEGMENT_CONFIG.New;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="list-item"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
        style={{ background: 'var(--primary)' }}>
        {customer.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: seg.bg, color: seg.color }}>{customer.segment}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>+91 {customer.phone}</p>
          {customer.creditBalance > 0 && (
            <p className="text-xs font-semibold text-red-500">Due: {formatCurrency(customer.creditBalance)}</p>
          )}
          {customer.loyaltyPoints > 0 && (
            <p className="text-xs font-semibold text-amber-600">{customer.loyaltyPoints} pts</p>
          )}
        </div>
      </div>

      {/* WhatsApp — prominent green button */}
      <button onClick={onWhatsApp}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
        style={{ background: '#25D366' }}
        title="Send WhatsApp message">
        <MessageCircle size={16} className="text-white" />
      </button>

      {/* Edit */}
      <button onClick={onEdit}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-blue-50 transition-colors"
        style={{ border: '1px solid var(--border)' }}>
        <Edit2 size={13} style={{ color: 'var(--primary)' }} />
      </button>

      {/* Delete */}
      <button onClick={onDelete}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-red-50 transition-colors"
        style={{ border: '1px solid var(--border)' }}>
        <Trash2 size={13} className="text-red-400" />
      </button>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppStore();
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<Segment>('all');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [showBroadcast, setShowBroadcast] = useState(false);

  const filtered = useMemo(() => {
    let list = customers;
    if (segmentFilter !== 'all') list = list.filter(c => c.segment === segmentFilter);
    if (search) list = list.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
    return list;
  }, [customers, segmentFilter, search]);

  const stats = useMemo(() => ({
    total: customers.length,
    vip: customers.filter(c => c.segment === 'VIP').length,
    withCredit: customers.filter(c => c.creditBalance > 0).length,
    totalCredit: customers.reduce((s, c) => s + c.creditBalance, 0),
  }), [customers]);

  const handleSave = (c: Customer) => {
    if (editCustomer) updateCustomer(c.id, c);
    else addCustomer(c);
    setEditCustomer(undefined);
  };

  const sendDirectWhatsApp = (customer: Customer) => {
    let storeName = 'Our Store';
    try {
      const profile = localStorage.getItem('retailos_profile');
      if (profile) storeName = JSON.parse(profile).storeName || storeName;
    } catch(e){}
    const msg = `Hi ${customer.name.split(' ')[0]}! Welcome to ${storeName}. How can we help you today?`;
    window.open(`https://wa.me/91${customer.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const SEGMENT_TABS: { key: Segment; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'VIP', label: 'VIP' },
    { key: 'Regular', label: 'Regular' },
    { key: 'New', label: 'New' },
    { key: 'Inactive', label: 'Inactive' },
  ];

  return (
    <div className="page-enter has-bottom-nav">
      <div className="page-container py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Customers</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {stats.total} customers · {stats.withCredit} with pending credit
            </p>
          </div>
          <div className="flex gap-2">
            {/* WhatsApp Broadcast — prominent green */}
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 !py-2.5 !px-4 text-sm font-bold rounded-full text-white"
              style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
              <Radio size={15} /> Broadcast
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setEditCustomer(undefined); setShowForm(true); }}
              className="btn-primary !py-2.5 !px-4 text-sm flex items-center gap-2">
              <Plus size={16} /> Add
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { label: 'Total', value: stats.total, color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'VIP Members', value: stats.vip, color: '#d97706', bg: '#fef3c7' },
            { label: 'Credit Due', value: formatCurrency(stats.totalCredit), color: '#dc2626', bg: '#fee2e2', small: true },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
              <p className={`font-bold ${s.small ? 'text-base' : 'text-xl'}`} style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-premium pl-10 text-sm" placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Segment filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {SEGMENT_TABS.map(tab => (
            <button key={tab.key} onClick={() => setSegmentFilter(tab.key)}
              className="flex-shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all"
              style={{
                background: segmentFilter === tab.key ? 'var(--primary)' : 'white',
                color: segmentFilter === tab.key ? 'white' : 'var(--text-secondary)',
                borderColor: segmentFilter === tab.key ? 'var(--primary)' : 'var(--border)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Customer list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {search ? 'No customers match your search' : 'No customers yet'}
              </p>
              {!search && (
                <button onClick={() => setShowForm(true)}
                  className="btn-primary mt-4 !px-6 !py-2.5 text-sm">Add First Customer</button>
              )}
            </div>
          ) : (
            filtered.map((c, i) => (
              <CustomerRow key={c.id} customer={c} index={i}
                onEdit={() => { setEditCustomer(c); setShowForm(true); }}
                onDelete={() => setDeleteTarget(c)}
                onWhatsApp={() => sendDirectWhatsApp(c)}
              />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && <CustomerForm customer={editCustomer} onSave={handleSave} onClose={() => { setShowForm(false); setEditCustomer(undefined); }} />}
        {showBroadcast && <WhatsAppBroadcastModal customers={customers} onClose={() => setShowBroadcast(false)} />}
        {deleteTarget && (
          <ConfirmDelete
            title={`Delete "${deleteTarget.name}"?`}
            message="This customer and all their data will be permanently removed. This cannot be undone."
            onConfirm={() => { deleteCustomer(deleteTarget.id); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
