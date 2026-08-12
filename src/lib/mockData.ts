import { Product, Customer, Supplier, Sale, Employee, Notification, AIInsight, DashboardKPIs, ChartDataPoint } from '@/types';

// ─── Products ──────────────────────────────────────────────────
export const mockProducts: Product[] = [
  { id: 'p1', name: 'Tata Salt 1kg', sku: 'GRO001', barcode: '8901234567890', category: 'Grocery', brand: 'Tata', purchasePrice: 18, sellingPrice: 22, mrp: 24, stock: 45, minStock: 20, baseUnit: 'Kg', purchaseUnit: 'Kg', sellingUnit: 'Kg', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 5, supplier: 'sup1', isActive: true, createdAt: '2024-01-01' },
  { id: 'p2', name: 'Aashirvaad Atta 5kg', sku: 'GRO002', barcode: '8901234567891', category: 'Grocery', brand: 'Aashirvaad', purchasePrice: 185, sellingPrice: 210, mrp: 225, stock: 8, minStock: 15, baseUnit: 'Kg', purchaseUnit: 'Kg', sellingUnit: 'Kg', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 0, supplier: 'sup1', isActive: true, createdAt: '2024-01-01' },
  { id: 'p3', name: 'Amul Butter 500g', sku: 'DAIRY001', barcode: '8901234567892', category: 'Dairy', brand: 'Amul', purchasePrice: 240, sellingPrice: 275, mrp: 290, stock: 3, minStock: 10, baseUnit: 'Piece', purchaseUnit: 'Piece', sellingUnit: 'Piece', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 12, supplier: 'sup2', expiryDate: '2025-02-15', isActive: true, createdAt: '2024-01-01' },
  { id: 'p4', name: 'Dettol Soap 125g', sku: 'HYG001', barcode: '8901234567893', category: 'Hygiene', brand: 'Dettol', purchasePrice: 38, sellingPrice: 48, mrp: 55, stock: 60, minStock: 20, baseUnit: 'Piece', purchaseUnit: 'Piece', sellingUnit: 'Piece', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 18, supplier: 'sup3', isActive: true, createdAt: '2024-01-01' },
  { id: 'p5', name: 'Paracetamol 500mg', sku: 'MED001', barcode: '8901234567894', category: 'Medicine', brand: 'Cipla', purchasePrice: 12, sellingPrice: 18, mrp: 22, stock: 150, minStock: 50, baseUnit: 'Strip', purchaseUnit: 'Strip', sellingUnit: 'Strip', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 5, supplier: 'sup4', expiryDate: '2025-03-31', batchNumber: 'B2024-001', isActive: true, createdAt: '2024-01-01' },
  { id: 'p6', name: 'Fortune Sunflower Oil 1L', sku: 'GRO003', barcode: '8901234567895', category: 'Grocery', brand: 'Fortune', purchasePrice: 142, sellingPrice: 165, mrp: 175, stock: 25, minStock: 10, baseUnit: 'Litre', purchaseUnit: 'Litre', sellingUnit: 'Litre', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 5, supplier: 'sup1', isActive: true, createdAt: '2024-01-01' },
  { id: 'p7', name: 'Maggi Noodles 70g', sku: 'GRO004', barcode: '8901234567896', category: 'Grocery', brand: 'Nestlé', purchasePrice: 12, sellingPrice: 15, mrp: 16, stock: 5, minStock: 30, baseUnit: 'Piece', purchaseUnit: 'Piece', sellingUnit: 'Piece', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 12, supplier: 'sup1', isActive: true, createdAt: '2024-01-01' },
  { id: 'p8', name: 'Colgate MaxFresh 200g', sku: 'HYG002', barcode: '8901234567897', category: 'Hygiene', brand: 'Colgate', purchasePrice: 78, sellingPrice: 98, mrp: 110, stock: 35, minStock: 15, baseUnit: 'Piece', purchaseUnit: 'Piece', sellingUnit: 'Piece', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 18, supplier: 'sup3', isActive: true, createdAt: '2024-01-01' },
  { id: 'p9', name: 'Amoxicillin 250mg', sku: 'MED002', barcode: '8901234567898', category: 'Medicine', brand: 'Sun Pharma', purchasePrice: 45, sellingPrice: 65, mrp: 78, stock: 80, minStock: 30, baseUnit: 'Strip', purchaseUnit: 'Strip', sellingUnit: 'Strip', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 12, supplier: 'sup4', expiryDate: '2025-01-20', batchNumber: 'B2024-002', isActive: true, createdAt: '2024-01-01' },
  { id: 'p10', name: 'Surf Excel 1kg', sku: 'HYG003', barcode: '8901234567899', category: 'Cleaning', brand: 'HUL', purchasePrice: 175, sellingPrice: 210, mrp: 230, stock: 20, minStock: 10, baseUnit: 'Kg', purchaseUnit: 'Kg', sellingUnit: 'Kg', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 18, supplier: 'sup3', isActive: true, createdAt: '2024-01-01' },
  { id: 'p11', name: 'Bourn Vita 1kg', sku: 'BEV001', barcode: '8901234567900', category: 'Beverages', brand: 'Cadbury', purchasePrice: 320, sellingPrice: 375, mrp: 410, stock: 12, minStock: 8, baseUnit: 'Piece', purchaseUnit: 'Piece', sellingUnit: 'Piece', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 18, isActive: true, createdAt: '2024-01-01' },
  { id: 'p12', name: 'Pantene Shampoo 180ml', sku: 'HAIR001', barcode: '8901234567901', category: 'Personal Care', brand: 'P&G', purchasePrice: 128, sellingPrice: 155, mrp: 175, stock: 22, minStock: 10, baseUnit: 'Piece', purchaseUnit: 'Piece', sellingUnit: 'Piece', purchaseConversionFactor: 1, sellingConversionFactor: 1, gstPercent: 18, isActive: true, createdAt: '2024-01-01' },
];

