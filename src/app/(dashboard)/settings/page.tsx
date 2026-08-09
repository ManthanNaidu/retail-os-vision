'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, User, Shield, HelpCircle, Eye, EyeOff, Check, 
  Phone, MapPin, Edit2, Download, Trash2, MessageCircle, 
  ExternalLink, ChevronRight, Package, Users, DollarSign, Crown 
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getStoreTypeList } from '@/lib/storeTypes';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { formatCurrency } from '@/lib/utils';

// Interfaces
interface Profile {
  storeName: string;
  ownerName: string;
  phone: string;
  city: string;
  address: string;
  gstNumber: string;
  upiId: string;
  storeType: string;
}

const SettingsPage = () => {
  // Store data from localStorage profile
  const { products, customers, sales } = useAppStore();
  const [profile, setProfile] = useState<Profile>({
    storeName: '', ownerName: '', phone: '', city: '', 
    address: '', gstNumber: '', upiId: '', storeType: ''
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isClearDataOpen, setIsClearDataOpen] = useState(false);
  
  // Subscription state
  const [subscription, setSubscription] = useState({ plan: 'Trial', daysRemaining: 0 });
  const [hasPassword, setHasPassword] = useState(false);
  
  // Stats computed from store
  const thisMonthSales = sales
    .filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, s) => sum + s.total, 0);
  const stats = { products: products.length, customers: customers.length, sales: thisMonthSales };
  const [storeTypes, setStoreTypes] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    // Load store types
    try {
      setStoreTypes(getStoreTypeList().map(t => ({ id: t.id, name: t.name })));
    } catch (e) {
      // ignore
    }

    // Load profile
    const savedProfile = localStorage.getItem('retailos_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch(e) {}
    }
    
    // Check if password exists
    let phone = '';
    if (savedProfile) {
      try {
        phone = JSON.parse(savedProfile).phone || '';
      } catch (e) {}
    }
    
    if (phone) {
      const pwd = localStorage.getItem('retailos_pwd_' + phone);
      setHasPassword(!!pwd);
    }
    
    // Load subscription
    const stores = localStorage.getItem('retailos_stores');
    if (stores) {
      try {
        const parsed = JSON.parse(stores);
        if (parsed.length > 0) {
          const store = parsed[0]; // simplistic assumption
          setSubscription({
            plan: store.plan || 'Trial',
            daysRemaining: store.daysRemaining || 14
          });
        }
      } catch(e) {}
    }
    
    // Load stats from Zustand store (already loaded elsewhere)
    // Stats are set in the component body via useAppStore
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleProfileSave = () => {
    localStorage.setItem('retailos_profile', JSON.stringify(profile));
    showToast('Profile saved successfully');
  };

  const handlePasswordSave = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 4) {
      showToast('Password too short');
      return;
    }
    // Simplistic password validation for mock
    const pwdKey = 'retailos_pwd_' + profile.phone;
    if (hasPassword) {
      const current = localStorage.getItem(pwdKey);
      if (current !== passwordForm.current) {
        showToast('Incorrect current password');
        return;
      }
    }
    
    localStorage.setItem(pwdKey, passwordForm.new);
    setHasPassword(true);
    setPasswordForm({ current: '', new: '', confirm: '' });
    showToast('Password updated');
  };

  const exportData = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('retailos_')) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retailos_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('retailos_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="page-enter has-bottom-nav">
      <div className="page-container py-5 space-y-6">
        
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 flex flex-col items-center text-center">
            <Package className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs text-text-muted">Products</span>
            <span className="font-bold text-text-primary">{stats.products}</span>
          </div>
          <div className="card p-3 flex flex-col items-center text-center">
            <Users className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs text-text-muted">Customers</span>
            <span className="font-bold text-text-primary">{stats.customers}</span>
          </div>
          <div className="card p-3 flex flex-col items-center text-center">
            <DollarSign className="w-5 h-5 text-primary mb-1" />
            <span className="text-xs text-text-muted">Sales</span>
            <span className="font-bold text-text-primary">{formatCurrency(stats.sales)}</span>
          </div>
        </div>

        {/* Store Profile */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="section-header mb-0">Store Profile</h2>
          </div>
          <div className="card p-4 space-y-4">
            <div>
              <label className="text-xs text-text-muted font-medium mb-1 block">Store Name</label>
              <input 
                className="input-premium w-full"
                value={profile.storeName}
                onChange={e => setProfile({...profile, storeName: e.target.value})}
                placeholder="E.g. Sharma Kirana"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted font-medium mb-1 block">Owner Name</label>
                <input 
                  className="input-premium w-full"
                  value={profile.ownerName}
                  onChange={e => setProfile({...profile, ownerName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium mb-1 block">Phone (Read-only)</label>
                <input 
                  className="input-premium w-full bg-bg-pearl opacity-70"
                  value={profile.phone}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1 block">Store Type</label>
              <select 
                className="input-premium w-full"
                value={profile.storeType}
                onChange={e => setProfile({...profile, storeType: e.target.value})}
              >
                <option value="">Select type...</option>
                {storeTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1 block">City</label>
              <input 
                className="input-premium w-full"
                value={profile.city}
                onChange={e => setProfile({...profile, city: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs text-text-muted font-medium mb-1 block">Address</label>
              <textarea 
                className="input-premium w-full min-h-[80px] resize-none"
                value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-text-muted font-medium mb-1 block">GST Number</label>
                <input 
                  className="input-premium w-full"
                  value={profile.gstNumber}
                  onChange={e => setProfile({...profile, gstNumber: e.target.value})}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted font-medium mb-1 block">UPI ID</label>
                <input 
                  className="input-premium w-full"
                  value={profile.upiId}
                  onChange={e => setProfile({...profile, upiId: e.target.value})}
                  placeholder="For QR payments"
                />
              </div>
            </div>
            <button className="btn-primary w-full mt-2" onClick={handleProfileSave}>
              Save Profile
            </button>
          </div>
        </section>

        {/* Subscription Status */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="section-header mb-0">Subscription</h2>
          </div>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-text-muted">Current Plan</div>
                <div className="font-bold text-lg text-text-primary">{subscription.plan}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-text-muted">Status</div>
                <div className="font-bold text-primary">{subscription.daysRemaining} days left</div>
              </div>
            </div>
            
            <div className="bg-bg-pearl rounded-lg p-3 mb-4 space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Basic Plan</span>
                <span className="font-medium">₹999/month</span>
              </div>
              <div className="flex justify-between">
                <span>Pro Plan</span>
                <span className="font-medium">₹1,999/month</span>
              </div>
            </div>
            
            <a 
              href="https://wa.me/918000000000?text=Hi,%20I%20want%20to%20upgrade%20my%20RetailOS%20plan"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full bg-green-600 hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Support to Upgrade
            </a>
          </div>
        </section>

        {/* Password Management */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="section-header mb-0">Security</h2>
          </div>
          <div className="card p-4 space-y-4">
            {hasPassword && (
              <div>
                <label className="text-xs text-text-muted font-medium mb-1 block">Current Password</label>
                <div className="relative">
                  <input 
                    type={showCurrentPassword ? "text" : "password"}
                    className="input-premium w-full pr-10"
                    value={passwordForm.current}
                    onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            
            <div>
              <label className="text-xs text-text-muted font-medium mb-1 block">New Password</label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  className="input-premium w-full pr-10"
                  value={passwordForm.new}
                  onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-text-muted font-medium mb-1 block">Confirm New Password</label>
              <input 
                type={showNewPassword ? "text" : "password"}
                className="input-premium w-full"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
              />
            </div>
            
            <button className="btn-primary w-full mt-2" onClick={handlePasswordSave}>
              {hasPassword ? 'Change Password' : 'Set Password'}
            </button>
          </div>
        </section>

        {/* About & Help */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="section-header mb-0">About & Support</h2>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="list-item border-b border-border p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">App Version</span>
              <span className="text-sm text-text-muted">v1.0.0</span>
            </div>
            <a 
              href="https://wa.me/918000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="list-item border-b border-border p-4 flex items-center justify-between hover:bg-bg-pearl"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-text-primary">WhatsApp Support</span>
              </div>
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </a>
            <a 
              href="#"
              className="list-item border-b border-border p-4 flex items-center justify-between hover:bg-bg-pearl"
            >
              <span className="text-sm font-medium text-text-primary">Rate this app</span>
              <ExternalLink className="w-4 h-4 text-text-muted" />
            </a>
            <button 
              onClick={exportData}
              className="list-item border-b border-border p-4 flex items-center justify-between w-full text-left hover:bg-bg-pearl"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-text-primary">Export My Data</span>
              </div>
            </button>
            <button 
              onClick={() => setIsClearDataOpen(true)}
              className="list-item p-4 flex items-center justify-between w-full text-left hover:bg-red-50"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">Clear All Data</span>
              </div>
            </button>
          </div>
        </section>

      </div>

      <AnimatePresence>
        {isClearDataOpen && (
          <ConfirmDelete
            title="Clear All Data?"
            message="This will permanently delete all your products, sales, and settings from this device. This cannot be undone."
            onConfirm={handleClearData}
            onCancel={() => setIsClearDataOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 text-sm whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;



