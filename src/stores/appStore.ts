'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Customer, Sale, Notification } from '@/types';
import { mockProducts, mockCustomers, mockRecentSales, mockNotifications } from '@/lib/mockData';
import { generateInvoiceNumber } from '@/lib/utils';

// ─── App Store (Global) ────────────────────────────────────────
interface AppState {
  notifications: Notification[];
  unreadCount: number;
  sidebarOpen: boolean;
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  toggleSidebar: () => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  addNotification: (n: Notification) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter(n => !n.isRead).length,
      sidebarOpen: false,
      products: mockProducts,
      customers: mockCustomers,
      sales: mockRecentSales,

      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

      markNotificationRead: (id) => set(state => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
        unreadCount: state.notifications.filter(n => !n.isRead && n.id !== id).length,
      })),

      markAllRead: () => set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

      addProduct: (product) => set(state => ({
        products: [product, ...state.products],
      })),

      updateProduct: (id, updates) => set(state => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p),
      })),

      deleteProduct: (id) => set(state => ({
        products: state.products.filter(p => p.id !== id),
      })),

      addCustomer: (customer) => set(state => ({
        customers: [customer, ...state.customers],
      })),

      updateCustomer: (id, updates) => set(state => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c),
      })),

      deleteCustomer: (id) => set(state => ({
        customers: state.customers.filter(c => c.id !== id),
      })),

      addSale: (sale) => set(state => ({
        sales: [sale, ...state.sales],
        customers: sale.customerId
          ? state.customers.map(c => c.id === sale.customerId
              ? { ...c, totalPurchases: c.totalPurchases + sale.total, loyaltyPoints: c.loyaltyPoints + Math.floor(sale.total / 100) }
              : c)
          : state.customers,
      })),

      deleteSale: (id) => set(state => ({
        sales: state.sales.filter(s => s.id !== id),
      })),

      addNotification: (n) => set(state => ({
        notifications: [n, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      })),
    }),
    { name: 'retailos-app' }
  )
);

// ─── Billing Store (POS) ───────────────────────────────────────
interface BillingState {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  discount: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit' | 'split';
  searchQuery: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: BillingState['paymentMethod']) => void;
  setSearchQuery: (query: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getGSTAmount: () => number;
  getTotal: () => number;
  completeSale: () => Sale | null;
}

export const useBillingStore = create<BillingState>()((set, get) => ({
  cart: [],
  selectedCustomer: null,
  discount: 0,
  paymentMethod: 'cash',
  searchQuery: '',

  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      set({ cart: cart.map(item => item.productId === product.id
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellingPrice }
        : item) });
    } else {
      set({ cart: [...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        sellingPrice: product.sellingPrice,
        purchasePrice: product.purchasePrice,
        discount: 0,
        gstPercent: product.gstPercent,
        total: product.sellingPrice,
        image: product.image,
      }] });
    }
  },

  removeFromCart: (productId) => set(state => ({ cart: state.cart.filter(item => item.productId !== productId) })),

  updateQuantity: (productId, qty) => {
    if (qty <= 0) { get().removeFromCart(productId); return; }
    set(state => ({ cart: state.cart.map(item => item.productId === productId
      ? { ...item, quantity: qty, total: qty * item.sellingPrice }
      : item) }));
  },

  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearCart: () => set({ cart: [], selectedCustomer: null, discount: 0, searchQuery: '' }),

  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.total, 0),

  getGSTAmount: () => get().cart.reduce((sum, item) => {
    const taxable = item.total * (item.gstPercent / 100);
    return sum + taxable;
  }, 0),

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const gst = get().getGSTAmount();
    return subtotal + gst - get().discount;
  },

  completeSale: () => {
    const state = get();
    if (state.cart.length === 0) return null;
    const sale: Sale = {
      id: `s-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      customerId: state.selectedCustomer?.id,
      customerName: state.selectedCustomer?.name || 'Walk-in Customer',
      items: state.cart,
      subtotal: state.getSubtotal(),
      discount: state.discount,
      gstAmount: state.getGSTAmount(),
      total: state.getTotal(),
      paymentMethod: state.paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    state.clearCart();
    return sale;
  },
}));
