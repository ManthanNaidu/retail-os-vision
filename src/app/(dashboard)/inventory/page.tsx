'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Package, AlertTriangle, FileImage, Check, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';
import { Product } from '@/types';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { InvoiceScanner } from '@/components/shared/InvoiceScanner';
import { getStoreType } from '@/lib/storeTypes';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const initialFormState: Partial<Product> = {
    name: '',
    category: '',
    brand: '',
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    stock: 0,
    minStock: 5,
    unit: 'pcs',
    gstPercent: 0,
    expiryDate: ''
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);

  // Derived data
  const storeType = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('retailos_auth') || '{}').storeType || 'general' : 'general';
  const storeConfig = getStoreType(storeType);
  const availableCategories = storeConfig?.categories || ['General', 'Groceries', 'Electronics', 'Clothing', 'Pharmacy'];
  
  const allCategories = ['All', ...availableCategories];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    let low = 0;
    let out = 0;
    products.forEach(p => {
      if (p.stock === 0) out++;
      else if (p.stock <= (p.minStock || 5)) low++;
    });
    return { total: products.length, lowStock: low, outOfStock: out };
  }, [products]);

  // Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ ...initialFormState, category: availableCategories[0] });
    setShowAddForm(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setShowAddForm(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingPrice) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData as Product);
    } else {
      addProduct({
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product);
    }
    setShowAddForm(false);
  };

  const handleDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  const calculateMargin = (sell: number = 0, purchase: number = 0) => {
    if (!purchase || !sell) return 0;
    return (((sell - purchase) / purchase) * 100).toFixed(1);
  };

  return (
    <div className="has-bottom-nav" style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)', padding: '20px 20px 32px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Inventory</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
          {products.length} products in stock
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button 
            onClick={() => setShowScanner(true)} 
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
          >
            <FileImage size={15} /> Scan Invoice
          </button>
          <button 
            onClick={handleOpenAdd} 
            style={{ background: 'white', color: '#F97316', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ background: '#F4F6FA', padding: '0 16px', marginTop: -20, paddingBottom: 80, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 }}>
        
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          <div style={{ background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>Total</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{stats.total}</p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderBottom: '3px solid #F59E0B' }}>
            <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>Low Stock</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B', margin: 0 }}>{stats.lowStock}</p>
          </div>
          <div style={{ background: 'white', padding: '12px', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderBottom: '3px solid #EF4444' }}>
            <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase' }}>Out of Stock</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#EF4444', margin: 0 }}>{stats.outOfStock}</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search products by name or brand..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: 12, border: '1px solid #E5E7EB', outline: 'none', fontSize: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  background: selectedCategory === cat ? '#F97316' : '#E5E7EB',
                  color: selectedCategory === cat ? 'white' : '#4B5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Package size={56} style={{ color: '#D1D5DB', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>No Products Yet</h3>
            <p style={{ color: '#6B7280', margin: 0, fontSize: 14, lineHeight: 1.5 }}>Add your first product or scan a distributor invoice to get started.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
              <button onClick={handleOpenAdd} style={{ background: '#F97316', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={15} /> Add Product
              </button>
              <button onClick={() => setShowScanner(true)} style={{ background: 'white', color: '#F97316', border: '1px solid #F97316', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileImage size={15} /> Scan Invoice
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <AlertTriangle size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
            <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>No products match your search.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredProducts.map(product => {
              const margin = calculateMargin(product.sellingPrice, product.purchasePrice);
              const isLowStock = product.stock > 0 && product.stock <= (product.minStock || 5);
              const isOutOfStock = product.stock === 0;
              
              return (
                <div key={product.id} style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 4px', paddingRight: 60 }}>{product.name}</h3>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{product.category}</span>
                        {product.brand && <span style={{ fontSize: 11, color: '#6B7280' }}>• {product.brand}</span>}
                      </div>
                    </div>
                    
                    <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6 }}>
                      <button onClick={() => handleOpenEdit(product)} style={{ background: '#F3F4F6', border: 'none', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setProductToDelete(product.id)} style={{ background: '#FEE2E2', border: 'none', width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px dashed #E5E7EB' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 2px' }}>Stock</p>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: isOutOfStock ? '#EF4444' : isLowStock ? '#F59E0B' : '#10B981' }}>
                        {product.stock} {product.unit || 'pcs'}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 2px' }}>Sell Price</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>
                        {formatCurrency(product.sellingPrice)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 2px' }}>Margin</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: Number(margin) > 0 ? '#10B981' : '#6B7280', margin: 0 }}>
                        {margin}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Product Bottom Sheet */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px', zIndex: 50, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowAddForm(false)} style={{ background: '#F3F4F6', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Product Name *</label>
                  <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="e.g., Parle G Biscuit" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Category *</label>
                    <div style={{ position: 'relative' }}>
                      <select required value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', appearance: 'none', backgroundColor: 'white' }}>
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Brand</label>
                    <input type="text" value={formData.brand || ''} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="e.g., Parle" />
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 12, border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Purchase Price (₹)</label>
                    <input type="number" step="0.01" value={formData.purchasePrice || ''} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Selling Price (₹) *</label>
                    <input required type="number" step="0.01" value={formData.sellingPrice || ''} onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'white', borderRadius: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>Estimated Margin</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{calculateMargin(formData.sellingPrice, formData.purchasePrice)}%</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>MRP (₹)</label>
                    <input type="number" step="0.01" value={formData.mrp || ''} onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>GST %</label>
                    <input type="number" value={formData.gstPercent || ''} onChange={e => setFormData({...formData, gstPercent: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="e.g., 18" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Stock</label>
                    <input type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Min Stock</label>
                    <input type="number" value={formData.minStock || ''} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="5" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Unit</label>
                    <input type="text" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="pcs, kg" />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Expiry Date (Optional)</label>
                  <input type="date" value={formData.expiryDate || ''} onChange={e => setFormData({...formData, expiryDate: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} />
                </div>

                <button type="submit" style={{ background: '#F97316', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                  <Check size={18} />
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scanners & Dialogs */}
      {showScanner && (
        <InvoiceScanner 
          onClose={() => setShowScanner(false)} 
          onImport={(scannedProducts) => {
            scannedProducts.forEach(p => addProduct(p as Product));
            setShowScanner(false);
          }} 
        />
      )}

      {!!productToDelete && (
        <ConfirmDelete
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}

    </div>
  );
}
