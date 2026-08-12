'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Menu, ChevronDown, Store, AlertTriangle, CheckCircle, ChevronRight, Zap, Users, MessageCircle } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';
import { getStoreType } from '@/lib/storeTypes';

export default function DashboardPage() {
    const router = useRouter();
    const { products, sales, customers, notifications, unreadCount, markNotificationRead, markAllRead, addNotification } = useAppStore();
    
    const [ownerName, setOwnerName] = useState('Store Owner');
    const [storeCategory, setStoreCategory] = useState('Grocery / Kirana Store');
    const [storeImage, setStoreImage] = useState('/images/logo.jpg');
    const [isClient, setIsClient] = useState(false);
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [showServicesMenu, setShowServicesMenu] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
        try {
            const profileStr = localStorage.getItem('retailos_profile');
            if (profileStr) {
                const profile = JSON.parse(profileStr);
                if (profile.ownerName) setOwnerName(profile.ownerName);
                if (profile.storeType) {
                    const typeData = getStoreType(profile.storeType);
                    if (typeData) {
                        setStoreCategory(typeData.name);
                        setStoreImage(typeData.image || '/images/logo.jpg');
                    }
                }
            }
        } catch (e) {}
    }, []);

    // Generate alerts
    useEffect(() => {
        if (!isClient) return;
        const state = useAppStore.getState();
        const existingAlertIds = state.notifications.map(n => n.id);
        
        products.forEach(p => {
            const stock = p.stock || 0;
            const minStock = p.minStock || 5;
            if (stock === 0) {
                const notifId = `out-of-stock-${p.id}`;
                if (!existingAlertIds.includes(notifId)) {
                    addNotification({ id: notifId, type: 'danger', title: 'Out of Stock', message: `${p.name} is completely out of stock.`, createdAt: new Date().toISOString(), isRead: false });
                }
            } else if (stock <= minStock) {
                const notifId = `low-stock-${p.id}`;
                if (!existingAlertIds.includes(notifId)) {
                    addNotification({ id: notifId, type: 'warning', title: 'Low Stock Alert', message: `${p.name} is running low (${stock} left).`, createdAt: new Date().toISOString(), isRead: false });
                }
            }
        });
    }, [products, isClient, addNotification]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        if (hour < 21) return 'Good evening';
        return 'Good night';
    };

    const greeting = getGreeting();
    const isDay = new Date().getHours() > 5 && new Date().getHours() < 18;

    // Stats calculations
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todaySales = sales.filter(s => new Date(s.createdAt) >= today);
        const yesterdaySales = sales.filter(s => {
            const d = new Date(s.createdAt);
            return d >= yesterday && d < today;
        });

        const todayRevenue = todaySales.reduce((s, a) => s + a.total, 0);
        const yesterdayRevenue = yesterdaySales.reduce((s, a) => s + a.total, 0) || 1; // avoid /0

        const calcProfit = (arr: any[]) => arr.reduce((s, a) => s + (a.total * 0.2), 0); // Mock 20% profit

        const todayProfit = calcProfit(todaySales);
        const yesterdayProfit = calcProfit(yesterdaySales);

        const revenueGrowth = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
        const profitGrowth = Math.round(((todayProfit - yesterdayProfit) / (yesterdayProfit || 1)) * 100);
        const salesGrowth = Math.round(((todaySales.length - yesterdaySales.length) / (yesterdaySales.length || 1)) * 100);
        
        const todayAvg = todaySales.length ? Math.round(todayRevenue / todaySales.length) : 0;
        const yestAvg = yesterdaySales.length ? Math.round(yesterdayRevenue / yesterdaySales.length) : 1;
        const avgGrowth = Math.round(((todayAvg - yestAvg) / yestAvg) * 100);

        return {
            revenue: todayRevenue, revenueGrowth,
            profit: todayProfit, profitGrowth,
            sales: todaySales.length, salesGrowth,
            avgOrder: todayAvg, avgGrowth
        };
    }, [sales]);

    const topSelling = useMemo(() => {
        return products.slice(0, 3).map((p, i) => ({...p, soldCount: 25 - (i * 4)}));
    }, [products]);

    const lowStock = useMemo(() => {
        return products.filter(p => (p.stock || 0) <= (p.minStock || 5)).slice(0, 3);
    }, [products]);

    if (!isClient) return null;

    // Mini sparkline components
    const Sparkline = ({ color, data }: { color: string, data: number[] }) => {
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const w = 80;
        const h = 24;
        const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
        
        return (
            <svg width="100%" height="24" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ marginTop: 'auto' }}>
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
                        <stop offset="100%" stopColor={color} stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <path d={`M0,${h} L${points} L${w},${h} Z`} fill={`url(#grad-${color})`} />
                <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    };

    return (
        <div className="has-bottom-nav" style={{ background: '#f8fafc', minHeight: '100vh', maxWidth: '480px', margin: '0 auto', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => useAppStore.getState().toggleSidebar()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <Menu size={24} color="#111827" />
                    </button>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                            <span style={{ color: '#111827' }}>Retail</span><span style={{ color: '#f59e0b' }}>OS</span>
                        </div>
                        <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: 500, letterSpacing: '0.2px', marginTop: '-1px' }}>Business OS</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} color="#111827" />
                        {unreadCount > 0 && (
                            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '14px', height: '14px', background: '#f59e0b', color: 'white', fontSize: '9px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid white' }}>
                                {unreadCount}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => router.push('/settings')}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DBEAFE', color: '#3B82F6', overflow: 'hidden' }}>
                            <img src="/images/icons/customers.jpg" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <ChevronDown size={14} color="#6B7280" />
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
                
                {/* Hero Banner */}
                <div style={{ background: 'linear-gradient(100deg, #f97316 0%, #f59e0b 100%)', borderRadius: '16px', padding: '24px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)' }}>
                    <div style={{ position: 'relative', zIndex: 10, maxWidth: '65%' }}>
                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {greeting}, {ownerName}! {isDay ? '☀️' : '🌙'}
                        </p>
                        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
                            Let's grow your business today
                        </h1>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '100px', backdropFilter: 'blur(4px)' }}>
                            <Store size={14} color="white" />
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{storeCategory}</span>
                            <ChevronRight size={14} color="white" />
                        </div>
                    </div>
                    <img src="/images/logo.jpg" alt="RetailOS" style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '140px', height: '140px', objectFit: 'contain', mixBlendMode: 'multiply', opacity: 0.9 }} />
                </div>

                {/* Quick Actions */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Quick Actions</h2>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', cursor: 'pointer' }}>Manage &gt;</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {[
                            { name: 'New Sale', sub: 'Create invoice', img: '/images/icons/billing.jpg', path: '/billing' },
                            { name: 'Inventory', sub: 'Manage stock', img: '/images/icons/stock.jpg', path: '/inventory' },
                            { name: 'Customers', sub: 'View directory', img: '/images/icons/customers.jpg', path: '/customers' },
                            { name: 'Reports', sub: 'Store analytics', img: '/images/icons/team.jpg', path: '/reports' }
                        ].map(item => (
                            <motion.div whileTap={{ scale: 0.95 }} onClick={() => router.push(item.path)} key={item.name} style={{ background: 'white', borderRadius: '16px', padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid #F1F5F9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
                                <img src={item.img} alt={item.name} style={{ width: '44px', height: '44px', objectFit: 'contain', marginBottom: '8px', mixBlendMode: 'multiply' }} />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{item.name}</span>
                                <span style={{ fontSize: '9px', fontWeight: 500, color: '#94A3B8' }}>{item.sub}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Business Overview */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Business Overview</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', padding: '4px 8px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Today <ChevronDown size={14} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {/* Revenue Card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ background: '#FEF3C7', padding: '6px', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>₹</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Revenue</span>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>₹{stats.revenue.toLocaleString()}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: stats.revenueGrowth >= 0 ? '#10B981' : '#EF4444', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% ↗
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>vs Yesterday</div>
                            <Sparkline color="#f59e0b" data={[10, 20, 15, 30, 25, 40, 35]} />
                        </div>

                        {/* Profit Card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ background: '#D1FAE5', padding: '6px', borderRadius: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Profit</span>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>₹{stats.profit.toLocaleString()}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: stats.profitGrowth >= 0 ? '#10B981' : '#EF4444', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {stats.profitGrowth >= 0 ? '+' : ''}{stats.profitGrowth}% ↗
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>vs Yesterday</div>
                            <Sparkline color="#10B981" data={[5, 12, 10, 25, 18, 30, 28]} />
                        </div>

                        {/* Sales Card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ background: '#EDE9FE', padding: '6px', borderRadius: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Sales</span>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>{stats.sales}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: stats.salesGrowth >= 0 ? '#10B981' : '#EF4444', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {stats.salesGrowth >= 0 ? '+' : ''}{stats.salesGrowth}% ↗
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>vs Yesterday</div>
                            <Sparkline color="#8B5CF6" data={[2, 4, 3, 7, 5, 8, 9]} />
                        </div>

                        {/* Avg Order Card */}
                        <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <div style={{ background: '#DBEAFE', padding: '6px', borderRadius: '8px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Avg Order</span>
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>₹{stats.avgOrder}</div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: stats.avgGrowth >= 0 ? '#10B981' : '#EF4444', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {stats.avgGrowth >= 0 ? '+' : ''}{stats.avgGrowth}% ↗
                            </div>
                            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>vs Yesterday</div>
                            <Sparkline color="#3B82F6" data={[300, 280, 320, 310, 340, 330, 356]} />
                        </div>
                    </div>
                </div>

                {/* Today Revenue Trend Chart */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', margin: 0 }}>Today Revenue Trend</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                            Revenue <ChevronDown size={12} />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.5px' }}>₹{stats.revenue.toLocaleString()}</div>
                        <div style={{ background: '#ECFDF5', color: '#10B981', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                            ↑ {stats.revenueGrowth}% vs Yesterday
                        </div>
                    </div>

                    <div style={{ height: '180px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                { time: '12 AM', sales: 1000 },
                                { time: '4 AM', sales: 1200 },
                                { time: '8 AM', sales: 2500 },
                                { time: '12 PM', sales: 6420 },
                                { time: '4 PM', sales: 4800 },
                                { time: '8 PM', sales: 7200 },
                                { time: '11 PM', sales: 5000 },
                            ]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSalesOrange" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} tickFormatter={(val) => val >= 1000 ? `${val/1000}K` : val} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesOrange)" />
                                {/* Overlay dot for peak */}
                                <circle cx="50%" cy="40%" r="4" fill="white" stroke="#f59e0b" strokeWidth="2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bottom Lists */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    
                    {/* Top Selling Products */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>Top Selling Products</h3>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', cursor: 'pointer' }}>View all</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {topSelling.map((product, i) => (
                                <div key={product.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyItems: 'center', overflow: 'hidden' }}>
                                            <span style={{ fontSize: '18px', margin: 'auto' }}>📦</span>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>{product.soldCount} sold</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #F1F5F9', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B', margin: 0 }}>Low Stock Alerts</h3>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', cursor: 'pointer' }}>View all</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {lowStock.length === 0 ? (
                                <div style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>All stock is healthy!</div>
                            ) : lowStock.map((product, i) => (
                                <div key={product.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyItems: 'center', overflow: 'hidden' }}>
                                            <span style={{ fontSize: '18px', margin: 'auto' }}>⚠️</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', maxWidth: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
                                            <span style={{ fontSize: '10px', fontWeight: 600, color: '#F97316' }}>{product.stock} left</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} color="#CBD5E1" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Notifications Dropdown (Same as before) */}
            <AnimatePresence>
                {showNotifications && (
                    <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowNotifications(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            style={{ position: 'absolute', top: 56, right: 20, width: 320, background: 'white', borderRadius: 20, zIndex: 50, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', border: '1px solid #E5E7EB' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #E5E7EB' }}>
                                <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Notifications</span>
                                <button onClick={markAllRead} style={{ fontSize: 12, fontWeight: 500, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
                            </div>
                            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>No new notifications</div>
                                ) : notifications.map(n => {
                                    const meta = n.type === 'danger' ? { bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle } 
                                        : n.type === 'warning' ? { bg: '#fef3c7', color: '#92400e', icon: AlertTriangle }
                                        : { bg: '#d1fae5', color: '#065f46', icon: CheckCircle };
                                    const IconComp = meta.icon;
                                    return (
                                        <div key={n.id} onClick={() => markNotificationRead(n.id)} style={{ padding: '12px 16px', display: 'flex', gap: 12, borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: n.isRead ? 'white' : '#FFFBEB', transition: 'background 0.2s' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <IconComp size={16} color={meta.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{n.message}</p>
                                            </div>
                                            {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginTop: 4, flexShrink: 0 }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
