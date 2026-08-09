'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import {
  TrendingUp, TrendingDown, Package, Users, DollarSign,
  AlertTriangle, Clock, ChevronRight, BarChart3, ShoppingCart,
  Zap, Star, ArrowRight, Phone, RefreshCw, Check, Bell,
  CreditCard, Sparkles, Store, Calendar, Target
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';
import { TopBar } from '@/components/shared/TopBar';
import { useRouter } from 'next/navigation';

const CountUp = ({ to, duration = 1.5, prefix = '', suffix = '' }: { to: number, duration?: number, prefix?: string, suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      setCount(to * easeOutQuart);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [to, duration]);

  return <>{prefix}{Math.round(count).toLocaleString('en-IN')}{suffix}</>;
};

export default function MasterDashboard() {
  const router = useRouter();
  const { products = [], customers = [], sales = [], notifications = [] } = useAppStore();
  const [ownerName, setOwnerName] = useState('Owner');
  const [storeName, setStoreName] = useState('Your Store');
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [aiInsightIndex, setAiInsightIndex] = useState(0);

  const aiInsights = [
    "Sales are 15% higher this week!",
    "Low stock on 3 top selling items.",
    "Try sending offers to inactive customers.",
    "Highest profit margin observed today."
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const profileStr = localStorage.getItem('retailos_profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        if (profile.name) setOwnerName(profile.name);
        if (profile.storeName) setStoreName(profile.storeName);
      } catch (e) {
        // ignore
      }
    }

    setCurrentDate(new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }));

    const interval = setInterval(() => {
      setAiInsightIndex(prev => (prev + 1) % aiInsights.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [aiInsights.length]);

  const activeCustomers = useMemo(() => {
    return customers.filter(c => c.lastPurchase && (new Date().getTime() - new Date(c.lastPurchase).getTime()) < 30 * 24 * 60 * 60 * 1000).length;
  }, [customers]);

  const todaySales = useMemo(() => {
    const today = new Date().toDateString();
    return sales.filter(s => new Date(s.createdAt).toDateString() === today)
      .reduce((sum, s) => sum + s.total, 0);
  }, [sales]);

  const todayProfit = useMemo(() => {
    const today = new Date().toDateString();
    return sales.filter(s => new Date(s.createdAt).toDateString() === today)
      .reduce((sum, s) => sum + s.items.reduce((p, i) => p + ((i.sellingPrice || 0) - (i.purchasePrice || 0)) * i.quantity, 0), 0);
  }, [sales]);

  const totalCredit = useMemo(() => customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0), [customers]);
  const stockValue = useMemo(() => products.reduce((sum, p) => sum + p.purchasePrice * p.stock, 0), [products]);

  const { healthScore, stockScore, salesScore, custScore, paymentScore } = useMemo(() => {
    const stockScore = products.length > 0 ? Math.min(100, (products.filter(p => p.stock > p.minStock).length / products.length) * 100) : 50;
    const salesScore = todaySales > 0 ? Math.min(100, (todaySales / 5000) * 100) : 30;
    const custScore = customers.length > 0 ? Math.min(100, (activeCustomers / customers.length) * 100) : 50;
    const paymentScore = totalCredit > 0 ? Math.max(0, 100 - (totalCredit / 10000) * 100) : 80;
    const score = Math.round((stockScore + salesScore + custScore + paymentScore) / 4);
    return { healthScore: score, stockScore, salesScore, custScore, paymentScore };
  }, [products, customers, todaySales, activeCustomers, totalCredit]);

  const healthColor = healthScore < 40 ? '#ef4444' : healthScore < 70 ? '#f97316' : '#22c55e';
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  const kpiData = [
    { title: "Today's Revenue", value: todaySales, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100', change: '+12%', type: 'currency' },
    { title: "Today's Profit", value: todayProfit, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-100', change: '+8%', type: 'currency' },
    { title: "Total Stock Value", value: stockValue, icon: Package, color: 'text-purple-500', bg: 'bg-purple-100', change: '+2%', type: 'currency' },
    { title: "Pending Credit", value: totalCredit, icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-100', change: '-5%', type: 'currency' },
  ];

  const lowStock = products.filter(p => p.stock <= p.minStock && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);
  const expiringSoon = products.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate!) <= 7 && getDaysUntilExpiry(p.expiryDate!) >= 0);

  const alerts = [
    ...outOfStock.map(p => ({ id: p.id, title: p.name, desc: 'Out of Stock', type: 'critical', action: 'Order' })),
    ...lowStock.map(p => ({ id: p.id, title: p.name, desc: `${p.stock} remaining`, type: 'warning', action: 'Order' })),
    ...expiringSoon.map(p => ({ id: p.id, title: p.name, desc: `Expiring in ${getDaysUntilExpiry(p.expiryDate!)} days`, type: 'info', action: 'Review' }))
  ].slice(0, 5);

  const mockChartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 4500 },
    { name: 'Fri', revenue: 6000 },
    { name: 'Sat', revenue: 8000 },
    { name: 'Sun', revenue: todaySales > 0 ? todaySales : 7000 },
  ];

  const recentSales = sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string, qty: number, revenue: number }> = {};
    sales.forEach(s => {
      s.items.forEach(i => {
        if (!productSales[i.productId]) {
          productSales[i.productId] = { name: i.productName, qty: 0, revenue: 0 };
        }
        productSales[i.productId].qty += i.quantity;
        productSales[i.productId].revenue += i.quantity * i.sellingPrice;
      });
    });
    return Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  return (
    <div className="page-enter has-bottom-nav">
      <TopBar title="Dashboard" />
      
      <div className="page-container py-5 space-y-4 pb-32">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {greeting}, {ownerName}!
          </h1>
          <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
            <Store className="w-4 h-4" /> {storeName} • {currentDate}
          </p>
          <div className="mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full py-1.5 px-3 flex items-center gap-2 w-fit">
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            <AnimatePresence mode="wait">
              <motion.span
                key={aiInsightIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs font-medium text-blue-700"
              >
                {aiInsights[aiInsightIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Business Health Score */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header !mb-0 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Business Health
            </h2>
            <span className="text-xs font-medium bg-[var(--bg-pearl)] px-2 py-1 rounded-md text-[var(--text-secondary)]">Updated just now</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r={radius} stroke="var(--border)" strokeWidth="12" fill="none" />
                <motion.circle
                  cx="64" cy="64" r={radius}
                  stroke={healthColor} strokeWidth="12" fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black" style={{ color: healthColor }}>
                  <CountUp to={healthScore} />
                </span>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Score</span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {[
                { label: 'Stock Health', score: stockScore, color: 'bg-indigo-500' },
                { label: 'Sales Velocity', score: salesScore, color: 'bg-green-500' },
                { label: 'Customer Retention', score: custScore, color: 'bg-blue-500' },
                { label: 'Payment Collection', score: paymentScore, color: 'bg-orange-500' }
              ].map(metric => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-secondary)] font-medium">{metric.label}</span>
                    <span className="font-bold">{Math.round(metric.score)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          {kpiData.map((kpi, i) => (
            <div key={i} className="card p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${kpi.change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {kpi.change}
                </span>
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium mb-0.5">{kpi.title}</p>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {kpi.type === 'currency' ? '₹' : ''}
                  <CountUp to={kpi.value} />
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts Panel */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-header !mb-0 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Action Required
            </h2>
            {alerts.length > 0 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{alerts.length}</span>}
          </div>
          
          <div className="space-y-2">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                  alert.type === 'critical' ? 'bg-red-50/50 border-red-100' : 
                  alert.type === 'warning' ? 'bg-orange-50/50 border-orange-100' : 
                  'bg-yellow-50/50 border-yellow-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.type === 'critical' ? 'bg-red-500' : 
                      alert.type === 'warning' ? 'bg-orange-500' : 
                      'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{alert.title}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{alert.desc}</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold px-3 py-1 rounded-full bg-white border shadow-sm" onClick={() => router.push('/inventory')}>
                    {alert.action}
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-4 bg-green-50/50 border border-green-100 rounded-xl">
                <Check className="w-6 h-6 text-green-500 mb-1" />
                <p className="text-sm font-medium text-green-700">All Clear! No alerts today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales Chart */}
        <div className="card p-4">
          <h2 className="section-header flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Revenue This Week
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header !mb-0 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Recent Sales
            </h2>
            <button onClick={() => router.push('/reports')} className="text-xs font-bold text-indigo-600 flex items-center">
              View All <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentSales.length > 0 ? recentSales.map(sale => (
              <div key={sale.id} className="list-item">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{sale.customerName || 'Walk-in Customer'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{sale.id} • {new Date(sale.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-[var(--text-primary)]">₹{sale.total.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[var(--bg-pearl)] rounded text-[var(--text-secondary)] uppercase">
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-[var(--text-muted)] py-4">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-4">
          <h2 className="section-header flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Top Selling Items
          </h2>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--bg-pearl)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-sm text-[var(--text-primary)]">{product.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{product.qty} units sold</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-[var(--text-primary)]">₹{product.revenue.toLocaleString('en-IN')}</span>
              </div>
            )) : (
              <p className="text-center text-sm text-[var(--text-muted)] py-4">No data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2 pointer-events-auto">
          {[
            { label: 'New Sale', icon: ShoppingCart, color: 'bg-green-500', route: '/billing' },
            { label: 'Add Stock', icon: Package, color: 'bg-blue-500', route: '/inventory' },
            { label: 'Customer', icon: Users, color: 'bg-purple-500', route: '/customers' },
            { label: 'Reports', icon: BarChart3, color: 'bg-orange-500', route: '/reports' },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => router.push(action.route)}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg shadow-black/5 p-2 border border-[var(--border)] active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center mb-1 text-white shadow-inner`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}





