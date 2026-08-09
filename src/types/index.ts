// Centralized type definitions for RetailOS AI

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  image?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  stock: number;
  minStock: number;
  unit: string;
  gstPercent: number;
  supplier?: string;
  expiryDate?: string;
  batchNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditBalance: number;
  loyaltyPoints: number;
  totalPurchases: number;
  lastPurchase?: string;
  birthday?: string;
  segment: 'VIP' | 'Regular' | 'Inactive' | 'New';
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  outstandingAmount: number;
  totalOrders: number;
  rating: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice?: number;  // Cost price for profit calculation
  discount: number;
  gstPercent: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  total: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'credit' | 'split';
  cashAmount?: number;
  upiAmount?: number;
  cardAmount?: number;
  creditAmount?: number;
  status: 'completed' | 'pending' | 'refunded';
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paidTo?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  commission: number;
  attendance: number;
  sales: number;
  joinDate: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'danger';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface AIInsight {
  id: string;
  category: 'profit' | 'inventory' | 'customer' | 'pricing' | 'forecast';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  expectedImpact?: string;
  icon: string;
}

export interface DashboardKPIs {
  todaySales: number;
  todayProfit: number;
  monthlyRevenue: number;
  cashBalance: number;
  pendingPayments: number;
  lowStockCount: number;
  expiringCount: number;
  todayOrders: number;
  profitGrowth: number;
  salesGrowth: number;
  revenueGrowth: number;
}

export interface ChartDataPoint {
  date: string;
  sales: number;
  profit: number;
  expenses: number;
}

export interface CartItem extends SaleItem {
  image?: string;
}

export interface BusinessProfile {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  gstNumber?: string;
  businessType: string;
  logo?: string;
  upiId?: string;
}
