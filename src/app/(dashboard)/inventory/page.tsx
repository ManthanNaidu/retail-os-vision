'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Package, AlertTriangle, FileImage, Check, ChevronDown, Menu, Bell, ScanLine } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';
import { Product } from '@/types';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete';
import { InvoiceScanner } from '@/components/ui/InvoiceScanner';
import { getStoreType } from '@/lib/storeTypes';
import { getUnitsForCategory } from '@/lib/inventoryUnits';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Notifications filtering for this page
  const notifications = useAppStore(s => s.notifications);
  const sectionNotifications = notifications.filter(n => !n.section || n.section === '/inventory');
  const unreadCount = sectionNotifications.filter(n => !n.isRead).length;

  const initialFormState: Partial<Product> = {
    name: '',
    category: '',
    brand: '',
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    stock: 0,
    minStock: 5,
    baseUnit: 'Piece (pc)',
    purchaseUnit: 'Piece (pc)',
    sellingUnit: 'Piece (pc)',
    purchaseConversionFactor: 1,
    sellingConversionFactor: 1,
    gstPercent: 0,
    expiryDate: '',
    isActive: true
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

  const handleQuickAddStock = (product: Product) => {
    const qty = window.prompt(`How much stock to add for ${product.name} (in ${product.purchaseUnit || 'Purchase Unit'})?`, '10');
    const parsed = parseInt(qty || '0', 10);
    if (!isNaN(parsed) && parsed > 0) {
      const factor = product.purchaseConversionFactor || 1;
      updateProduct(product.id, { stock: product.stock + (parsed * factor) });
    }
  };

  const calculateMargin = (sell: number = 0, purchase: number = 0) => {
    if (!purchase || !sell) return 0;
    return (((sell - purchase) / purchase) * 100).toFixed(1);
  };

  return (
    <div className="has-bottom-nav" style={{ minHeight: '100vh', background: '#F4F6FA', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#F4F6FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button onClick={() => useAppStore.getState().toggleSidebar()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Menu size={24} color="#111827" />
              </button>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>Inventory</h1>
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
          <div style={{ background: '#FD5C04', borderRadius: '16px', padding: '24px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(253, 92, 4, 0.4)' }}>
              <div style={{ position: 'relative', zIndex: 10, maxWidth: '65%' }}>
                  <h2 style={{ color: 'white', fontSize: '18px', fontWeight: 800, lineHeight: 1.2, margin: '0 0 4px' }}>
                      Inventory Overview
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 500, margin: '0 0 20px' }}>
                      Your stock at a glance
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowScanner(true)} style={{ background: 'white', color: '#FD5C04', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                          <ScanLine size={16} /> Scan Invoice
                      </button>
                      <button onClick={handleOpenAdd} style={{ background: 'white', color: '#FD5C04', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                          <Plus size={16} /> Add Product
                      </button>
                  </div>
              </div>
              <img src="/images/icons/inventory-banner.jpg" alt="Inventory" style={{ position: 'absolute', right: '-10px', top: '10px', width: '130px', height: '130px', objectFit: 'contain' }} />
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Package size={16} color="#3B82F6" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Total Products</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{stats.total}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <AlertTriangle size={16} color="#F97316" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Low Stock</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>{stats.lowStock}</p>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <X size={16} color="#EF4444" />
                  </div>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 4px', fontWeight: 600 }}>Out of Stock</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444', margin: 0 }}>{stats.outOfStock}</p>
              </div>
          </div>

          {/* Search & Filters */}
          <div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                      type="text" 
                      placeholder="Search products by name, brand..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '16px', border: '1px solid #F3F4F6', outline: 'none', fontSize: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', background: 'white' }}
                  />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
                  {allCategories.map(cat => (
                      <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          style={{
                              padding: '8px 16px',
                              borderRadius: '100px',
                              fontSize: '13px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              border: 'none',
                              background: selectedCategory === cat ? '#F97316' : '#F3F4F6',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredProducts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <AlertTriangle size={40} style={{ color: '#D1D5DB', margin: '0 auto 12px' }} />
                      <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>No products match your search.</p>
                  </div>
              ) : (
                  filteredProducts.map(product => {
                      const margin = calculateMargin(product.sellingPrice, product.purchasePrice);
                      const isLowStock = product.stock > 0 && product.stock <= (product.minStock || 5);
                      const isOutOfStock = product.stock === 0;
                      
                      return (
                          <div key={product.id} style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', position: 'relative' }}>
                              <div style={{ display: 'flex', gap: '16px' }}>
                                  <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                          <div>
                                              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px', paddingRight: '60px' }}>{product.name}</h3>
                                              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{product.category}</span>
                                          </div>
                                          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                                              <button onClick={() => handleOpenEdit(product)} style={{ background: '#F9FAFB', border: '1px solid #F3F4F6', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}>
                                                  <Edit2 size={14} />
                                              </button>
                                              <button onClick={() => setProductToDelete(product.id)} style={{ background: '#FEF2F2', border: 'none', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }}>
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                      </div>

                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
                                          <div>
                                              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px', fontWeight: 500 }}>Stock</p>
                                              <p style={{ fontSize: '13px', fontWeight: 700, margin: 0, color: isOutOfStock ? '#EF4444' : isLowStock ? '#F59E0B' : '#10B981' }}>
                                                  {product.stock} {product.baseUnit || 'Piece'}
                                              </p>
                                          </div>
                                          <div>
                                              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px', fontWeight: 500 }}>Sell Price</p>
                                              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                                                  {formatCurrency(product.sellingPrice)} <span style={{fontSize: '11px', color: '#9CA3AF', fontWeight: 'normal'}}>/ {product.sellingUnit ? product.sellingUnit.split(' ')[0].toLowerCase() : 'pc'}</span>
                                              </p>
                                          </div>
                                          <div>
                                              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px', fontWeight: 500 }}>Margin</p>
                                              <p style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', margin: 0 }}>
                                                  {margin}%
                                              </p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })
              )}
          </div>
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
                      <select required value={formData.category || ''} onChange={e => {
                        const newCat = e.target.value;
                        const defaultUnit = getUnitsForCategory(newCat)[0] || 'Piece (pc)';
                        setFormData({...formData, category: newCat, baseUnit: defaultUnit, purchaseUnit: defaultUnit, sellingUnit: defaultUnit});
                      }} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', appearance: 'none', backgroundColor: 'white' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Current Stock (in Base Unit)</label>
                    <input type="number" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Min Stock Alert</label>
                    <input type="number" value={formData.minStock || ''} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="5" />
                  </div>
                </div>

                <div style={{ padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, background: '#F8FAFC' }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 12px', color: '#1F2937' }}>Unit Configuration</h4>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Base Unit (Inventory is tracked in this)</label>
                    <div style={{ position: 'relative' }}>
                      <select value={formData.baseUnit || ''} onChange={e => setFormData({...formData, baseUnit: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', appearance: 'none', backgroundColor: 'white' }}>
                        {getUnitsForCategory(formData.category || availableCategories[0]).map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12, marginBottom: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Selling Unit (Bills are made in this)</label>
                      <div style={{ position: 'relative' }}>
                        <select value={formData.sellingUnit || ''} onChange={e => setFormData({...formData, sellingUnit: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', appearance: 'none', backgroundColor: 'white' }}>
                          {getUnitsForCategory(formData.category || availableCategories[0]).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>1 {formData.sellingUnit || 'Selling Unit'} = X {formData.baseUnit || 'Base Unit'}</label>
                      <input type="number" step="0.01" value={formData.sellingConversionFactor || ''} onChange={e => setFormData({...formData, sellingConversionFactor: parseFloat(e.target.value) || 1})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="1" />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>Purchase Unit (Purchases are made in this)</label>
                      <div style={{ position: 'relative' }}>
                        <select value={formData.purchaseUnit || ''} onChange={e => setFormData({...formData, purchaseUnit: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', appearance: 'none', backgroundColor: 'white' }}>
                          {getUnitsForCategory(formData.category || availableCategories[0]).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <ChevronDown size={14} color="#6B7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4B5563', marginBottom: 6 }}>1 {formData.purchaseUnit || 'Purchase Unit'} = X {formData.baseUnit || 'Base Unit'}</label>
                      <input type="number" step="0.01" value={formData.purchaseConversionFactor || ''} onChange={e => setFormData({...formData, purchaseConversionFactor: parseFloat(e.target.value) || 1})} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none' }} placeholder="1" />
                    </div>
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
