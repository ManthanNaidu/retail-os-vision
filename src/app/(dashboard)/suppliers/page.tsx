'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Star, Plus, X, Search, Check, Menu, Bell,
  Edit2, CreditCard, Factory, Package, MessageCircle, Trash2, Users
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  totalOrders: number;
  outstandingAmount: number;
  paymentTerms: string;
  gstNumber: string;
}

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Medplus Pharma Wholesale', contactPerson: 'Ashok Verma', phone: '9876543210', address: 'Jayanagar, Bangalore', category: 'Medicine', rating: 4.9, totalOrders: 34, outstandingAmount: 18500, paymentTerms: '30 days', gstNumber: '29ABCDE1234F1Z5' },
  { id: 's2', name: 'Metro Cash & Carry', contactPerson: 'Rajiv Singh', phone: '9123456789', address: 'Electronic City, Bangalore', category: 'Grocery', rating: 4.7, totalOrders: 28, outstandingAmount: 32000, paymentTerms: '15 days', gstNumber: '29FGHIJ5678K2Z6' },
  { id: 's3', name: 'HUL Distributor - KA', contactPerson: 'Kavitha Nair', phone: '9234567890', address: 'Peenya, Bangalore', category: 'FMCG', rating: 4.6, totalOrders: 45, outstandingAmount: 25000, paymentTerms: '21 days', gstNumber: '29KLMNO9012P3Z7' },
  { id: 's4', name: 'Amul Dairy Cooperative', contactPerson: 'Suresh Kumar', phone: '9345678901', address: 'Yeshwanthpur, Bangalore', category: 'Dairy', rating: 4.8, totalOrders: 52, outstandingAmount: 12000, paymentTerms: '7 days', gstNumber: '29PQRST3456Q4Z8' },
];

