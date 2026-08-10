'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Users, CheckCircle, AlertTriangle, ShieldCheck, Search, Database } from 'lucide-react';
import { getAllStores, StoreRecord, isAdminLoggedIn, adminLogin, adminLogout } from '@/lib/licenseManager';

export default function AdminDashboardPage() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setIsAuthenticated(true);
      fetchStores();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    const data = await getAllStores();
    setStores(data.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()));
    setLoading(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      setIsAuthenticated(true);
      setError('');
      fetchStores();
    } else {
      setError('Invalid master password');
    }
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    setStores([]);
  };

  const filteredStores = stores.filter(s => 
    s.storeName.toLowerCase().includes(search.toLowerCase()) || 
    s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 page-enter">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-center mb-2">Master Dashboard</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Enter master password to view real platform data.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="input-premium w-full"
              />
              {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
            </div>
            <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-white font-bold shadow-md">
              Access Dashboard
            </button>
            <p className="text-[10px] text-gray-400 text-center">Hint: 'admin' for demo</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 bg-white border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Database size={22} className="text-blue-600" /> Master Admin
          </h1>
          <p className="text-xs text-gray-500 font-medium">Real Firebase Data</p>
        </div>
        <button onClick={handleLogout} className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors">
          Exit
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Store size={20} className="text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{stores.length}</p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Stores</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <Users size={20} className="text-green-600 mb-2" />
            <p className="text-2xl font-bold">{stores.filter(s => s.status === 'active').length}</p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Active Users</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <CheckCircle size={20} className="text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{stores.filter(s => s.plan === 'pro' || s.plan === 'basic').length}</p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Paid Plans</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
            <AlertTriangle size={20} className="text-amber-600 mb-2" />
            <p className="text-2xl font-bold">{stores.filter(s => s.status === 'trial').length}</p>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">On Trial</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores or owners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium pl-10 text-sm bg-white"
          />
        </div>

        {/* Store List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-gray-500 font-medium">Fetching real data from Firebase...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-sm font-medium">No stores found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Store & Owner</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Plan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold hidden md:table-cell">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStores.map(store => (
                    <motion.tr key={store.phone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{store.storeName}</p>
                        <p className="text-xs text-gray-500">{store.ownerName} · {store.city}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">{store.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                          ${store.plan === 'pro' ? 'bg-purple-100 text-purple-700' : 
                            store.plan === 'basic' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-600'}`}>
                          {store.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full 
                            ${store.status === 'active' ? 'bg-green-500' : 
                              store.status === 'trial' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="text-xs font-semibold capitalize text-gray-700">{store.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                        {new Date(store.registeredAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
