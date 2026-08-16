'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, X, Check,
  User, ChevronRight, Barcode, Printer, MessageCircle,
  Share2, Receipt, ArrowLeft, Heart, PlusCircle, Package
} from 'lucide-react';
import { useBillingStore, useAppStore } from '@/stores/appStore';
import { formatCurrency, formatDate, generateInvoiceNumber } from '@/lib/utils';
import { Product, Sale } from '@/types';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auth } from '@/lib/firebase';
import SaleSuccessModal from '@/components/features/billing/sale-success';
import { CustomerSection, CartSection, BillSummary, PaymentSection, CheckoutCTA, PaymentMethodType } from '@/components/features/billing/checkout';
import { BillingToolbar, SearchBar, CategoryTabs, QuickPicks, ProductGrid } from '@/components/features/billing/browser';

export default function BillingPage() {
  const {
    cart, searchQuery, selectedCustomer, discount, paymentMethod,
    addToCart, removeFromCart, updateQuantity, setSearchQuery,
    setCustomer, setDiscount, setPaymentMethod, clearCart,
    getSubtotal, getGSTAmount, getTotal
  } = useBillingStore();
  const { products, customers, addSale, updateProduct, sales } = useAppStore();

  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [customerQuery, setCustomerQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [storeName, setStoreName] = useState('My Store');
  const [storeAddress, setStoreAddress] = useState('Store Address');
  const [upiQrCode, setUpiQrCode] = useState<string | null>(null);

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
      ? products.filter(p => p.isActive !== false && (
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.barcode?.includes(searchQuery))
        ))
      : products.filter(p => p.isActive !== false);

    if (activeCategory === 'All') return bySearch.slice(0, 24);
    return bySearch.filter(p => p.category === activeCategory).slice(0, 24);
  }, [products, searchQuery, activeCategory]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerQuery.toLowerCase()) || c.phone.includes(customerQuery)
  ).slice(0, 6);

  const finalizeSale = async () => {
    if (cart.length === 0) return;
    
    setCheckoutLoading(true);
    setCheckoutError(null);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not authenticated');
      
      const token = await currentUser.getIdToken();
      
      const res = await fetch('/api/sales/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cart: cart.map(item => ({ productId: item.productId, quantity: item.quantity })),
          customerId: selectedCustomer?.id,
          customerName: selectedCustomer?.name,
          discount,
          paymentMethod
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      
      if (data.bypass) {
        // Fallback: Perform calculations client-side (less secure, but works without Admin SDK)
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
      } else {
        // Update local state with the authoritative backend result
        addSale(data.sale);
        useAppStore.setState({ products: data.products });
        setCompletedSale(data.sale);
      }
      
      clearCart();
      setShowUpiModal(false);
      setShowInvoice(true);
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Something went wrong');
    } finally {
      setCheckoutLoading(false);
    }
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

  return (
    <div className="flex flex-col lg:flex-row min-h-[100dvh] lg:h-full lg:overflow-hidden">
      {/* ─── LEFT: Product Browser ──────────────────────── */}
      <div className="flex-1 flex flex-col min-h-[60vh] lg:min-h-0 lg:overflow-hidden bg-white border-b lg:border-b-0">
        <BillingToolbar 
          hasItemsInCart={cart.length > 0}
          onClearCart={clearCart}
          onHoldBill={() => {}}
          onResumeBill={() => {}}
          onRepeatSale={() => {}}
        />
        
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          onBarcodeScan={() => {}}
          onVoiceInput={() => {}}
        />
        
        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => { setActiveCategory(cat); setSearchQuery(''); }}
        />
        
        <QuickPicks 
          products={products}
          cart={cart as any}
          onAddProduct={addToCart}
        />
        
        <ProductGrid 
          products={filteredProducts}
          cart={cart as any}
          onAddProduct={addToCart}
        />
      </div>

      {/* ─── RIGHT: Checkout UI ─────────────────────────────────── */}
      <div className="w-full lg:w-[420px] flex flex-col flex-1 lg:flex-none lg:h-full overflow-y-auto bg-[#F8F9FB] border-t lg:border-t-0 lg:border-l border-[#E9EDF2] p-4 gap-4 custom-scrollbar">
        {(!selectedCustomer && !isWalkIn) ? (
          <CustomerSection 
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setCustomer}
            isWalkIn={isWalkIn}
            onSetWalkIn={setIsWalkIn}
          />
        ) : (
          <>
            <CustomerSection 
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setCustomer}
              isWalkIn={isWalkIn}
              onSetWalkIn={setIsWalkIn}
            />
            
            <CartSection 
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              onAddNote={() => {}}
            />
            
            {cart.length > 0 && (
              <>
                <BillSummary 
                  subtotal={getSubtotal()}
                  discount={discount}
                  gst={getGSTAmount()}
                  total={getTotal()}
                  itemCount={cart.reduce((s, i) => s + i.quantity, 0)}
                  onApplyDiscount={(amt, type) => {
                    if (type === 'percent') {
                      setDiscount(Math.round(getSubtotal() * (amt / 100)));
                    } else {
                      setDiscount(amt);
                    }
                  }}
                />
                
                <PaymentSection 
                  total={getTotal()}
                  selectedMethod={paymentMethod as any}
                  onSelectMethod={(m) => setPaymentMethod(m)}
                  amountReceived={amountReceived}
                  onAmountReceivedChange={setAmountReceived}
                  onConfirmUpiPayment={finalizeSale}
                />
                
                <CheckoutCTA 
                  total={getTotal()}
                  disabled={cart.length === 0 || checkoutLoading}
                  onClick={handleCheckoutClick}
                />
                
                {checkoutError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-[14px] text-red-600 font-bold text-center">
                    {checkoutError}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* ─── Invoice Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showInvoice && completedSale && (
          <SaleSuccessModal
            sale={completedSale}
            storeName={storeName}
            storeAddress={storeAddress}
            totalSalesToday={sales.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString()).length || 1}
            onClose={() => { setShowInvoice(false); setCompletedSale(null); }}
            onNewSale={() => { setShowInvoice(false); setCompletedSale(null); setSearchQuery(''); }}
            onWhatsApp={() => shareWhatsApp(completedSale)}
            onPDF={() => sharePDF(completedSale)}
            onPrint={() => window.print()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