function SupplierForm({ supplier, onSave, onClose }: { supplier?: Supplier; onSave: (s: Supplier) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    category: supplier?.category || 'Grocery',
    paymentTerms: supplier?.paymentTerms || '30 days',
    gstNumber: supplier?.gstNumber || '',
    outstandingAmount: supplier?.outstandingAmount?.toString() || '0',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: supplier?.id || `sup-${Date.now()}`,
      name: form.name, contactPerson: form.contactPerson,
      phone: form.phone, address: form.address,
      category: form.category, rating: supplier?.rating || 4.5,
      totalOrders: supplier?.totalOrders || 0,
      outstandingAmount: Number(form.outstandingAmount),
      paymentTerms: form.paymentTerms, gstNumber: form.gstNumber,
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', damping: 28 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-pearl)', color: 'var(--text-secondary)' }}><X size={16} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          {[
            { label: 'Business Name *', key: 'name', placeholder: 'e.g. Medplus Pharma' },
            { label: 'Contact Person', key: 'contactPerson', placeholder: 'e.g. Ashok Verma' },
            { label: 'Phone *', key: 'phone', placeholder: '10-digit number' },
            { label: 'Address', key: 'address', placeholder: 'City, State' },
            { label: 'GST Number', key: 'gstNumber', placeholder: 'e.g. 29ABCDE...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
              <input className="input-premium text-sm w-full" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} required={f.label.includes('*')} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select className="input-premium text-sm w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                {['Grocery', 'Medicine', 'FMCG', 'Dairy', 'Electronics', 'Clothing'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Payment Terms</label>
              <select className="input-premium text-sm w-full" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                {['7 days', '15 days', '21 days', '30 days', 'Advance', 'COD'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Outstanding Amount</label>
            <input type="number" className="input-premium text-sm w-full" value={form.outstandingAmount} onChange={e => set('outstandingAmount', e.target.value)} min="0" />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit"
            className="btn-primary w-full !rounded-2xl !py-4 flex items-center justify-center gap-2 mt-4">
            <Check size={18} /> {supplier ? 'Save Changes' : 'Add Supplier'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = suppliers.reduce((sum, sup) => sum + sup.outstandingAmount, 0);
  const totalOrders = suppliers.reduce((sum, sup) => sum + sup.totalOrders, 0);

  const notifications = useAppStore(s => s.notifications);
  const sectionNotifications = notifications.filter(n => !n.section || n.section === '/suppliers');
  const unreadCount = sectionNotifications.filter(n => !n.isRead).length;

  const handleSave = (s: Supplier) => {
    if (editingSupplier) setSuppliers(prev => prev.map(x => x.id === s.id ? s : x));
    else setSuppliers(prev => [s, ...prev]);
    setEditingSupplier(undefined);
  };

  const handleDelete = () => {
    if (supplierToDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="page-enter has-bottom-nav" style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Orange Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #FF7B00 0%, #FF5500 100%)', paddingBottom: '32px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => useAppStore.getState().toggleSidebar()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Menu size={24} color="white" />
                </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <Bell size={22} color="white" />
                    {unreadCount > 0 && (
                        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#EF4444', color: 'white', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid #FF5500' }}>
                            {unreadCount}
                        </div>
                    )}
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6B00', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    U
                </div>
            </div>
        </div>

        {/* Hero Content */}
        <div style={{ padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ zIndex: 10, maxWidth: '60%' }}>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 600, margin: '0 0 2px' }}>Suppliers</p>
                <h2 style={{ color: 'white', fontSize: '28px', fontWeight: 800, lineHeight: 1.1, margin: '0 0 4px' }}>
                    Manage your vendors
                </h2>
                
                <button onClick={() => { setEditingSupplier(undefined); setShowForm(true); }} style={{ background: 'white', color: '#FF6B00', border: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '16px' }}>
                    <Plus size={18} /> Add Supplier
                </button>
            </div>
            
            <img src="/images/suppliers_banner.jpg" alt="Suppliers" style={{ position: 'absolute', right: '-20px', top: '-10px', width: '220px', height: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
      </div>

      {/* Stats Cards - Overlapping the banner */}
      <div style={{ padding: '0 16px', marginTop: '-24px', position: 'relative', zIndex: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Users size={16} color="#EA580C" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total Suppliers</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{suppliers.length}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Package size={16} color="#3B82F6" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total Orders</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{totalOrders}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <CreditCard size={16} color="#EF4444" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total Outstanding</p>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>{formatCurrency(totalOutstanding)}</p>
              </div>
          </div>
      </div>

        <div className="px-4 mb-6 mt-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input 
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium focus:outline-none"
              style={{ background: 'white', border: 'none', color: '#111827', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
            />
          </div>
        </div>

        <div className="px-4 mb-4">
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#F97316', letterSpacing: '0.05em', textTransform: 'uppercase' }}>All Suppliers</p>
        </div>

        <div className="px-4 space-y-3 pb-24">
          {filtered.map(supplier => (
              <div key={supplier.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                      <Factory size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>{supplier.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0 4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#EA580C' }}>{supplier.category}</span>
                          <span style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={10} /> {supplier.phone}
                          </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="currentColor" /> {supplier.rating}
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: supplier.outstandingAmount > 0 ? '#EF4444' : '#10B981', margin: 0 }}>
                      {supplier.outstandingAmount > 0 ? `Due: ${formatCurrency(supplier.outstandingAmount)}` : 'Clear'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a 
                    href={`https://wa.me/91${supplier.phone}?text=Hello ${supplier.contactPerson},`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1.2, height: '36px', borderRadius: '10px', border: '1px solid #D1FAE5', background: '#22C55E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <button onClick={() => { setEditingSupplier(supplier); setShowForm(true); }} style={{ flex: 1, height: '36px', borderRadius: '10px', border: '1px solid #F3F4F6', background: 'white', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button onClick={() => setSupplierToDelete(supplier)} style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '10px', border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
          ))}
        </div>
        <AnimatePresence>
        {showForm && (
          <SupplierForm 
            supplier={editingSupplier} 
            onSave={handleSave} 
            onClose={() => { setShowForm(false); setEditingSupplier(undefined); }} 
          />
        )}
        {supplierToDelete && (
          <ConfirmDelete
            title="Delete Supplier"
            message={`Are you sure you want to delete ${supplierToDelete.name}? This action cannot be undone.`}
            onConfirm={handleDelete}
            onCancel={() => setSupplierToDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
