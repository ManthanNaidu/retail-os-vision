'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Edit2, Trash2, X, Package,
  AlertTriangle, Clock, CheckCircle, ChevronDown, Check, FileImage
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';
import { Product } from '@/types';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { InvoiceScanner } from '@/components/shared/InvoiceScanner';

import { getStoreType } from '@/lib/storeTypes';

type FilterType = 'all' | 'low' | 'expiring' | 'out';

function getProfileCategories(): string[] {
  try {
    const p = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
    if (p.storeType) return getStoreType(p.storeType).categories;
  } catch {}
  return ['Grocery', 'Dairy', 'Hygiene', 'Medicine', 'Beverages', 'Cleaning', 'Personal Care', 'Electronics', 'Clothing', 'Other'];
}

function getProfileUnits(): string[] {
  try {
    const p = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
    if (p.storeType) return getStoreType(p.storeType).units;
  } catch {}
  return ['Piece', 'Kg', 'Litre', 'Strip', 'Box', 'Packet', 'Bundle', 'Dozen', 'Gram', 'Ml'];
}

const GST_RATES = ['0', '5', '12', '18', '28'];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Grocery:       { bg: '#fef3c7', color: '#d97706' },
  Dairy:         { bg: '#dbeafe', color: '#2563eb' },
  Hygiene:       { bg: '#ede9fe', color: '#7c3aed' },
  Medicine:      { bg: '#fee2e2', color: '#dc2626' },
  Beverages:     { bg: '#d1fae5', color: '#059669' },
  Cleaning:      { bg: '#e0f2fe', color: '#0284c7' },
  'Personal Care': { bg: '#fce7f3', color: '#db2777' },
};

function getStockStatus(p: Product) {
  if (p.stock === 0) return { label: 'Out of Stock', color: '#dc2626', bg: '#fee2e2' };
  if (p.stock < p.minStock) return { label: 'Low Stock', color: '#d97706', bg: '#fef3c7' };
  return { label: 'In Stock', color: '#059669', bg: '#d1fae5' };
}

