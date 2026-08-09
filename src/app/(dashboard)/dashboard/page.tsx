'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  RefreshCw, Plus, ShoppingCart, Package,
  Users, BarChart3, TrendingUp, TrendingDown,
  Wallet, CreditCard, ArrowRight, Sparkles,
  AlertTriangle, Clock, ChevronRight
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { mockAIInsights, mockChartData } from '@/lib/mockData';
import { formatCurrency, getGreeting, getDaysUntilExpiry } from '@/lib/utils';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { CountUp } from '@/components/shared/CountUp';

const QUICK_ACTIONS = [
  { icon: ShoppingCart, label: 'New Sale',   href: '/billing',     color: '#e8f0fe', iconColor: 'var(--primary)' },
  { icon: Package,      label: 'Inventory',  href: '/inventory',   color: '#d1fae5', iconColor: '#059669' },
  { icon: Users,        label: 'Customers',  href: '/customers',   color: '#ede9fe', iconColor: '#7c3aed' },
  { icon: BarChart3,    label: 'Reports',    href: '/reports',     color: '#fef3c7', iconColor: '#d97706' },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  profit: TrendingUp, pricing: Package, inventory: Package,
  customer: Users, forecast: BarChart3,
};

const PRIORITY_STYLE = {
  high:   { border: '#fecaca', bg: '#fff5f5', dot: '#dc2626', label: 'Urgent' },
  medium: { border: '#fde68a', bg: '#fffbeb', dot: '#d97706', label: 'Action' },
  low:    { border: '#bfdbfe', bg: '#eff6ff', dot: '#2563eb', label: 'Tip' },
};

function MetricCard({ title, value, prefix = '', suffix = '', color, icon: Icon, growth, delay = 0, href, iconBg }: {
  title: string; value: number; prefix?: string; suffix?: string;
  color: string; iconBg: string; icon: React.ElementType;
  growth?: number; delay?: number; href?: string;
}) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="card p-4 cursor-pointer"
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>{title}</p>
      <p className="text-2xl font-bold leading-none" style={{ color: 'var(--text-primary)' }}>
        {prefix}<CountUp end={value} duration={1} />{suffix}
      </p>
      {growth !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {growth >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(growth)}% vs yesterday
        </div>
      )}
    </motion.div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

export default function DashboardPage() {
  const { products, customers, sales } = useAppStore();
  const [liveOrders, setLiveOrders] = useState(47);
  const [newOrder, setNewOrder] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.65) {
        setLiveOrders(n => n + 1);
        setNewOrder(true);
        setTimeout(() => setNewOrder(false), 3500);
      }
    }, 14000);
    return () => clearInterval(t);
  }, []);

  const kpis = useMemo(() => {
    const todaySales  = sales.reduce((s, x) => s + x.total, 0) || 16700;
    const todayProfit = todaySales * 0.27;
    const pendingCredit = customers.reduce((s, c) => s + c.creditBalance, 0) || 8550;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < p.minStock);
    const expiring = products.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 30 && getDaysUntilExpiry(p.expiryDate) > 0);
    return { todaySales, todayProfit, pendingCredit, lowStock, expiring, liveOrders };
  }, [sales, products, customers, liveOrders]);

  return (
    <div className="page-enter has-bottom-nav overflow-y-auto h-full">
      <div className="page-container py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{getGreeting()}</p>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Rajesh Kumar</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs font-medium text-green-600">Store is Live</span>
            </div>
          </div>
          <Link href="/billing">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn-primary flex items-center gap-2 !py-2.5 !px-4 text-sm">
              <Plus size={16} /> New Sale
            </motion.button>
          </Link>
        </div>

        {/* New order notification */}
        <AnimatePresence>
          {newOrder && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-4 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-sm font-semibold"
              style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>
              <ShoppingCart size={16} />
              New order! Today: {liveOrders} orders
              <ArrowRight size={14} className="ml-auto" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetricCard title="Today's Sales" value={kpis.todaySales} prefix="₹"
            color="var(--primary)" iconBg="var(--primary-light)" icon={TrendingUp} growth={8.7} delay={0.05} href="/reports" />
          <MetricCard title="Today's Profit" value={kpis.todayProfit} prefix="₹"
            color="#059669" iconBg="#d1fae5" icon={TrendingUp} growth={14.2} delay={0.10} href="/reports" />
          <MetricCard title="Monthly Revenue" value={456000} prefix="₹"
            color="#7c3aed" iconBg="#ede9fe" icon={BarChart3} growth={12.3} delay={0.15} href="/reports" />
          <MetricCard title="Pending Credit" value={kpis.pendingCredit} prefix="₹"
            color="#d97706" iconBg="#fef3c7" icon={CreditCard} delay={0.20} href="/customers" />
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <p className="section-header">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((action, i) => (
              <Link key={i} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  whileHover={{ y: -3 }} whileTap={{ scale: 0.93 }}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-2xl cursor-pointer transition-all"
                  style={{ background: action.color }}>
                  <action.icon size={22} style={{ color: action.iconColor }} />
                  <span className="text-[11px] font-bold text-center" style={{ color: 'var(--text-primary)' }}>
                    {action.label}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Alerts — only if there are any */}
        {(kpis.lowStock.length > 0 || kpis.expiring.length > 0) && (
          <div className="mb-6">
            <p className="section-header">Needs Attention</p>
            <div className="space-y-2">
              {kpis.lowStock.slice(0, 2).map((p, i) => (
                <Link key={p.id} href="/inventory">
                  <div className="list-item">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Only {p.stock} {p.unit} left</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>Low</span>
                  </div>
                </Link>
              ))}
              {kpis.expiring.slice(0, 2).map((p, i) => (
                <Link key={p.id} href="/inventory">
                  <div className="list-item">
                    <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Clock size={14} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Expires in {getDaysUntilExpiry(p.expiryDate!)} days</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>Expiry</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sales Chart */}
        <div className="mb-6">
          <p className="section-header">This Week</p>
          <SalesChart data={mockChartData} title="" />
        </div>

        {/* AI Insights */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="section-header mb-0">AI Recommendations</p>
            <Link href="/ai-assistant" className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--primary)' }}>
              Ask AI <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {mockAIInsights.slice(0, 3).map((insight, i) => {
              const style = PRIORITY_STYLE[insight.priority];
              const Icon = CATEGORY_ICONS[insight.category] || Sparkles;
              return (
                <motion.div key={insight.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="p-3.5 rounded-2xl border flex items-start gap-3"
                  style={{ borderColor: style.border, background: style.bg }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: style.border }}>
                    <Icon size={13} style={{ color: style.dot }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{insight.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                        style={{ background: style.dot }}>{style.label}</span>
                    </div>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.description}</p>
                    {insight.expectedImpact && (
                      <span className="text-[11px] font-bold text-green-600 mt-1.5 block">{insight.expectedImpact}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Sales */}
        {sales.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="section-header mb-0">Recent Sales</p>
              <Link href="/reports" className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>View all</Link>
            </div>
            <div className="space-y-2">
              {sales.slice(0, 4).map((sale, i) => (
                <motion.div key={sale.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                  className="list-item">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                    style={{ background: 'var(--primary)' }}>
                    {(sale.customerName || 'W').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {sale.customerName || 'Walk-in'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sale.invoiceNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(sale.total)}</p>
                    <p className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full"
                      style={{ background: '#d1fae5', color: '#059669' }}>{sale.paymentMethod}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
