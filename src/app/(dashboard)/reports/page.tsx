'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

import { AnalyticsEngine } from '@/lib/services/analyticsEngine';
import { BIEngine } from '@/lib/services/biEngine';

const COLORS = ['#1a56db', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function buildDailyData(sales: any[], products: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    const daySales = sales.filter(s => new Date(s.createdAt).getDay() === (i + 1) % 7);
    const metrics = AnalyticsEngine.calculateMetrics(daySales, products);
    
    // Use fallback numbers if mock data is completely empty to preserve chart visual
    const revenue = daySales.length > 0 ? metrics.totalRevenue : Math.round(8000 + i * 2100 + (i === 5 ? 5000 : 0));
    const profit = daySales.length > 0 ? metrics.totalProfit : Math.round(revenue * 0.27);
    
    return { day, sales: Math.round(revenue), profit: Math.round(profit), orders: daySales.length || Math.floor(15 + i * 6 + (i === 5 ? 15 : 0)) };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs shadow-xl" style={{ minWidth: 130 }}>
      <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex justify-between gap-3 mb-0.5">
          <span style={{ color: e.color }}>{e.name}</span>
          <span className="font-bold">
            {typeof e.value === 'number' && e.value > 500 ? formatCurrency(e.value) : e.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-2.5 text-xs shadow-xl">
      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</p>
      <p style={{ color: 'var(--primary)' }}>{formatCurrency(payload[0].value as number)}</p>
    </div>
  );
};

export default function ReportsPage() {
  const { sales, products, customers } = useAppStore();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'gst' | 'customers'>('overview');

  const dailyData = useMemo(() => buildDailyData(sales, products), [sales, products]);
  
  const categoryData = useMemo(() => {
    const cats = BIEngine.getCategoryPerformance(sales, products);
    if (cats.length === 0) {
      return [
        { name: 'Grocery', value: 145000 },
        { name: 'Medicine', value: 98000 },
        { name: 'Dairy', value: 67000 },
        { name: 'Hygiene', value: 54000 },
        { name: 'Others', value: 42000 },
      ];
    }
    return cats.map(c => ({ name: c.name, value: c.revenue }));
  }, [products, sales]);

  const kpis = useMemo(() => {
    const metrics = AnalyticsEngine.calculateMetrics(sales, products);
    
    // Use fallback mock numbers if no sales to keep UI populated
    const totalRevenue = sales.length > 0 ? metrics.totalRevenue : 456000;
    const totalProfit = sales.length > 0 ? metrics.totalProfit : Math.round(totalRevenue * 0.27);
    const gstCollected = sales.length > 0 ? metrics.totalGstCollected : 48320;
    const avgOrderValue = sales.length > 0 ? metrics.avgOrderValue : 412;
    
    const gstPayable = Math.round(gstCollected * 0.336);
    const totalCredit = customers.reduce((s, c) => s + c.creditBalance, 0) || 93500;
    
    return { totalRevenue, totalProfit, gstCollected, avgOrderValue, gstPayable, totalCredit };
  }, [sales, customers, products]);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number }> = {};
    sales.forEach(sale => {
      (sale.items || []).forEach((item: any) => {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, revenue: 0, qty: 0 };
        map[item.productId].revenue += item.total;
        map[item.productId].qty += item.quantity;
      });
    });
    const result = Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    if (result.length === 0) return [
      { name: 'Tata Salt 1kg', revenue: 18400, qty: 920 },
      { name: 'Fortune Oil 1L', revenue: 14200, qty: 284 },
      { name: 'Dettol Soap', revenue: 12800, qty: 640 },
      { name: 'Amul Butter', revenue: 9600, qty: 192 },
      { name: 'Colgate 200g', revenue: 8800, qty: 440 },
      { name: 'Maggi 2min', revenue: 7200, qty: 480 },
    ];
    return result;
  }, [sales]);

  // Customer segments computed at top level (no hooks in JSX)
  const segData = useMemo(() => [
    { name: 'VIP', value: customers.filter(c => c.segment === 'VIP').length, color: '#f59e0b' },
    { name: 'Regular', value: customers.filter(c => c.segment === 'Regular').length, color: '#059669' },
    { name: 'New', value: customers.filter(c => c.segment === 'New').length, color: '#8b5cf6' },
    { name: 'Inactive', value: customers.filter(c => c.segment === 'Inactive').length, color: '#ef4444' },
  ], [customers]);

  const topCustomers = useMemo(() =>
    [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases).slice(0, 6),
    [customers]
  );

  const creditCustomers = useMemo(() =>
    customers.filter(c => c.creditBalance > 0).slice(0, 5),
    [customers]
  );

  const totalCreditOutstanding = customers.reduce((s, c) => s + c.creditBalance, 0);

  const gstData = [
    { rate: '0%', taxable: 95000, tax: 0, label: 'Exempt goods' },
    { rate: '5%', taxable: 180000, tax: 9000, label: 'Grocery, basic food' },
    { rate: '12%', taxable: 120000, tax: 14400, label: 'Medicines, FMCG' },
    { rate: '18%', taxable: 61000, tax: 10980, label: 'Cosmetics, etc.' },
  ];

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'products', label: '📦 Products' },
    { key: 'gst', label: '🏛️ GST' },
    { key: 'customers', label: '👥 Customers' },
  ];

  const kpiCards = [
    { label: 'Total Revenue', value: kpis.totalRevenue, icon: '💰', bg: '#e8f0fe', growth: 12.3, textColor: 'var(--primary)' },
    { label: 'Net Profit', value: kpis.totalProfit, icon: '📈', bg: '#d1fae5', growth: 14.2, textColor: '#059669' },
    { label: 'GST Collected', value: kpis.gstCollected, icon: '🏛️', bg: '#ede9fe', growth: 8.1, textColor: '#7c3aed' },
    { label: 'Avg Order Value', value: kpis.avgOrderValue, icon: '🛒', bg: '#fef3c7', growth: 3.7, textColor: '#d97706' },
  ];

  return (
    <div className="page-enter pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Business Reports</h1>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
          <Download size={14} /> Export PDF
        </motion.button>
      </div>

      {/* Period toggle */}
      <div className="px-4 pb-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['week', 'month', 'year'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        {kpiCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }} className="card p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-2" style={{ background: s.bg }}>{s.icon}</div>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: s.textColor }}>{formatCurrency(s.value)}</p>
            <div className={`flex items-center gap-1 text-[11px] font-semibold mt-1 ${s.growth > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {s.growth > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(s.growth)}% vs last {period}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={{
                background: activeTab === tab.key ? 'var(--primary)' : 'var(--bg-pearl)',
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="px-4 mb-4">
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Revenue vs Profit</h2>
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>This Week</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="sales" name="Revenue" stroke="#1a56db" strokeWidth={2.5} fill="url(#salesGrad)" dot={false} activeDot={{ r: 5 }} />
                    <Area type="monotone" dataKey="profit" name="Profit" stroke="#059669" strokeWidth={2.5} fill="url(#profitGrad)" dot={false} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="px-4 mb-4">
              <div className="card p-4">
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Orders Per Day</h2>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={dailyData} barSize={28} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders" radius={[6, 6, 0, 0]}>
                      {dailyData.map((_, idx) => (
                        <Cell key={idx} fill={idx === 5 ? '#1a56db' : '#dbeafe'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="px-4 mb-4">
              <div className="card p-4">
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Key Metrics</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Profit Margin', value: `${((kpis.totalProfit / kpis.totalRevenue) * 100).toFixed(1)}%`, good: true },
                    { label: 'Credit Outstanding', value: formatCurrency(kpis.totalCredit), good: false },
                    { label: 'GST Payable', value: formatCurrency(kpis.gstPayable), good: false },
                    { label: 'Input Credit', value: formatCurrency(32100), good: true },
                  ].map((m, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: m.good ? '#d1fae5' : '#fee2e2' }}>
                      <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                      <p className={`text-base font-bold mt-0.5 ${m.good ? 'text-green-600' : 'text-red-500'}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="px-4 mb-4">
              <div className="card p-4">
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sales by Category</h2>
                <div className="flex gap-4 items-center">
                  <ResponsiveContainer width="50%" height={170}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                        dataKey="value" paddingAngle={3} strokeWidth={0}>
                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {categoryData.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</p>
                          <div className="w-full bg-gray-100 rounded-full h-1 mt-0.5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(item.value / categoryData[0].value) * 100}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-1 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 mb-4">
              <div className="card p-4">
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Top 6 Products</h2>
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">{i + 1}</span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                        </div>
                        <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(p.revenue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }}
                          transition={{ duration: 0.7, delay: i * 0.08 }} className="h-1.5 rounded-full gradient-primary" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── GST ── */}
        {activeTab === 'gst' && (
          <motion.div key="gst" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="px-4 mb-4">
              <div className="gradient-primary rounded-2xl p-4 mb-4 text-white">
                <p className="text-blue-200 text-xs mb-1">Total GST Collected (This Month)</p>
                <p className="text-3xl font-bold">{formatCurrency(kpis.gstCollected)}</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-blue-200 text-[11px]">Input Credit</p>
                    <p className="text-white font-bold text-base">{formatCurrency(32100)}</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3">
                    <p className="text-blue-200 text-[11px]">Net Payable</p>
                    <p className="text-white font-bold text-base">{formatCurrency(kpis.gstPayable)}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 mb-4">
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>GST Slab Breakdown</h2>
                <div className="space-y-2.5">
                  {gstData.map((row, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-pearl)' }}>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>GST @ {row.rate}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{row.label} · Taxable: {formatCurrency(row.taxable)}</p>
                      </div>
                      <p className={`text-sm font-bold ${row.tax > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {row.tax > 0 ? formatCurrency(row.tax) : 'Exempt'}
                      </p>
                    </motion.div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#fee2e2' }}>
                    <p className="text-sm font-bold text-red-600">Total Tax Collected</p>
                    <p className="text-base font-bold text-red-600">{formatCurrency(gstData.reduce((s, r) => s + r.tax, 0))}</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-sm font-bold text-amber-700">GST Filing Reminder</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>GSTR-1 due: <strong>11th January 2025</strong></p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>GSTR-3B due: <strong>20th January 2025</strong></p>
                    <p className="text-xs mt-1.5 font-semibold text-amber-700">Net payable: {formatCurrency(kpis.gstPayable)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CUSTOMERS ── */}
        {activeTab === 'customers' && (
          <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="px-4">
              <div className="card p-4 mb-4">
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Customer Segments</h2>
                <div className="space-y-3">
                  {segData.map((seg, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                      <p className="text-xs font-medium w-16" style={{ color: 'var(--text-secondary)' }}>{seg.name}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <motion.div initial={{ width: 0 }}
                          animate={{ width: customers.length > 0 ? `${(seg.value / customers.length) * 100}%` : '0%' }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-2.5 rounded-full" style={{ background: seg.color }} />
                      </div>
                      <p className="text-xs font-bold w-8 text-right" style={{ color: 'var(--text-primary)' }}>{seg.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-4 mb-4">
                <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Top Customers by Spend</h2>
                <div className="space-y-2.5">
                  {topCustomers.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                      <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{c.segment} · {c.loyaltyPoints} pts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(c.totalPurchases)}</p>
                        {c.creditBalance > 0 && <p className="text-[10px] text-red-400">{formatCurrency(c.creditBalance)} due</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="card p-4" style={{ borderLeft: '4px solid #ef4444' }}>
                <p className="text-sm font-bold text-red-600 mb-3">Credit Recovery Summary</p>
                <div className="space-y-2">
                  {creditCustomers.map((c, i) => (
                    <div key={i} className="flex justify-between text-xs p-2 rounded-lg" style={{ background: '#fff1f2' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                      <span className="font-bold text-red-600">{formatCurrency(c.creditBalance)}</span>
                    </div>
                  ))}
                  {creditCustomers.length > 0 && (
                    <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: '#fecaca' }}>
                      <span className="text-red-700">Total Outstanding</span>
                      <span className="text-red-600">{formatCurrency(totalCreditOutstanding)}</span>
                    </div>
                  )}
                  {creditCustomers.length === 0 && (
                    <p className="text-center text-sm font-semibold text-green-600 py-4">✅ All payments clear!</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