// ─── Customers ─────────────────────────────────────────────────
export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@gmail.com', address: 'MG Road, Bangalore', creditBalance: 2300, loyaltyPoints: 450, totalPurchases: 45600, lastPurchase: '2024-12-28', segment: 'VIP', createdAt: '2023-03-15' },
  { id: 'c2', name: 'Priya Patel', phone: '9876543211', email: 'priya@gmail.com', address: 'Koramangala', creditBalance: 0, loyaltyPoints: 280, totalPurchases: 28900, lastPurchase: '2024-12-30', segment: 'VIP', createdAt: '2023-05-20' },
  { id: 'c3', name: 'Anita Verma', phone: '9876543212', creditBalance: 750, loyaltyPoints: 120, totalPurchases: 12400, lastPurchase: '2024-11-15', birthday: '1990-07-14', segment: 'Regular', createdAt: '2023-08-10' },
  { id: 'c4', name: 'Suresh Kumar', phone: '9876543213', creditBalance: 1800, loyaltyPoints: 80, totalPurchases: 8200, lastPurchase: '2024-10-20', segment: 'Inactive', createdAt: '2023-09-05' },
  { id: 'c5', name: 'Meera Nair', phone: '9876543214', email: 'meera@gmail.com', creditBalance: 0, loyaltyPoints: 320, totalPurchases: 31500, lastPurchase: '2024-12-31', birthday: '1985-03-22', segment: 'VIP', createdAt: '2023-01-10' },
  { id: 'c6', name: 'Amit Singh', phone: '9876543215', creditBalance: 500, loyaltyPoints: 45, totalPurchases: 4800, lastPurchase: '2024-12-10', segment: 'Regular', createdAt: '2024-06-01' },
  { id: 'c7', name: 'Kavya Reddy', phone: '9876543216', creditBalance: 0, loyaltyPoints: 15, totalPurchases: 1200, lastPurchase: '2024-12-29', segment: 'New', createdAt: '2024-11-20' },
  { id: 'c8', name: 'Ravi Gupta', phone: '9876543217', creditBalance: 3200, loyaltyPoints: 0, totalPurchases: 15600, lastPurchase: '2024-09-15', segment: 'Inactive', createdAt: '2023-04-15' },
];