// ── Product Form Modal ─────────────────────────────────────────
function ProductForm({ product, onSave, onClose }: {
  product?: Product; onSave: (p: Product) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    category: product?.category || 'Grocery',
    brand: product?.brand || '',
    purchasePrice: product?.purchasePrice?.toString() || '',
    sellingPrice: product?.sellingPrice?.toString() || '',
    mrp: product?.mrp?.toString() || '',
    stock: product?.stock?.toString() || '',
    minStock: product?.minStock?.toString() || '10',
    unit: product?.unit || 'Piece',
    gstPercent: product?.gstPercent?.toString() || '5',
    barcode: product?.barcode || '',
    expiryDate: product?.expiryDate || '',
    batchNumber: product?.batchNumber || '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const margin = form.purchasePrice && form.sellingPrice
    ? (((Number(form.sellingPrice) - Number(form.purchasePrice)) / Number(form.purchasePrice)) * 100).toFixed(1)
    : null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: product?.id || `p-${Date.now()}`,
      sku: product?.sku || `SKU${Date.now()}`,
      name: form.name, category: form.category, brand: form.brand,
      purchasePrice: Number(form.purchasePrice),
      sellingPrice: Number(form.sellingPrice),
      mrp: Number(form.mrp || form.sellingPrice),
      stock: Number(form.stock), minStock: Number(form.minStock),
      unit: form.unit, gstPercent: Number(form.gstPercent),
      barcode: form.barcode, expiryDate: form.expiryDate, batchNumber: form.batchNumber,
      isActive: true,
      createdAt: product?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex justify-between items-center px-5 pt-5 pb-4 border-b"
          style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Product Name */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Product Name *</label>
            <input className="input-premium" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Tata Salt 1kg" required autoFocus />
          </div>

          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select className="input-premium text-sm" value={form.category} onChange={e => set('category', e.target.value)}>
                {getProfileCategories().map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Brand</label>
              <input className="input-premium text-sm" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Tata" />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Pricing (₹)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'purchasePrice', label: 'Purchase' },
                { k: 'sellingPrice', label: 'Selling' },
                { k: 'mrp', label: 'MRP' },
              ].map(f => (
                <div key={f.k}>
                  <p className="text-[10px] text-center mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                  <input type="number" className="input-premium text-sm text-center" step="0.01" min="0"
                    value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)}
                    placeholder="0" required={f.k !== 'mrp'} />
                </div>
              ))}
            </div>
            {margin && (
              <p className="text-xs mt-2 font-semibold" style={{ color: Number(margin) > 0 ? '#059669' : '#dc2626' }}>
                Margin: {margin}%
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stock Qty *</label>
              <input type="number" min="0" className="input-premium text-sm" value={form.stock}
                onChange={e => set('stock', e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Min Stock</label>
              <input type="number" min="0" className="input-premium text-sm" value={form.minStock}
                onChange={e => set('minStock', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Unit</label>
              <select className="input-premium text-sm" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {getProfileUnits().map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* GST + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>GST %</label>
              <select className="input-premium text-sm" value={form.gstPercent} onChange={e => set('gstPercent', e.target.value)}>
                {GST_RATES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Expiry Date</label>
              <input type="date" className="input-premium text-sm" value={form.expiryDate}
                onChange={e => set('expiryDate', e.target.value)} />
            </div>
          </div>

          {/* Barcode + Batch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Barcode</label>
              <input className="input-premium text-sm" value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Batch No.</label>
              <input className="input-premium text-sm" value={form.batchNumber} onChange={e => set('batchNumber', e.target.value)} placeholder="Optional" />
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.97 }} type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2">
            <Check size={17} /> {product ? 'Save Changes' : 'Add Product'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Product Card ──────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete, index }: {
  product: Product; onEdit: () => void; onDelete: () => void; index: number;
}) {
  const status = getStockStatus(product);
  const catStyle = CATEGORY_COLORS[product.category] || { bg: '#f1f5f9', color: '#64748b' };
  const daysToExpiry = product.expiryDate ? getDaysUntilExpiry(product.expiryDate) : null;
  const margin = product.purchasePrice > 0
    ? (((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(0)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="list-item"
    >
      {/* Category dot */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{ background: catStyle.bg, color: catStyle.color }}>
        {product.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
          {daysToExpiry !== null && daysToExpiry <= 30 && daysToExpiry > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: '#fee2e2', color: '#dc2626' }}>
              Exp {daysToExpiry}d
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.category}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(product.sellingPrice)}
          </span>
          {margin && <span className="text-[10px] font-semibold" style={{ color: '#059669' }}>{margin}% margin</span>}
        </div>
      </div>

      {/* Stock */}
      <div className="text-center flex-shrink-0">
        <p className="text-sm font-bold" style={{ color: status.color }}>{product.stock}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{product.unit}</p>
      </div>

      {/* Status badge */}
      <span className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 hidden sm:inline"
        style={{ background: status.bg, color: status.color }}>
        {status.label}
      </span>

      {/* Actions */}
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={onEdit}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors"
          style={{ border: '1px solid var(--border)' }}>
          <Edit2 size={13} style={{ color: 'var(--primary)' }} />
        </button>
        <button onClick={onDelete}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
          style={{ border: '1px solid var(--border)' }}>
          <Trash2 size={13} className="text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const stats = useMemo(() => ({
    total: products.length,
    low: products.filter(p => p.stock > 0 && p.stock < p.minStock).length,
    out: products.filter(p => p.stock === 0).length,
    expiring: products.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 30 && getDaysUntilExpiry(p.expiryDate) > 0).length,
    totalValue: products.reduce((s, p) => s + (p.sellingPrice * p.stock), 0),
  }), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (filter === 'low')      list = list.filter(p => p.stock > 0 && p.stock < p.minStock);
    if (filter === 'out')      list = list.filter(p => p.stock === 0);
    if (filter === 'expiring') list = list.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 30 && getDaysUntilExpiry(p.expiryDate) > 0);
    if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, filter, categoryFilter, search]);

  const handleSave = (p: Product) => {
    if (editingProduct) updateProduct(p.id, p);
    else addProduct(p);
    setEditingProduct(undefined);
  };

  const FILTER_TABS = [
    { key: 'all',      label: 'All',      count: stats.total,    icon: Package },
    { key: 'low',      label: 'Low Stock', count: stats.low,     icon: AlertTriangle },
    { key: 'expiring', label: 'Expiring',  count: stats.expiring, icon: Clock },
    { key: 'out',      label: 'Out',       count: stats.out,     icon: X },
  ];

  return (
    <div className="page-enter has-bottom-nav">
      <div className="page-container py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Inventory</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {stats.total} products · Stock value {formatCurrency(stats.totalValue)}
            </p>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 !py-2.5 !px-4 text-sm font-bold rounded-full border transition-all"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}>
              <FileImage size={15} /> Scan Invoice
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingProduct(undefined); setShowForm(true); }}
              className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-sm">
              <Plus size={16} /> Add Product
            </motion.button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2.5 mb-5">
          {[
            { label: 'Total', value: stats.total,    color: 'var(--primary)', bg: 'var(--primary-light)' },
            { label: 'Low',   value: stats.low,      color: '#d97706', bg: '#fef3c7' },
            { label: 'Expire', value: stats.expiring, color: '#dc2626', bg: '#fee2e2' },
            { label: 'Out',   value: stats.out,      color: '#64748b', bg: '#f1f5f9' },
          ].map((s, i) => (
            <div key={i} onClick={() => setFilter((['all', 'low', 'expiring', 'out'] as FilterType[])[i])}
              className="rounded-2xl p-3 text-center cursor-pointer transition-all hover:opacity-90 active:scale-95"
              style={{ background: filter === (['all', 'low', 'expiring', 'out'] as FilterType[])[i] ? s.color : s.bg }}>
              <p className="text-lg font-bold"
                style={{ color: filter === (['all', 'low', 'expiring', 'out'] as FilterType[])[i] ? 'white' : s.color }}>
                {s.value}
              </p>
              <p className="text-[10px] font-semibold mt-0.5"
                style={{ color: filter === (['all', 'low', 'expiring', 'out'] as FilterType[])[i] ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-premium pl-10 text-sm" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category filter — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
          {['all', ...getProfileCategories()].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: categoryFilter === cat ? 'var(--primary)' : 'white',
                color: categoryFilter === cat ? 'white' : 'var(--text-secondary)',
                borderColor: categoryFilter === cat ? 'var(--primary)' : 'var(--border)',
              }}>
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {search || categoryFilter !== 'all' || filter !== 'all' ? (
          <p className="text-xs mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </p>
        ) : null}

        {/* Product list */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No products found</p>
              <button onClick={() => { setSearch(''); setFilter('all'); setCategoryFilter('all'); }}
                className="text-xs mt-2 underline" style={{ color: 'var(--primary)' }}>
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i}
                onEdit={() => { setEditingProduct(p); setShowForm(true); }}
                onDelete={() => setDeleteTarget(p)} />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <ProductForm product={editingProduct} onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingProduct(undefined); }} />
        )}
        {showScanner && <InvoiceScanner onClose={() => setShowScanner(false)} />}
        {deleteTarget && (
          <ConfirmDelete
            title={`Delete "${deleteTarget.name}"?`}
            message="This product will be permanently removed from inventory. This cannot be undone."
            onConfirm={() => { deleteProduct(deleteTarget.id); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


