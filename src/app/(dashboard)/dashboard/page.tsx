'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Package, Users, BarChart3, Bell, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Store, Zap, CreditCard, DollarSign, Clock, Sun, Menu, Grid } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
    const router = useRouter();
    const { products, sales, customers } = useAppStore();
    const [ownerName, setOwnerName] = useState('Store Owner');
    const [storeName, setStoreName] = useState('My Store');
    const [isClient, setIsClient] = useState(false);
    const [showServicesMenu, setShowServicesMenu] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const profileStr = localStorage.getItem('retailos_profile');
            if (profileStr) {
                const profile = JSON.parse(profileStr);
                if (profile.ownerName) setOwnerName(profile.ownerName);
                if (profile.storeName) setStoreName(profile.storeName);
            }
        } catch (e) {
            console.error('Error parsing profile', e);
        }
    }, []);

    // Stats calculations
    const todayStats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaySales = sales.filter(s => {
            const saleDate = new Date(s.createdAt);
            return saleDate >= today;
        });

        const revenue = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        // Estimate profit if explicit cost not provided on items
        const profit = todaySales.reduce((sum, sale) => {
            if ((sale as any).profit) return sum + (sale as any).profit;
            let saleProfit = 0;
            if (sale.items && Array.isArray(sale.items)) {
                saleProfit = sale.items.reduce((pSum: number, item: any) => {
                    const price = item.price || 0;
                    const cost = item.costPrice || (price * 0.8); // 20% margin estimate if no cost
                    return pSum + ((price - cost) * (item.quantity || 1));
                }, 0);
            } else {
                saleProfit = (sale.total || 0) * 0.2;
            }
            return sum + saleProfit;
        }, 0);

        return {
            revenue,
            profit,
            transactions: todaySales.length
        };
    }, [sales]);

    // Alerts
    const alerts = useMemo(() => {
        const issues: Array<{ id: string, type: 'danger' | 'warning', title: string, subtitle: string }> = [];
        products.forEach(p => {
            const stock = p.stock || 0;
            const minStock = p.minStock || 5;
            if (stock === 0) {
                issues.push({ id: p.id, type: 'danger', title: p.name, subtitle: 'Out of stock' });
            } else if (stock <= minStock) {
                issues.push({ id: p.id, type: 'warning', title: p.name, subtitle: `${stock} left in stock` });
            }
        });
        return issues.slice(0, 3);
    }, [products]);

    // Recent Sales
    const recentSales = useMemo(() => {
        return [...sales].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        }).slice(0, 3);
    }, [sales]);

    // Empty state check
    const isCompletelyEmpty = products.length === 0 && sales.length === 0;

    // Health Score Calculation
    const healthScore = useMemo(() => {
        if (products.length === 0) return 0;
        
        // Stock Health: % of products above minStock
        const goodStockCount = products.filter(p => (p.stock || 0) > (p.minStock || 5)).length;
        const stockHealth = (goodStockCount / products.length) * 100;
        
        // Sales Health: Cap at 100 based on some arbitrary target, e.g., 5 sales/day
        const salesHealth = Math.min((todayStats.transactions / 5) * 100, 100);
        
        // Customer Health: Base on total customers, arbitrary target 50
        const customerHealth = Math.min((customers?.length || 0) / 50 * 100, 100);
        
        return Math.round((stockHealth + salesHealth + customerHealth) / 3);
    }, [products, todayStats.transactions, customers]);

    const getHealthColor = (score: number) => {
        if (score >= 70) return '#10B981'; // green
        if (score >= 40) return '#F59E0B'; // orange
        return '#EF4444'; // red
    };

    if (!isClient) return null; // Prevent hydration errors

    return (
        <div className="has-bottom-nav" style={{ background: '#F4F6FA', minHeight: '100vh', maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
            {/* Header */}
            <div className="gradient-primary" style={{ padding: '20px 20px 60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <button 
                            onClick={() => {
                                const { toggleSidebar } = useAppStore.getState();
                                if (window.innerWidth >= 1024) setShowServicesMenu(true);
                                else toggleSidebar();
                            }} 
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '12px', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 4, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>Good morning <Sun size={14} /></p>
                            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '4px 0' }}>{ownerName}</h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0 }}>{storeName}</p>
                        </div>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <Bell size={20} color="white" />
                        {alerts.length > 0 && (
                            <div style={{ position: 'absolute', top: 8, right: 10, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #f59e0b' }} />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Content Cards */}
            <div style={{ padding: '0 16px', marginTop: -40, paddingBottom: 100 }}>
                {isCompletelyEmpty ? (
                    <div style={{ background: 'white', borderRadius: 20, padding: '40px 20px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fef3c7', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={38} style={{ color: '#f59e0b' }} />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Welcome to RetailOS!</h2>
                        <p style={{ color: '#6B7280', marginTop: 8, lineHeight: 1.6, fontSize: 14 }}>Set up your store to get started. Add your products and make your first sale.</p>
                        <button onClick={() => router.push('/inventory')} style={{ marginTop: 24, background: '#f59e0b', color: 'white', padding: '14px 32px', borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            Add First Product
                            <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Quick Actions Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                            <motion.div whileTap={{ scale: 0.97 }} onClick={() => router.push('/billing')} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShoppingCart size={22} style={{ color: '#f59e0b' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>New Sale</p>
                                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, margin: 0 }}>Create invoice</p>
                                </div>
                            </motion.div>
                            
                            <motion.div whileTap={{ scale: 0.97 }} onClick={() => router.push('/inventory')} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={22} style={{ color: '#7C3AED' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Inventory</p>
                                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, margin: 0 }}>Manage stock</p>
                                </div>
                            </motion.div>
                            
                            <motion.div whileTap={{ scale: 0.97 }} onClick={() => router.push('/customers')} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={22} style={{ color: '#059669' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Customers</p>
                                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, margin: 0 }}>View directory</p>
                                </div>
                            </motion.div>
                            
                            <motion.div whileTap={{ scale: 0.97 }} onClick={() => router.push('/reports')} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BarChart3 size={22} style={{ color: '#D97706' }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', margin: 0 }}>Reports</p>
                                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, margin: 0 }}>Store analytics</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Today's Stats */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 4, msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="hide-scrollbar">
                            <div style={{ flex: '1 0 calc(33.33% - 8px)', background: 'white', borderRadius: 16, padding: '16px 12px', border: '1px solid #E5E7EB', minWidth: 100 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <div style={{ background: '#fef3c7', padding: 4, borderRadius: 6 }}>
                                        <DollarSign size={14} color="#f59e0b" />
                                    </div>
                                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Revenue</span>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{formatCurrency ? formatCurrency(todayStats.revenue) : `₹${todayStats.revenue}`}</div>
                            </div>
                            
                            <div style={{ flex: '1 0 calc(33.33% - 8px)', background: 'white', borderRadius: 16, padding: '16px 12px', border: '1px solid #E5E7EB', minWidth: 100 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <div style={{ background: '#ECFDF5', padding: 4, borderRadius: 6 }}>
                                        <TrendingUp size={14} color="#059669" />
                                    </div>
                                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Profit</span>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{formatCurrency ? formatCurrency(todayStats.profit) : `₹${todayStats.profit}`}</div>
                            </div>
                            
                            <div style={{ flex: '1 0 calc(33.33% - 8px)', background: 'white', borderRadius: 16, padding: '16px 12px', border: '1px solid #E5E7EB', minWidth: 100 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <div style={{ background: '#F5F3FF', padding: 4, borderRadius: 6 }}>
                                        <CreditCard size={14} color="#7C3AED" />
                                    </div>
                                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Sales</span>
                                </div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{todayStats.transactions}</div>
                            </div>
                        </div>

                        {/* Analytical Insights */}
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Analytical Insights</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, margin: '0 0 4px 0' }}>Top Selling Item</p>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>Tata Salt 1kg</p>
                                    </div>
                                    <div style={{ background: '#ECFDF5', padding: '6px 10px', borderRadius: 8 }}>
                                        <span style={{ color: '#059669', fontSize: 13, fontWeight: 700 }}>+24%</span>
                                    </div>
                                </div>
                                <div style={{ background: 'white', borderRadius: 16, padding: 16, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, margin: '0 0 4px 0' }}>Peak Business Hours</p>
                                        <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0 }}>6:00 PM - 8:00 PM</p>
                                    </div>
                                    <div style={{ background: '#F5F3FF', padding: '6px 10px', borderRadius: 8 }}>
                                        <span style={{ color: '#7C3AED', fontSize: 13, fontWeight: 700 }}>Peak</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Smart Alerts */}
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Smart Alerts</h3>
                            {alerts.length === 0 ? (
                                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <CheckCircle size={20} color="#059669" />
                                    <p style={{ color: '#065F46', fontSize: 14, fontWeight: 500, margin: 0 }}>All Clear — No urgent issues</p>
                                </div>
                            ) : (
                                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                    {alerts.map((alert, index) => (
                                        <div key={alert.id} style={{ padding: 16, borderBottom: index < alerts.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: alert.type === 'danger' ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{alert.title}</p>
                                                    <p style={{ fontSize: 12, color: alert.type === 'danger' ? '#EF4444' : '#D97706', margin: 0, marginTop: 2 }}>{alert.subtitle}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => router.push(`/inventory/${alert.id}`)} style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}>
                                                Fix →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Sales */}
                        {sales.length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Sales</h3>
                                    <button onClick={() => router.push('/reports')} style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>View All</button>
                                </div>
                                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                    {recentSales.map((sale, index) => {
                                        const saleDate = new Date(sale.createdAt);
                                        const timeAgo = Math.floor((new Date().getTime() - saleDate.getTime()) / 60000);
                                        const timeDisplay = timeAgo < 60 ? `${timeAgo}m ago` : timeAgo < 1440 ? `${Math.floor(timeAgo/60)}h ago` : `${Math.floor(timeAgo/1440)}d ago`;
                                        
                                        return (
                                            <div key={sale.id} style={{ padding: 16, borderBottom: index < recentSales.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F4F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <ShoppingCart size={18} color="#6B7280" />
                                                    </div>
                                                    <div>
                                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{sale.customerName || 'Walk-in Customer'}</p>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                                            <p style={{ fontSize: 12, color: '#9CA3AF' }}>#{sale.invoiceNumber || sale.id.substring(0,6).toUpperCase()}</p>
                                                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB' }} />
                                                            <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {timeDisplay}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, textAlign: 'right' }}>{typeof formatCurrency === 'function' ? formatCurrency(sale.total || 0) : `₹${sale.total || 0}`}</p>
                                                    <span style={{ fontSize: 10, padding: '2px 6px', background: '#F3F4F6', color: '#4B5563', borderRadius: 4, fontWeight: 500, marginTop: 4, display: 'inline-block', textTransform: 'capitalize' }}>
                                                        {sale.paymentMethod || 'Cash'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Business Health Score */}
                        {products.length > 0 && (
                            <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                                <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                                    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F3F4F6" strokeWidth="8" />
                                        <circle 
                                            cx="50" 
                                            cy="50" 
                                            r="40" 
                                            fill="transparent" 
                                            stroke={getHealthColor(healthScore)} 
                                            strokeWidth="8" 
                                            strokeDasharray={`${2 * Math.PI * 40}`} 
                                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                                            strokeLinecap="round" 
                                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{healthScore}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        Business Health
                                        <Zap size={16} color="#F59E0B" fill="#F59E0B" />
                                    </h3>
                                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 1.5, margin: '4px 0 0 0' }}>
                                        {healthScore >= 70 ? 'Your business is performing well. Keep it up!' : healthScore >= 40 ? 'Fair performance. Needs attention on stock levels.' : 'Critical attention needed for inventory and sales.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Services Modal for Desktop top-left button */}
            {showServicesMenu && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowServicesMenu(false)} />
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 20, opacity: 1 }} style={{ background: 'white', width: '90%', maxWidth: 400, borderRadius: 20, padding: 24, zIndex: 101, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>More Services</h2>
                            <button onClick={() => setShowServicesMenu(false)} style={{ border: 'none', background: '#F3F4F6', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button onClick={() => { setShowServicesMenu(false); router.push('/suppliers'); }} style={{ padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Store size={20} color="#f59e0b" />
                                <span style={{ fontWeight: 600 }}>Suppliers</span>
                            </button>
                            <button onClick={() => { setShowServicesMenu(false); router.push('/employees'); }} style={{ padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Users size={20} color="#7C3AED" />
                                <span style={{ fontWeight: 600 }}>Team</span>
                            </button>
                            <button onClick={() => { setShowServicesMenu(false); router.push('/settings'); }} style={{ padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Zap size={20} color="#059669" />
                                <span style={{ fontWeight: 600 }}>Settings</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}} />
        </div>
    );
}