// ─── Suppliers ─────────────────────────────────────────────────
export const mockSuppliers: Supplier[] = [
  { id: 'sup1', name: 'Metro Cash & Carry', phone: '8012345678', email: 'orders@metro.in', address: 'Whitefield, Bangalore', gstNumber: '29AABCM1234A1Z5', outstandingAmount: 45000, totalOrders: 128, rating: 4.8, createdAt: '2022-01-01' },
  { id: 'sup2', name: 'Amul Distributor', phone: '8023456789', email: 'amul.dist@gmail.com', address: 'Peenya, Bangalore', gstNumber: '29AABCA5678B1Z2', outstandingAmount: 12000, totalOrders: 56, rating: 4.6, createdAt: '2022-03-15' },
  { id: 'sup3', name: 'HUL Distributor', phone: '8034567890', email: 'hul.dist@gmail.com', address: 'Rajajinagar', gstNumber: '29AABCH9012C1Z8', outstandingAmount: 28000, totalOrders: 89, rating: 4.3, createdAt: '2022-06-20' },
  { id: 'sup4', name: 'Medplus Pharma', phone: '8045678901', email: 'medplus@pharma.in', address: 'JP Nagar', gstNumber: '29AABCM3456D1Z1', outstandingAmount: 8500, totalOrders: 45, rating: 4.9, createdAt: '2023-01-10' },
];

// ─── Sales (Last 7 days) ───────────────────────────────────────
export const mockRecentSales: Sale[] = [
  { id: 's1', invoiceNumber: 'INV-2501-8234', customerId: 'c1', customerName: 'Rahul Sharma', items: [{ productId: 'p1', productName: 'Tata Salt 1kg', quantity: 2, sellingPrice: 22, discount: 0, gstPercent: 5, total: 44 }, { productId: 'p6', productName: 'Fortune Oil 1L', quantity: 1, sellingPrice: 165, discount: 0, gstPercent: 5, total: 165 }], subtotal: 209, discount: 0, gstAmount: 10.45, total: 219, paymentMethod: 'upi', status: 'completed', createdAt: '2025-01-01T10:30:00' },
  { id: 's2', invoiceNumber: 'INV-2501-8235', customerName: 'Walk-in', items: [{ productId: 'p4', productName: 'Dettol Soap 125g', quantity: 3, sellingPrice: 48, discount: 5, gstPercent: 18, total: 141 }], subtotal: 141, discount: 5, gstAmount: 24.66, total: 160, paymentMethod: 'cash', status: 'completed', createdAt: '2025-01-01T11:15:00' },
  { id: 's3', invoiceNumber: 'INV-2501-8236', customerId: 'c2', customerName: 'Priya Patel', items: [{ productId: 'p5', productName: 'Paracetamol 500mg', quantity: 2, sellingPrice: 18, discount: 0, gstPercent: 5, total: 36 }, { productId: 'p9', productName: 'Amoxicillin 250mg', quantity: 1, sellingPrice: 65, discount: 0, gstPercent: 12, total: 65 }], subtotal: 101, discount: 0, gstAmount: 9.5, total: 110, paymentMethod: 'cash', status: 'completed', createdAt: '2025-01-01T13:45:00' },
  { id: 's4', invoiceNumber: 'INV-2501-8237', customerName: 'Walk-in', items: [{ productId: 'p2', productName: 'Aashirvaad Atta 5kg', quantity: 1, sellingPrice: 210, discount: 0, gstPercent: 0, total: 210 }], subtotal: 210, discount: 0, gstAmount: 0, total: 210, paymentMethod: 'upi', status: 'completed', createdAt: '2025-01-01T15:20:00' },
];

// ─── Chart Data ────────────────────────────────────────────────
export const mockChartData: ChartDataPoint[] = [
  { date: 'Mon', sales: 12400, profit: 3200, expenses: 2100 },
  { date: 'Tue', sales: 9800, profit: 2600, expenses: 1800 },
  { date: 'Wed', sales: 15600, profit: 4100, expenses: 2400 },
  { date: 'Thu', sales: 11200, profit: 2900, expenses: 2200 },
  { date: 'Fri', sales: 18900, profit: 5200, expenses: 2800 },
  { date: 'Sat', sales: 24300, profit: 6800, expenses: 3100 },
  { date: 'Sun', sales: 16700, profit: 4500, expenses: 2500 },
];

export const mockMonthlyData: ChartDataPoint[] = [
  { date: 'Jul', sales: 285000, profit: 68000, expenses: 52000 },
  { date: 'Aug', sales: 312000, profit: 74000, expenses: 56000 },
  { date: 'Sep', sales: 298000, profit: 71000, expenses: 54000 },
  { date: 'Oct', sales: 342000, profit: 82000, expenses: 58000 },
  { date: 'Nov', sales: 398000, profit: 95000, expenses: 63000 },
  { date: 'Dec', sales: 456000, profit: 115000, expenses: 70000 },
];

