'use client'

import React, { useState, useEffect } from 'react';
import { StoreRecord, getAllStores, saveStoreRecord, registerStore, adminLogin, isAdminLoggedIn, getTrialDaysRemaining, setGlobalAnnouncement, getGlobalAnnouncement } from '@/lib/licenseManager';
import { Search, Filter, Plus, Store, Users, IndianRupee, ShieldCheck, Play, Ban, KeyRound, MessageCircle, Megaphone, X, Send, CheckSquare, Eye, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  
  // Data
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Add Store Dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStore, setNewStore] = useState({ email: '', ownerName: '', storeName: '', city: '', phone: '' });

  // Broadcast & Announcements
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [broadcastMessage, setBroadcastMessage] = useState('Hi {name}, your {subscription_plan} plan has {trial_days_remaining} days left. Let me know if you need help! - RetailOS');
  
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  
  useEffect(() => {
    const auth = isAdminLoggedIn();
    setIsLoggedIn(auth);
    if (auth) {
      loadStores();
    }
  }, []);
  
  async function loadStores() {
    const data = await getAllStores();
    setStores(data);
    const ann = await getGlobalAnnouncement();
    if (ann) setAnnouncementText(ann);
  }
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      setIsLoggedIn(true);
      loadStores();
    } else {
      alert("Invalid admin password");
    }
  };
  
  const handleStatusChange = async (store: StoreRecord, newStatus: 'suspended' | 'active') => {
    try {
      const updatedStore = { ...store, status: newStatus };
      await saveStoreRecord(updatedStore);
      setStores(stores.map(s => s.email === store.email ? updatedStore : s));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };
  
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStore.email || !newStore.ownerName || !newStore.storeName) {
      alert("Please fill all required fields");
      return;
    }
    try {
      const added = await registerStore(newStore.email, newStore.ownerName, newStore.storeName, newStore.city || 'India', newStore.phone);
      setStores(prev => {
         const exists = prev.find(s => s.email === added.email);
         if (exists) return prev.map(s => s.email === added.email ? added : s);
         return [...prev, added];
      });
      setIsAddOpen(false);
      setNewStore({ email: '', ownerName: '', storeName: '', city: '', phone: '' });
    } catch (err) {
      console.error(err);
      alert("Error adding store");
    }
  };

  const toggleSelectStore = (email: string) => {
    const next = new Set(selectedStores);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedStores(next);
  };

  const toggleSelectAll = () => {
    if (selectedStores.size === storesWithPhones.length) {
      setSelectedStores(new Set());
    } else {
      setSelectedStores(new Set(storesWithPhones.map(s => s.email)));
    }
  };

  const handleSendBroadcast = () => {
    if (selectedStores.size === 0) return;
    const selected = stores.filter(s => selectedStores.has(s.email));
    const firstStore = selected[0];
    
    // Format message
    const formattedMessage = broadcastMessage
      .replace(/{name}/g, firstStore.ownerName)
      .replace(/{subscription_plan}/g, firstStore.plan || 'trial')
      .replace(/{trial_days_remaining}/g, getTrialDaysRemaining(firstStore.trialEndsAt).toString());
      
    window.open(`https://wa.me/91${firstStore.phone}?text=${encodeURIComponent(formattedMessage)}`, '_blank');
    
    // Next steps logic for remaining could go here, but opening one window is safe for browsers
    if (selected.length > 1) {
      alert(`First message opened for ${firstStore.ownerName}. Other numbers to message: \n\n${selected.slice(1).map(s => s.phone).join('\n')}`);
    }
    
    setIsBroadcastOpen(false);
  };

  const handleSaveAnnouncement = async () => {
    await setGlobalAnnouncement(announcementText || null);
    setIsAnnouncementOpen(false);
    alert('Global announcement updated!');
  };

  const handleImpersonate = (store: StoreRecord) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('impersonatedStore', store.email);
      localStorage.setItem('impersonatedStoreName', store.storeName);
      window.location.href = '/dashboard';
    }
  };

  const handleDirectWhatsApp = (store: StoreRecord) => {
    if (!store.phone) {
      alert("No phone number recorded for this store.");
      return;
    }
    window.open(`https://wa.me/91${store.phone}`, '_blank');
  };
  
  if (isLoggedIn === null) {
    return <div className="min-h-screen bg-amber-50 flex items-center justify-center text-amber-900 font-medium">Loading...</div>;
  }
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-amber-100 transition-all">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-200">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">Master Admin</h1>
          <p className="text-slate-500 text-center mb-8">Login to access the RetailOS control panel</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Admin Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-amber-500">
                  <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none font-medium text-slate-800"
                  placeholder="Enter master password"
                  autoFocus
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  const activeStoresCount = stores.filter(s => s.status === 'active' || s.status === 'trial').length;
  const totalRevenue = stores.reduce((sum, s) => (s.status === 'active' ? sum + (s.monthlyFee || 0) : sum), 0);
  const storesWithPhones = stores.filter(s => s.phone);
  
  const filteredStores = stores.filter(s => {
    const matchesSearch = s.storeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#fffbeb] text-slate-800">
      {/* Header */}
      <header className="bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 pb-28 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                <ShieldCheck className="text-white h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">RetailOS Admin</h1>
                <p className="text-orange-50 font-medium opacity-90">Manage master records and licenses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsBroadcastOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 flex-1 sm:flex-none"
              >
                <Megaphone size={18} />
                Broadcast
              </button>
              <button 
                onClick={() => setIsAnnouncementOpen(true)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 flex-1 sm:flex-none"
              >
                <BellRing size={18} />
                Announce
              </button>
              <button 
                onClick={() => setIsAddOpen(true)}
                className="bg-white text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex-1 sm:flex-none"
              >
                <Plus size={20} className="stroke-[3]" />
                Add Store
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-amber-100/50 flex items-center gap-5 hover:border-amber-200 transition-colors">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 shadow-sm border border-blue-100">
              <Store className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Stores</p>
              <p className="text-3xl font-black text-slate-800">{stores.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-amber-100/50 flex items-center gap-5 hover:border-amber-200 transition-colors">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500 shadow-sm border border-emerald-100">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Active Stores</p>
              <p className="text-3xl font-black text-slate-800">{activeStoresCount}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-amber-100/50 flex items-center gap-5 hover:border-amber-200 transition-colors">
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 shadow-sm border border-amber-100">
              <IndianRupee className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Revenue</p>
              <p className="text-3xl font-black text-slate-800">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        
        {/* Table Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-amber-100/60 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/30">
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search stores, owners, or emails..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '3rem' }}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all shadow-sm font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm focus-within:ring-4 focus-within:ring-amber-500/20 focus-within:border-amber-400 transition-all w-full">
                <Filter className="text-slate-400 h-5 w-5" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-transparent outline-none w-full font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm">
                  <th className="px-6 py-5 font-bold uppercase tracking-wider">Store & Location</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider">Owner & Contact</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider">Plan & Trial</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStores.map(store => {
                  const trialDays = getTrialDaysRemaining(store.trialEndsAt);
                  return (
                    <tr key={store.email} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-base">{store.storeName}</div>
                        <div className="text-sm text-slate-500 font-medium mt-0.5">{store.city || 'India'}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-slate-700 font-bold">{store.ownerName}</div>
                        <div className="text-slate-500 text-sm mt-0.5">{store.email}</div>
                        {store.phone && <div className="text-slate-400 text-xs mt-0.5 font-mono">{store.phone}</div>}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="capitalize px-2 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {store.plan || 'Trial'}
                          </span>
                        </div>
                        {store.status === 'trial' ? (
                          <div className={`text-xs font-bold ${trialDays <= 3 ? 'text-red-500' : 'text-amber-500'}`}>
                            {trialDays > 0 ? `${trialDays} Days Left` : 'Expired'}
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-slate-400">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`capitalize px-3 py-1.5 rounded-lg text-xs font-bold border ${
                          store.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          store.status === 'trial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDirectWhatsApp(store)}
                            disabled={!store.phone}
                            className={`p-2 rounded-xl transition-all border ${store.phone ? 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border-[#25D366]/20 hover:border-[#25D366]' : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'}`}
                            title={store.phone ? "WhatsApp Direct" : "No Phone Number"}
                          >
                            <MessageCircle size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleImpersonate(store)}
                            className="p-2 rounded-xl transition-all border bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-200 hover:border-blue-600"
                            title="Log in as Store"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {store.status === 'suspended' ? (
                            <button
                              onClick={() => handleStatusChange(store, 'active')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 rounded-xl text-sm font-bold transition-all border border-emerald-200 hover:border-emerald-500 hover:shadow-md active:scale-95"
                            >
                              <Play size={16} /> Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(store, 'suspended')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-500 hover:text-white text-red-600 rounded-xl text-sm font-bold transition-all border border-red-200 hover:border-red-500 hover:shadow-md active:scale-95"
                            >
                              <Ban size={16} /> Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {filteredStores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                          <Store className="h-10 w-10 text-slate-300" />
                        </div>
                        <p className="text-xl font-bold text-slate-700 mb-1">No stores found</p>
                        <p className="text-sm font-medium text-slate-400">Try adjusting your search terms or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {isBroadcastOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBroadcastOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-br from-[#25D366] to-emerald-600 p-6 sm:p-8 text-white relative shrink-0">
                <button onClick={() => setIsBroadcastOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><X size={20} /></button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><Megaphone size={24} /></div>
                  <h2 className="text-2xl font-bold">Admin Broadcast</h2>
                </div>
                <p className="text-emerald-50 text-sm font-medium opacity-90">Send dynamic WhatsApp updates to store owners.</p>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Message Template</label>
                    <textarea 
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none h-32 text-sm font-medium"
                      placeholder="Type message here..."
                    />
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">{'{name}'}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">{'{subscription_plan}'}</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">{'{trial_days_remaining}'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-slate-700">Select Recipients</label>
                      <button onClick={toggleSelectAll} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                        {selectedStores.size === storesWithPhones.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-h-[200px] overflow-y-auto">
                      {storesWithPhones.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm font-medium">No stores with phone numbers found.</div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {storesWithPhones.map(store => (
                            <div key={store.email} onClick={() => toggleSelectStore(store.email)} className="p-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors">
                              <button className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${selectedStores.has(store.email) ? 'bg-emerald-500 text-white' : 'bg-slate-100 border border-slate-200 text-transparent'}`}>
                                <CheckSquare size={14} className={selectedStores.has(store.email) ? 'block' : 'hidden'} />
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{store.storeName} <span className="text-slate-400 font-medium">({store.ownerName})</span></p>
                                <p className="text-xs text-slate-500 font-mono truncate">{store.phone}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex gap-4">
                <button onClick={() => setIsBroadcastOpen(false)} className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSendBroadcast} 
                  disabled={selectedStores.size === 0}
                  className="flex-1 px-4 py-3.5 bg-[#25D366] hover:bg-[#1ebd5c] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  <Send size={18} />
                  Send to {selectedStores.size} Stores
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {isAnnouncementOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAnnouncementOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 sm:p-8 text-white relative shrink-0">
                <button onClick={() => setIsAnnouncementOpen(false)} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><X size={20} /></button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><BellRing size={24} /></div>
                  <h2 className="text-2xl font-bold">Global Announcement</h2>
                </div>
                <p className="text-blue-100 text-sm font-medium opacity-90">Set a persistent banner that appears on every store's dashboard.</p>
              </div>

              <div className="p-6 sm:p-8 flex-1 bg-slate-50">
                <label className="block text-sm font-bold text-slate-700 mb-2">Announcement Message</label>
                <textarea 
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none h-32 text-sm font-medium"
                  placeholder="e.g. Scheduled Maintenance tonight at 2 AM..."
                />
                <p className="text-xs text-slate-500 mt-2">Leave blank and save to remove the current announcement.</p>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex gap-4">
                <button onClick={() => setIsAnnouncementOpen(false)} className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveAnnouncement} 
                  className="flex-1 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                >
                  <Send size={18} />
                  Publish Banner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Store Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all overflow-y-auto py-10">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20 m-auto relative">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
              <h2 className="text-2xl font-bold mb-1 relative z-10">Add New Store</h2>
              <p className="text-orange-50 text-sm font-medium relative z-10 opacity-90">Register a new store manually to the platform</p>
            </div>
            
            <form onSubmit={handleAddStore} className="p-6 sm:p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Store Name *</label>
                <input
                  type="text"
                  required
                  value={newStore.storeName}
                  onChange={e => setNewStore({...newStore, storeName: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all font-medium"
                  placeholder="e.g. SuperMart"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={newStore.ownerName}
                    onChange={e => setNewStore({...newStore, ownerName: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all font-medium"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={newStore.phone}
                    onChange={e => setNewStore({...newStore, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all font-medium font-mono"
                    placeholder="9999999999"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={newStore.email}
                  onChange={e => setNewStore({...newStore, email: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all font-medium"
                  placeholder="john@supermart.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={newStore.city}
                  onChange={e => setNewStore({...newStore, city: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all font-medium"
                  placeholder="e.g. Mumbai (Optional)"
                />
              </div>
              
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98]"
                >
                  Register Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
