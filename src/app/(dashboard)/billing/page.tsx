'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, X, Check,
  User, ChevronRight, Barcode, Printer, MessageCircle,
  Share2, Receipt, ArrowLeft
} from 'lucide-react';
import { useBillingStore, useAppStore } from '@/stores/appStore';
import { formatCurrency, formatDate, generateInvoiceNumber } from '@/lib/utils';
import { Product, Sale } from '@/types';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BillingPage() {
  const {
    cart, searchQuery, selectedCustomer, discount, paymentMethod,
    addToCart, removeFromCart, updateQuantity, setSearchQuery,
    setCustomer, setDiscount, setPaymentMethod, clearCart,
    getSubtotal, getGSTAmount, getTotal
  } = useBillingStore();
  const { products, customers, addSale, updateProduct } = useAppStore();

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [storeName, setStoreName] = useState('My Store');
  const [storeAddress, setStoreAddress] = useState('Store Address');
  const [upiQrCode, setUpiQrCode] = useState<string | null>(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Load store details
  useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const profile = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
        if (profile.storeName) setStoreName(profile.storeName);
        if (profile.location) setStoreAddress(profile.location);
      } catch (e) {}
      
      const savedQr = localStorage.getItem('retailos_upi_qr');
      if (savedQr) setUpiQrCode(savedQr);
    }
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    const bySearch = searchQuery.length > 0
      ? products.filter(p => p.isActive && (
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.barcode?.includes(searchQuery))
        ))
      : products.filter(p => p.isActive);

    if (activeCategory === 'All') return bySearch.slice(0, 24);
    return bySearch.filter(p => p.category === activeCategory).slice(0, 24);
  }, [products, searchQuery, activeCategory]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerQuery.toLowerCase()) || c.phone.includes(customerQuery)
  ).slice(0, 6);

  const finalizeSale = () => {
    if (cart.length === 0) return;
    const invoice = generateInvoiceNumber();
    const sale: Sale = {
      id: `s-${Date.now()}`,
      invoiceNumber: invoice,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      items: [...cart],
      subtotal: getSubtotal(),
      discount,
      gstAmount: getGSTAmount(),
      total: getTotal(),
      paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    // Deduct stock based on selling conversion factor
    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const factor = product.sellingConversionFactor || 1;
        updateProduct(product.id, { stock: Math.max(0, product.stock - (item.quantity * factor)) });
      }
    });
    addSale(sale);
    setCompletedSale(sale);
    clearCart();
    setShowUpiModal(false);
    setShowInvoice(true);
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'upi' && upiQrCode) {
      setShowUpiModal(true);
    } else {
      finalizeSale();
    }
  };

  const shareWhatsApp = (sale: Sale) => {
    const lines = [
      `🧾 *Invoice: ${sale.invoiceNumber}*`,
      `📅 ${new Date(sale.createdAt).toLocaleDateString('en-IN')}`,
      ``,
      `*${storeName}*`,
      `${storeAddress}`,
      ``,
      `*Items:*`,
      ...sale.items.map(i => `• ${i.productName} x${i.quantity} = ₹${i.total}`),
      ``,
      `Subtotal: ₹${sale.subtotal.toFixed(0)}`,
      sale.discount > 0 ? `Discount: -₹${sale.discount}` : '',
      `GST: ₹${sale.gstAmount.toFixed(0)}`,
      `*Total: ₹${sale.total.toFixed(0)}*`,
      ``,
      `Payment: ${sale.paymentMethod.toUpperCase()}`,
      ``,
      `Thank you! 🙏`,
    ].filter(Boolean).join('\n');

    const phone = selectedCustomer?.phone || '';
    window.open(`https://wa.me/${phone ? '91' + phone : ''}?text=${encodeURIComponent(lines)}`, '_blank');
  };

  const sharePDF = (sale: Sale) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(storeName, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(storeAddress, 105, 28, { align: 'center' });
    
    // Invoice details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Invoice: ${sale.invoiceNumber}`, 14, 45);
    doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString('en-IN')}`, 14, 52);
    doc.text(`Customer: ${sale.customerName}`, 14, 59);

    // Items table
    const tableData = sale.items.map(item => [
      item.productName,
      item.quantity.toString(),
      `Rs. ${item.sellingPrice}`,
      `Rs. ${item.total}`
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219] }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: Rs. ${sale.subtotal.toFixed(0)}`, 140, finalY);
    if (sale.discount > 0) doc.text(`Discount: -Rs. ${sale.discount}`, 140, finalY + 7);
    doc.text(`GST: Rs. ${sale.gstAmount.toFixed(0)}`, 140, finalY + (sale.discount > 0 ? 14 : 7));
    doc.setFontSize(14);
    doc.text(`Total: Rs. ${sale.total.toFixed(0)}`, 140, finalY + (sale.discount > 0 ? 24 : 17));

    // Convert to Blob
    const pdfBlob = doc.output('blob');
    const fileName = `Invoice_${sale.invoiceNumber}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Try Web Share API (mobile), fallback to download
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'Invoice',
        text: `Here is your invoice ${sale.invoiceNumber} from ${storeName}`,
      }).catch(err => console.log('Share failed', err));
    } else {
      doc.save(fileName);
    }
  };

  const categoryIcon: Record<string, string> = {
    Grocery: '🛒', Dairy: '🥛', Hygiene: '🧴', Medicine: '💊',
    Beverages: '🧃', Cleaning: '🧹', 'Personal Care': '💆',
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* ─── LEFT: Product Browser ──────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              className="input-premium !pl-[36px] !pr-[36px] text-sm"
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Barcode size={18} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Category pills */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
              className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: activeCategory === cat ? 'var(--primary)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border)',
              }}
            >
              {categoryIcon[cat] || ''} {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🔍</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {filteredProducts.map((product, i) => {
                const inCart = cart.find(c => c.productId === product.id);
                const qty = inCart?.quantity || 0;
                const isOutOfStock = product.stock === 0;
                return (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.025, 0.4) }}
                    whileHover={!isOutOfStock ? { y: -2, boxShadow: '0 8px 24px rgba(15,26,46,0.12)' } : {}}
                    whileTap={!isOutOfStock ? { scale: 0.96 } : {}}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    disabled={isOutOfStock}
                    className="relative text-left p-3 rounded-2xl border transition-all"
                    style={{
                      background: isOutOfStock ? '#f8fafc' : inCart ? 'var(--primary-light)' : 'white',
                      borderColor: isOutOfStock ? 'var(--border)' : inCart ? 'var(--primary)' : 'var(--border)',
                      borderWidth: inCart ? '1.5px' : '1px',
                      opacity: isOutOfStock ? 0.5 : 1,
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl mb-2 flex items-center justify-center text-xl"
                      style={{ background: isOutOfStock ? '#f1f5f9' : '#f0f4ff' }}>
                      {categoryIcon[product.category] || '📦'}
                    </div>
                    <p className="text-xs font-semibold leading-tight line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>₹{product.sellingPrice}</p>
                    <p className="text-[10px]" style={{ color: isOutOfStock ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
                    </p>
                    {qty > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold"
                      >
                        {qty}
                      </motion.div>
                    )}
                    {product.stock > 0 && product.stock < product.minStock && (
                      <div className="absolute top-2 right-2 text-[9px] font-bold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Low</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Cart ─────────────────────────────────── */}
      <div className="lg:w-[360px] flex flex-col border-t lg:border-t-0 lg:border-l" style={{ borderColor: 'var(--border)', background: 'white', maxHeight: '100%' }}>
        {/* Cart Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: 'var(--primary)' }} />
            <span className="font-bold text-sm">Cart</span>
            {cart.length > 0 && (
              <motion.span key={cart.length} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full gradient-primary text-white text-[11px] flex items-center justify-center font-bold">
                {cart.length}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-medium">Clear</button>
            )}
            <button
              onClick={() => setShowCustomerSearch(!showCustomerSearch)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl"
              style={{ background: 'var(--bg-pearl)', color: selectedCustomer ? 'var(--primary)' : 'var(--text-secondary)' }}
            >
              <User size={13} />
              {selectedCustomer ? selectedCustomer.name.split(' ')[0] : 'Customer'}
              {selectedCustomer?.creditBalance ? ` (₹${selectedCustomer.creditBalance} due)` : ''}
            </button>
          </div>
        </div>

        {/* Customer Search */}
        <AnimatePresence>
          {showCustomerSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="p-3">
                <input className="input-premium text-sm mb-2 !pl-10" placeholder="Search by name or phone..." value={customerQuery} onChange={e => setCustomerQuery(e.target.value)} autoFocus />
                <div className="space-y-1">
                  <button onClick={() => { setCustomer(null); setShowCustomerSearch(false); }} className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-gray-50" style={{ color: 'var(--text-secondary)' }}>
                    👤 Walk-in Customer
                  </button>
                  {filteredCustomers.map(c => (
                    <button key={c.id} onClick={() => { setCustomer(c); setShowCustomerSearch(false); setCustomerQuery(''); }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name} {c.segment === 'VIP' ? '⭐' : ''}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{c.phone}{c.creditBalance > 0 ? ` · ₹${c.creditBalance} due` : ' · ✅ Clear'}</p>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl">🛒</motion.div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Cart is empty</p>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Tap any product to add</p>
            </div>
          ) : (
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-pearl)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.productName}</p>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--primary)' }}>₹{item.sellingPrice} each</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-red-50 hover:border-red-200" style={{ borderColor: 'var(--border)' }}>
                      <Minus size={12} />
                    </motion.button>
                    <motion.span key={item.quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="w-7 text-center text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {item.quantity}
                    </motion.span>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-green-50 hover:border-green-200" style={{ borderColor: 'var(--border)' }}>
                      <Plus size={12} />
                    </motion.button>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[48px]">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹{item.total}</p>
                    <button onClick={() => removeFromCart(item.productId)} className="text-[10px] text-red-400 hover:text-red-600">Remove</button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
            {/* Discount */}
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discount || ''}
                onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                className="w-24 text-right border rounded-xl px-3 py-1.5 text-sm font-semibold"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="0"
              />
            </div>

            {/* Bill Summary */}
            <div className="space-y-1.5 mb-3 p-3 rounded-xl" style={{ background: 'var(--bg-pearl)' }}>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>{cart.reduce((s, i) => s + i.quantity, 0)} items</span>
                <span>₹{getSubtotal().toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span>GST</span><span>+₹{getGSTAmount().toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-green-600 font-semibold">
                  <span>Discount</span><span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }}>
                <span>Total</span>
                <motion.span key={getTotal()} initial={{ scale: 1.1, color: '#059669' }} animate={{ scale: 1, color: 'var(--primary)' }} style={{ color: 'var(--primary)' }}>
                  ₹{getTotal().toFixed(0)}
                </motion.span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {([
                { key: 'cash', label: 'Cash', icon: '💵' },
                { key: 'upi', label: 'UPI', icon: '📱' },
                { key: 'card', label: 'Card', icon: '💳' },
                { key: 'credit', label: 'Credit', icon: '📋' },
              ] as const).map(m => (
                <motion.button
                  key={m.key}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setPaymentMethod(m.key)}
                  className="py-2 rounded-xl text-[11px] font-bold transition-all flex flex-col items-center gap-0.5"
                  style={{
                    background: paymentMethod === m.key ? 'var(--primary)' : 'var(--bg-pearl)',
                    color: paymentMethod === m.key ? 'white' : 'var(--text-secondary)',
                    border: `1.5px solid ${paymentMethod === m.key ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  <span className="text-base">{m.icon}</span>
                  {m.label}
                </motion.button>
              ))}
            </div>

            {/* Checkout */}
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(26,86,219,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCheckoutClick}
              className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 gradient-primary"
              style={{ boxShadow: 'var(--shadow-blue)' }}
            >
              <Receipt size={18} /> Collect ₹{getTotal().toFixed(0)}
            </motion.button>
          </div>
        )}
      </div>

      {/* ─── UPI Payment Modal ────────────────────────────── */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden p-6 flex flex-col items-center text-center"
            >
              <h2 className="text-xl font-bold text-slate-800 mb-1">UPI Payment</h2>
              <p className="text-slate-500 text-sm mb-4">Ask customer to scan and pay</p>
              
              <div className="w-56 h-56 border-2 border-slate-100 rounded-2xl p-2 mb-4 bg-white shadow-sm flex items-center justify-center">
                {upiQrCode ? (
                  <img src={upiQrCode} alt="Scan to pay" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-slate-400">QR Code missing</div>
                )}
              </div>
              
              <div className="text-3xl font-black text-slate-800 mb-6">
                ₹{getTotal().toFixed(0)}
              </div>
              
              <div className="w-full flex gap-3">
                <button
                  onClick={() => setShowUpiModal(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={finalizeSale}
                  className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Payment Received
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Invoice Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showInvoice && completedSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            >
              {/* Success header */}
              <div className="gradient-primary p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2, stiffness: 300 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
                >
                  <Check size={32} className="text-white" />
                </motion.div>
                <h2 className="text-white font-bold text-xl">Sale Complete! 🎉</h2>
                <p className="text-blue-200 text-sm mt-1">{completedSale.invoiceNumber}</p>
              </div>

              {/* Invoice body */}
              <div className="p-5">
                <div className="text-center mb-4">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{storeName}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{storeAddress} · GST: 29ABCDE1234F1Z5</p>
                </div>

                {/* Items */}
                <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                  {completedSale.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>{item.productName} x{item.quantity}</span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{item.total}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-3 space-y-1" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span><span>₹{completedSale.subtotal.toFixed(0)}</span>
                  </div>
                  {completedSale.discount > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span>Discount</span><span>-₹{completedSale.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>GST</span><span>₹{completedSale.gstAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-1">
                    <span style={{ color: 'var(--text-primary)' }}>Total Paid</span>
                    <span style={{ color: 'var(--primary)' }}>₹{completedSale.total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold pt-1">
                    <span style={{ color: 'var(--text-muted)' }}>Payment</span>
                    <span className="uppercase" style={{ color: 'var(--accent)' }}>{completedSale.paymentMethod}</span>
                  </div>
                </div>

                <p className="text-center text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Thank you! Please visit again 🙏</p>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-5 grid grid-cols-2 gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => shareWhatsApp(completedSale)}
                  className="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[11px] font-bold"
                  style={{ background: '#dcfce7', color: '#16a34a' }}
                >
                  <MessageCircle size={18} /> Send Msg
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => sharePDF(completedSale)}
                  className="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[11px] font-bold"
                  style={{ background: '#fce7f3', color: '#db2777' }}
                >
                  <Share2 size={18} /> Share PDF
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => window.print()}
                  className="flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-[11px] font-bold col-span-2"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                >
                  <Printer size={18} /> Print Receipt
                </motion.button>
              </div>

              <div className="px-5 pb-5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowInvoice(false); setCompletedSale(null); }}
                  className="w-full py-3 rounded-2xl text-sm font-bold gradient-primary text-white"
                >
                  New Sale
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