// ─── KPIs ──────────────────────────────────────────────────────
export const mockKPIs: DashboardKPIs = {
  todaySales: 16700,
  todayProfit: 4500,
  monthlyRevenue: 456000,
  cashBalance: 128500,
  pendingPayments: 8550,
  lowStockCount: 4,
  expiringCount: 3,
  todayOrders: 47,
  profitGrowth: 14.2,
  salesGrowth: 8.7,
  revenueGrowth: 12.3,
};

// ─── AI Insights ───────────────────────────────────────────────
export const mockAIInsights: AIInsight[] = [
  { id: 'ai1', category: 'profit', priority: 'high', title: 'Increase Maggi price by ₹2', description: 'Competitors charge ₹17 but you sell at ₹15. Customers will still buy.', action: 'Update Price', expectedImpact: '+₹480/month', icon: '📈' },
  { id: 'ai2', category: 'inventory', priority: 'high', title: 'Reorder Aashirvaad Atta NOW', description: 'Only 8 units left. At current sales rate, stock runs out in 3 days.', action: 'Create PO', expectedImpact: 'Prevent stockout', icon: '📦' },
  { id: 'ai3', category: 'customer', priority: 'medium', title: 'Recover ₹2,300 from Rahul Sharma', description: 'Outstanding credit for 45 days. Send a friendly WhatsApp reminder today.', action: 'Send WhatsApp', expectedImpact: '+₹2,300 cash', icon: '💬' },
  { id: 'ai4', category: 'inventory', priority: 'high', title: '9 Amoxicillin strips expire in 20 days', description: 'Consider giving 10% discount to move stock quickly and avoid total loss.', action: 'Apply Discount', expectedImpact: 'Save ₹585', icon: '⚠️' },
  { id: 'ai5', category: 'customer', priority: 'medium', title: 'Suresh Kumar inactive for 72 days', description: 'He used to shop weekly. Send a "We Miss You" offer to bring him back.', action: 'Send Offer', expectedImpact: '+₹2,000/month', icon: '👤' },
  { id: 'ai6', category: 'pricing', priority: 'low', title: 'Bundle Dettol + Surf Excel', description: 'Create a "Clean Home Bundle" at ₹250 (save ₹8). Drives 2x volume on both.', action: 'Create Bundle', expectedImpact: '+15% volume', icon: '🎁' },
];

// ─── Notifications ─────────────────────────────────────────────
export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'warning', title: 'Low Stock Alert', message: 'Maggi Noodles: Only 5 packs left', createdAt: new Date().toISOString(), isRead: false },
  { id: 'n2', type: 'danger', title: 'Expiry Warning', message: '9 Amoxicillin strips expire in 20 days', createdAt: new Date().toISOString(), isRead: false },
  { id: 'n3', type: 'info', title: 'Payment Due', message: 'Rahul Sharma owes ₹2,300 — 45 days overdue', createdAt: new Date().toISOString(), isRead: false },
  { id: 'n4', type: 'success', title: 'Profit Up!', message: "Today's profit increased 14% vs yesterday 🎉", createdAt: new Date().toISOString(), isRead: true },
  { id: 'n5', type: 'info', title: 'Festival Season', message: 'Republic Day is in 5 days — stock up on sweets & snacks', createdAt: new Date().toISOString(), isRead: true },
];

// ─── Employees ─────────────────────────────────────────────────
export const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Suresh Babu', role: 'Cashier', phone: '9900000001', salary: 18000, commission: 2, attendance: 95, sales: 185000, joinDate: '2022-06-01', isActive: true },
  { id: 'e2', name: 'Kavitha R', role: 'Sales Assistant', phone: '9900000002', salary: 15000, commission: 1.5, attendance: 88, sales: 142000, joinDate: '2023-01-15', isActive: true },
  { id: 'e3', name: 'Mohan Das', role: 'Store Manager', phone: '9900000003', salary: 28000, commission: 3, attendance: 100, sales: 312000, joinDate: '2021-03-10', isActive: true },
];

// ─── Business Profile ──────────────────────────────────────────
export const mockBusinessProfile = {
  name: 'Shree Ram Medical & General Stores',
  ownerName: 'Rajesh Kumar',
  phone: '9876543200',
  email: 'rajesh.shriram@gmail.com',
  address: '15, Brigade Road, Near City Bus Stop',
  city: 'Bangalore',
  gstNumber: '29ABCDE1234F1Z5',
  businessType: 'Medical & Grocery Store',
  upiId: 'shriram@upi',
};

