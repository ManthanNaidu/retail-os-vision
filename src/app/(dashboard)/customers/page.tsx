'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, X, Phone, MessageCircle, CreditCard,
  Star, Edit2, Trash2, Check, Users, TrendingUp,
  Send, ChevronRight, Gift, Tag, Radio, Menu, Bell, Shield, Wallet
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
              <input className="input-premium !pl-[36px]" type="tel" value={form.phone}
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
      style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Avatar */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', fontSize: '16px', fontWeight: 'bold' }}>
                  {customer.name.charAt(0)}
              </div>
              
              {/* Info */}
              <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{customer.name}</p>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: seg.bg, color: seg.color }}>
                          {customer.segment}
                      </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>+91 {customer.phone}</p>
                      {customer.loyaltyPoints > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Star size={12} color="#F59E0B" fill="#F59E0B" />
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#D97706' }}>{customer.loyaltyPoints} pts</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: customer.creditBalance > 0 ? '#EF4444' : '#10B981', margin: 0 }}>
                  {customer.creditBalance > 0 ? formatCurrency(customer.creditBalance) : '₹0'}
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, fontWeight: 500 }}>
                  {customer.creditBalance > 0 ? 'Due' : 'No Due'}
              </p>
          </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onWhatsApp} style={{ flex: 1, height: '36px', borderRadius: '12px', border: '1px solid #D1FAE5', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <MessageCircle size={15} />
          </button>
          <button onClick={onEdit} style={{ flex: 1, height: '36px', borderRadius: '12px', border: '1px solid #FEF3C7', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Edit2 size={15} />
          </button>
          <button onClick={onDelete} style={{ flex: 1, height: '36px', borderRadius: '12px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Trash2 size={15} />
          </button>
      </div>
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

  // Notifications filtering for this page
  const notifications = useAppStore(s => s.notifications);
  const sectionNotifications = notifications.filter(n => !n.section || n.section === '/customers');
  const unreadCount = sectionNotifications.filter(n => !n.isRead).length;

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
    <div className="has-bottom-nav" style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F4F6FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => useAppStore.getState().toggleSidebar()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Menu size={24} color="#111827" />
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Customers</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                  <Bell size={22} color="#111827" />
                  {unreadCount > 0 && (
                      <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#EF4444', color: 'white', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid #F4F6FA' }}>
                          {unreadCount}
                      </div>
                  )}
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  U
              </div>
          </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
          
          {/* Hero Banner */}
          <div style={{ background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', borderRadius: '16px', padding: '24px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(199, 210, 254, 0.5)' }}>
              <div style={{ position: 'relative', zIndex: 10, maxWidth: '65%' }}>
                  <h2 style={{ color: '#111827', fontSize: '18px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 4px' }}>
                      Customers Overview
                  </h2>
                  <p style={{ color: '#4B5563', fontSize: '12px', fontWeight: 500, margin: '0 0 20px' }}>
                      Manage and build relationships
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowBroadcast(true)} style={{ background: '#22C55E', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', boxShadow: '0 4px 6px rgba(34, 197, 94, 0.2)' }}>
                          <Radio size={16} /> Broadcast
                      </button>
                      <button onClick={() => { setEditCustomer(undefined); setShowForm(true); }} style={{ background: '#F97316', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)' }}>
                          <Plus size={16} /> Add Customer
                      </button>
                  </div>
              </div>
              <img src="/images/icons/customers.jpg" alt="Customers" style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '150px', height: '150px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Users size={16} color="#3B82F6" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{stats.total}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Shield size={16} color="#A855F7" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>VIP Members</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{stats.vip}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Wallet size={16} color="#EF4444" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Credit Due</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#EF4444', margin: 0 }}>{formatCurrency(stats.totalCredit)}</p>
              </div>
          </div>

          {/* Search & Filters */}
          <div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                      type="text" 
                      placeholder="Search by name or phone..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1px solid #F3F4F6', outline: 'none', fontSize: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', background: 'white' }}
                  />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
                  {SEGMENT_TABS.map(tab => (
                      <button
                          key={tab.key}
                          onClick={() => setSegmentFilter(tab.key)}
                          style={{
                              padding: '8px 16px',
                              borderRadius: '100px',
                              fontSize: '13px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              border: 'none',
                              background: segmentFilter === tab.key ? '#F97316' : '#F3F4F6',
                              color: segmentFilter === tab.key ? 'white' : '#4B5563',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                          }}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* Customer List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <Users size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
                      <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>
                          {search ? 'No customers match your search.' : 'No customers yet.'}
                      </p>
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
