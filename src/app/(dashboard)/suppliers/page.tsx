'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Star, Plus, X, Search, Check,
  Edit2, CreditCard, Factory, Package, MessageCircle, Trash2
} from 'lucide-react';
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
    <div className="page-enter has-bottom-nav">
      <div className="page-container py-5">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Suppliers</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your vendors</p>
          </div>
          <button 
            onClick={() => { setEditingSupplier(undefined); setShowForm(true); }}
            className="btn-primary h-10 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold">
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input 
            className="input-premium pl-10 w-full h-12" 
            placeholder="Search suppliers..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="card p-3 text-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'var(--primary-light)' }}>
              <Factory size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{suppliers.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Suppliers</p>
          </div>
          <div className="card p-3 text-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Package size={16} style={{ color: '#3b82f6' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{totalOrders}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Orders</p>
          </div>
          <div className="card p-3 text-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <CreditCard size={16} style={{ color: '#ef4444' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalOutstanding)}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Outstanding</p>
          </div>
        </div>

        {/* List */}
        <p className="section-header">All Suppliers</p>
        <div className="space-y-3">
          {filtered.map(supplier => (
            <div key={supplier.id} className="list-item flex flex-col gap-3 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{supplier.name}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {supplier.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Phone size={12} /> {supplier.phone}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#f59e0b' }}>
                    <Star size={14} fill="currentColor" /> {supplier.rating}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: supplier.outstandingAmount > 0 ? '#ef4444' : '#10b981' }}>
                    {supplier.outstandingAmount > 0 ? `Due: ${formatCurrency(supplier.outstandingAmount)}` : 'Clear'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <a 
                  href={`https://wa.me/91${supplier.phone}?text=Hello ${supplier.contactPerson},`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold text-white"
                  style={{ background: '#22c55e' }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
                <button 
                  onClick={() => { setEditingSupplier(supplier); setShowForm(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--bg-pearl)', color: 'var(--text-secondary)' }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={() => setSupplierToDelete(supplier)}
                  className="w-10 flex items-center justify-center h-9 rounded-xl"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

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
