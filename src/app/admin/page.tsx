'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LogOut, Store, Users, DollarSign, TrendingUp, PauseCircle, PlayCircle, Phone, MessageCircle, Search, RefreshCw, Crown, Zap, CheckCircle, XCircle, Clock, BarChart3, Eye, EyeOff, ChevronRight, AlertTriangle } from 'lucide-react';
import { getAllStores, saveAllStores, adminLogin, isAdminLoggedIn, adminLogout, StoreRecord } from '@/lib/licenseManager';

const DEMO_STORES: StoreRecord[] = [
  { phone: '9876543200', ownerName: 'Rajesh Kumar', storeName: 'Shree Ram Medical Store', city: 'Bangalore', registeredAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), lastLogin: new Date().toISOString(), status: 'trial', trialEndsAt: new Date(Date.now() + 9 * 24 * 3600000).toISOString(), paidUntil: null, plan: 'trial', notes: '', monthlyFee: 999 },
  { phone: '9845001234', ownerName: 'Priya Sharma', storeName: 'Patel Kirana Store', city: 'Mumbai', registeredAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), lastLogin: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'active', trialEndsAt: new Date(Date.now() - 6 * 24 * 3600000).toISOString(), paidUntil: new Date(Date.now() + 25 * 24 * 3600000).toISOString(), plan: 'basic', notes: 'Paid via UPI on Aug 1', monthlyFee: 999 },
  { phone: '9900112233', ownerName: 'Suresh Patel', storeName: 'Sri Venkateshwara Electronics', city: 'Hyderabad', registeredAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(), lastLogin: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), status: 'suspended', trialEndsAt: new Date(Date.now() - 31 * 24 * 3600000).toISOString(), paidUntil: null, plan: 'trial', notes: 'Trial expired, awaiting payment', monthlyFee: 0 },
];

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if logged in
    const loggedIn = isAdminLoggedIn();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      loadStores();
    }
    
    setIsInitializing(false);
  }, []);
  
  const loadStores = () => {
    let allStores = getAllStores();
    if (allStores.length === 0) {
      // Load demo data if empty
      saveAllStores(DEMO_STORES);
      allStores = DEMO_STORES;
    }
    setStores(allStores);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      setIsLoggedIn(true);
      setError('');
      loadStores();
    } else {
      setError('Invalid master password.');
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsLoggedIn(false);
    setPassword('');
  };

  const handleSuspend = (phone: string) => {
    if (!window.confirm('Are you sure you want to suspend this store?')) return;
    const all = getAllStores();
    const updated = all.map(s => s.phone === phone ? { ...s, status: 'suspended' as const } : s);
    saveAllStores(updated);
    setStores([...updated]);
  };

  const handleReactivate = (phone: string) => {
    if (!window.confirm('Reactivate this store?')) return;
    const all = getAllStores();
    const paidUntil = new Date(Date.now() + 30 * 24 * 3600000).toISOString();
    const updated = all.map(s => s.phone === phone ? { ...s, status: 'active' as const, plan: 'basic' as const, paidUntil, monthlyFee: 999 } : s);
    saveAllStores(updated);
    setStores([...updated]);
  };
  
  const handleUpdatePlan = (phone: string, plan: 'trial' | 'basic' | 'pro') => {
    const all = getAllStores();
    const fee = plan === 'basic' ? 999 : plan === 'pro' ? 1999 : 0;
    const updated = all.map(s => s.phone === phone ? { ...s, plan, monthlyFee: fee } : s);
    saveAllStores(updated);
    setStores([...updated]);
  };

  if (isInitializing) return null;

  if (!isLoggedIn) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(10px)', 
            borderRadius: 24, 
            padding: 32, 
            width: '100%', 
            maxWidth: 400,
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(251, 191, 36, 0.2)', padding: 12, borderRadius: '50%', marginBottom: 16 }}>
              <Crown color="#fbbf24" size={32} />
            </div>
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>RetailOS Master Panel</h1>
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>Manthan's Control Center</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20, position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Master Password"
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  borderRadius: 12, 
                  background: 'rgba(0,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white',
                  fontSize: 16,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: 14, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>{error}</p>}
            
            <button 
              type="submit"
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: 'linear-gradient(135deg, #fbbf24, #d97706)', 
                color: '#451a03', 
                border: 'none', 
                borderRadius: 12, 
                fontSize: 16, 
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
              }}
            >
              Enter Control Room <Shield size={18} />
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#94a3b8', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
              v2.0 • Restricted Access
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredStores = stores.filter(s => 
    s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.phone.includes(searchQuery) ||
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'active' || s.status === 'trial').length;
  const suspendedStores = stores.filter(s => s.status === 'suspended').length;
  
  const mrr = stores
    .filter(s => s.status === 'active' && s.plan !== 'trial')
    .reduce((sum, s) => sum + (s.monthlyFee || 0), 0);
    
  const paidCount = stores.filter(s => s.status === 'active' && s.plan !== 'trial').length;

  return (
    <div style={{ background: '#F4F6FA', minHeight: '100vh' }}>
      {/* Dark header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', padding: '24px 20px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', maxWidth: 800, margin: '0 auto' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Master Control Panel</p>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, marginTop: 4 }}>RetailOS Admin</h1>
            <p style={{ color: '#fbbf24', fontSize: 13, marginTop: 2 }}>👑 Manthan's Dashboard</p>
          </div>
          <button 
            onClick={handleLogout} 
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
      
      {/* Content pulled up */}
      <div style={{ padding: '0 16px', marginTop: -24, paddingBottom: 40, maxWidth: 800, margin: '-24px auto 0' }}>
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>TOTAL STORES</p>
              <Store size={14} color="#9CA3AF" />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginTop: 4 }}>{totalStores}</p>
          </div>
          
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>ACTIVE</p>
              <CheckCircle size={14} color="#10b981" />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginTop: 4 }}>{activeStores}</p>
          </div>
          
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>MONTHLY REV</p>
              <DollarSign size={14} color="#10b981" />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginTop: 4 }}>₹{(mrr/1000).toFixed(1)}k</p>
          </div>
          
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>SUSPENDED</p>
              <AlertTriangle size={14} color="#ef4444" />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginTop: 4 }}>{suspendedStores}</p>
          </div>
        </div>

        {/* MRR Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a56db, #7c3aed)', borderRadius: 16, padding: '20px', marginBottom: 20, color: 'white', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
          <p style={{ opacity: 0.8, fontSize: 12, fontWeight: 600 }}>MONTHLY RECURRING REVENUE</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <p style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>₹{mrr.toLocaleString('en-IN')}</p>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>/ month</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.9, fontSize: 13, marginTop: 8 }}>
            <TrendingUp size={14} />
            <span>{paidCount} active paying stores</span>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search store name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '14px 14px 14px 42px', 
              borderRadius: 12, 
              border: '1px solid #E5E7EB', 
              background: 'white',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        {/* Store List */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Store size={18} /> Store Directory
        </h2>
        
        {filteredStores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 16, border: '1px dashed #D1D5DB' }}>
            <Search size={32} color="#9CA3AF" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#6B7280', fontSize: 14 }}>No stores found.</p>
          </div>
        ) : (
          <div>
            <AnimatePresence>
              {filteredStores.map((store) => (
                <motion.div 
                  key={store.phone}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -2 }} 
                  style={{ background: 'white', borderRadius: 16, padding: '16px', border: '1px solid #E5E7EB', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{store.storeName}</p>
                        <span style={{ 
                          background: store.status === 'suspended' ? '#fee2e2' : store.status === 'trial' ? '#fef3c7' : '#d1fae5', 
                          color: store.status === 'suspended' ? '#dc2626' : store.status === 'trial' ? '#d97706' : '#059669', 
                          padding: '2px 8px', 
                          borderRadius: 999, 
                          fontSize: 11, 
                          fontWeight: 700 
                        }}>
                          {store.status.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <Users size={12} color="#6B7280" />
                        <p style={{ fontSize: 13, color: '#4B5563', fontWeight: 500 }}>{store.ownerName}</p>
                        <span style={{ color: '#D1D5DB' }}>•</span>
                        <p style={{ fontSize: 13, color: '#4B5563', fontFamily: 'monospace' }}>{store.phone}</p>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Clock size={12} color="#9CA3AF" />
                        <p style={{ fontSize: 12, color: '#6B7280' }}>
                          Joined {new Date(store.registeredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plan Selection */}
                  <div style={{ marginTop: 16, padding: '12px', background: '#F9FAFB', borderRadius: 12, border: '1px solid #F3F4F6' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>CURRENT PLAN</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {(['trial', 'basic', 'pro'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => handleUpdatePlan(store.phone, p)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            border: `1px solid ${store.plan === p ? '#3B82F6' : '#E5E7EB'}`,
                            background: store.plan === p ? '#EFF6FF' : 'white',
                            color: store.plan === p ? '#2563EB' : '#4B5563',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {p} {p === 'basic' ? '(₹999)' : p === 'pro' ? '(₹1999)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {store.status !== 'suspended' ? (
                      <button 
                        onClick={() => handleSuspend(store.phone)} 
                        style={{ flex: 1, padding: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <PauseCircle size={15} /> Suspend
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReactivate(store.phone)} 
                        style={{ flex: 1, padding: '10px', background: '#d1fae5', color: '#059669', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <PlayCircle size={15} /> Reactivate
                      </button>
                    )}
                    <button 
                      onClick={() => window.open(`https://wa.me/91${store.phone}?text=${encodeURIComponent(`Hi ${store.ownerName}, regarding your RetailOS subscription...`)}`, '_blank')} 
                      style={{ flex: 1, padding: '10px', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
