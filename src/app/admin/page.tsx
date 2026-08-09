'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, Users, CreditCard, Zap, Search, Settings, 
  Menu, CheckCircle, X, Clock, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, Lock, Shield, MessageCircle, Bell,
  LogOut, Plus
} from 'lucide-react';
import { getAllStores, saveStoreRecord, StoreRecord } from '@/lib/licenseManager';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded admin password for demo purposes
    if (loginPassword === 'admin123') {
      setIsLoggedIn(true);
      fetchStores();
    } else {
      setLoginError('Invalid admin password');
    }
  };

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStores();
      // Ensure data is array
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (store: StoreRecord, newStatus: StoreRecord['status']) => {
    try {
      const updatedStore = { ...store, status: newStatus };
      await saveStoreRecord(updatedStore);
      // Update locally
      setStores(prev => prev.map(s => s.phone === store.phone ? updatedStore : s));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = 
      store.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      store.phone?.includes(searchQuery) ||
      store.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = stores.reduce((acc, store) => {
    if (store.plan === 'pro') return acc + 1999;
    return acc + 999; // basic and trial
  }, 0);

  const activeStores = stores.filter(s => s.status === 'active').length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Admin Access</h1>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Enter your credentials to access the master dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Master Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="input-premium pl-10 w-full"
                  placeholder="••••••••"
                  required
                />
              </div>
              {loginError && <p className="text-red-500 text-sm mt-2">{loginError}</p>}
            </div>
            <button type="submit" className="btn-primary w-full py-3 flex justify-center items-center gap-2">
              <Lock className="w-4 h-4" /> Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col shadow-xl z-10 hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vision Admin</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/10 text-blue-400 rounded-xl font-medium transition-colors">
            <Store className="w-5 h-5" /> All Stores
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5" /> Customers
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors">
            <CreditCard className="w-5 h-5" /> Billing
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl font-medium transition-colors">
            <Settings className="w-5 h-5" /> Platform Settings
          </button>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchStores} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Refresh">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-9 h-9 bg-gray-900 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-medium text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Stores</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stores.length}</h3>
                </div>
              </div>
              
              <div className="card p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Stores</p>
                  <h3 className="text-2xl font-bold text-gray-900">{activeStores}</h3>
                </div>
              </div>

              <div className="card p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</h3>
                </div>
              </div>

              <div className="card p-5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Growth</p>
                  <h3 className="text-2xl font-bold text-gray-900">+12%</h3>
                </div>
              </div>
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                <h2 className="text-lg font-bold text-gray-900">Registered Stores</h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input-premium pl-9 py-2 text-sm w-full bg-gray-50 border-gray-200"
                      placeholder="Search stores..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select 
                    className="input-premium py-2 text-sm bg-gray-50 border-gray-200 w-full sm:w-auto"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="trial">Trial</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                    <p>Loading stores from database...</p>
                  </div>
                ) : filteredStores.length === 0 ? (
                  <div className="p-12 flex flex-col items-center justify-center text-gray-400 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Store className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No stores found</h3>
                    <p className="text-sm">We couldn't find any stores matching your criteria.</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium">Store Info</th>
                        <th className="px-6 py-4 font-medium">Plan</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Created</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStores.map((store) => (
                        <tr key={store.phone} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold uppercase shrink-0">
                                {store.storeName?.substring(0,2) || 'ST'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{store.storeName}</div>
                                <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                                  <Users className="w-3 h-3" /> {store.ownerName} &bull; {store.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                              ${store.plan === 'pro' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                store.plan === 'basic' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                'bg-gray-100 text-gray-700 border-gray-200'}`}>
                              {store.plan?.toUpperCase() || 'TRIAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                              ${store.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                store.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-amber-50 text-amber-700 border-amber-200'}`}>
                              {store.status === 'active' && <CheckCircle className="w-3.5 h-3.5" />}
                              {store.status === 'suspended' && <X className="w-3.5 h-3.5" />}
                              {store.status === 'trial' && <Clock className="w-3.5 h-3.5" />}
                              {store.status?.charAt(0).toUpperCase() + store.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {new Date(store.registeredAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {store.status === 'active' ? (
                                <button 
                                  onClick={() => handleStatusChange(store, 'suspended')}
                                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-100"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleStatusChange(store, 'active')}
                                  className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-100"
                                >
                                  Activate
                                </button>
                              )}
                              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
