const fs = require('fs');

const code = `
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, User, Shield, HelpCircle, Eye, EyeOff, Check, 
  Phone, MapPin, Edit2, Download, Trash2, MessageCircle, 
  ExternalLink, ChevronRight, Package, Users, DollarSign, Crown,
  Bell, ChevronLeft, Wallet, Box, Bot, ShieldCheck, FileText,
  AlertCircle, LogOut, ArrowRight, ArrowLeft
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getStoreTypeList } from '@/lib/storeTypes';
import { ConfirmDelete } from '@/components/shared/ConfirmDelete';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

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
  const router = useRouter();
  const { logout } = useAuth();
  
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
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
  // Subscription state
  const [subscription, setSubscription] = useState({ plan: 'Free Trial', daysRemaining: 0 });
  const [hasPassword, setHasPassword] = useState(false);
  
  // App state
  const [activeView, setActiveView] = useState<'main' | 'profile' | 'security' | 'coming_soon'>('main');
  const [comingSoonTitle, setComingSoonTitle] = useState('');
  
  // Stats computed from store
  const thisMonthSales = sales
    .filter(s => new Date(s.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, s) => sum + s.total, 0);
  const stats = { products: products.length, customers: customers.length, sales: thisMonthSales };
  const [storeTypes, setStoreTypes] = useState<{id: string, name: string}[]>([]);

  const [upiQrCode, setUpiQrCode] = useState<string | null>(null);

  useEffect(() => {
    // Load store types
    try {
      setStoreTypes(getStoreTypeList().map(t => ({ id: t.id, name: t.name })));
    } catch (e) {}

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
    
    // Load UPI QR Code
    const savedQr = localStorage.getItem('retailos_upi_qr');
    if (savedQr) setUpiQrCode(savedQr);

    // Load subscription
    const stores = localStorage.getItem('retailos_stores');
    if (stores) {
      try {
        const parsed = JSON.parse(stores);
        if (parsed.length > 0) {
          const store = parsed[0];
          setSubscription({
            plan: store.plan || 'Free Trial',
            daysRemaining: store.daysRemaining || 14
          });
        }
      } catch(e) {}
    }
  }, []);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUpiQrCode(base64String);
        localStorage.setItem('retailos_upi_qr', base64String);
        showToast('QR Code saved successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveQr = () => {
    setUpiQrCode(null);
    localStorage.removeItem('retailos_upi_qr');
    showToast('QR Code removed');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleProfileSave = () => {
    localStorage.setItem('retailos_profile', JSON.stringify(profile));
    showToast('Profile saved successfully');
    setTimeout(() => setActiveView('main'), 600);
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
    showToast('Password updated successfully');
    setTimeout(() => setActiveView('main'), 600);
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
    showToast('Data exported successfully');
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

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const openComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setActiveView('coming_soon');
  };

  // UI Components
  
  const SettingsRow = ({ icon: Icon, color, bg, title, subtitle, badge, onClick, danger = false }: any) => (
    <div 
      onClick={onClick}
      className={\`flex items-center gap-4 p-4 cursor-pointer transition-colors \${danger ? 'hover:bg-red-50' : 'hover:bg-slate-50'}\`}
    >
      <div className={\`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 \${danger ? 'bg-red-50 text-red-500' : bg}\`}>
        <Icon className={\`w-5 h-5 \${danger ? 'text-red-500' : color}\`} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={\`text-[15px] font-bold leading-tight mb-0.5 \${danger ? 'text-red-600' : 'text-[#101B35]'}\`}>{title}</h4>
        {subtitle && <p className="text-[13px] text-[#64748B] font-medium truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={\`text-[11px] font-bold px-2 py-0.5 rounded-full \${badge.style === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}\`}>
            {badge.text}
          </span>
        )}
        {!danger && <ChevronRight className="w-5 h-5 text-slate-300" />}
      </div>
    </div>
  );

  const SectionCard = ({ children, className = '' }: any) => (
    <div className={\`bg-white border border-[#E8ECF2] rounded-[24px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] \${className}\`}>
      {children}
    </div>
  );

  // Views
  
  const renderMainView = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-[100px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center" onClick={() => router.back()}>
            <LucideIcons.Menu className="w-6 h-6 text-[#101B35]" />
          </div>
          <div>
            <h1 className="text-[22px] font-black text-[#101B35] leading-tight tracking-tight">Settings</h1>
            <p className="text-[13px] font-medium text-[#64748B]">Manage your store and account</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6 text-[#101B35]" strokeWidth={1.5} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-[#FAFAFA] rounded-full"></span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF7A00] to-[#FF4D00] flex items-center justify-center text-white font-bold text-[16px] shadow-sm">
            {profile.ownerName ? profile.ownerName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5">
        
        {/* Business Snapshot */}
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar -mx-5 px-5">
          <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-4 min-w-[130px] flex-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[12px] font-bold text-[#64748B]">Products</span>
            </div>
            <div>
              <div className="text-[22px] font-black text-[#101B35] leading-none mb-1">{stats.products}</div>
              <div className="text-[10px] font-medium text-[#64748B]">Items in stock</div>
            </div>
          </div>

          <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-4 min-w-[130px] flex-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-[12px] font-bold text-[#64748B]">Customers</span>
            </div>
            <div>
              <div className="text-[22px] font-black text-[#101B35] leading-none mb-1">{stats.customers}</div>
              <div className="text-[10px] font-medium text-[#64748B]">Total customers</div>
            </div>
          </div>

          <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-4 min-w-[140px] flex-1 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[100px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                <span className="text-[16px] font-bold text-green-600">₹</span>
              </div>
              <span className="text-[12px] font-bold text-[#64748B]">Sales</span>
            </div>
            <div>
              <div className="text-[22px] font-black text-[#101B35] leading-none mb-1">₹{stats.sales.toLocaleString()}</div>
              <div className="text-[10px] font-medium text-[#64748B]">Total sales</div>
            </div>
          </div>
        </div>

        {/* Settings Categories */}
        <SectionCard>
          <SettingsRow 
            icon={Store} color="text-orange-500" bg="bg-orange-50"
            title="Store Profile" subtitle="Store details, address, GST, UPI & more"
            badge={{ text: 'Updated', style: 'orange' }}
            onClick={() => setActiveView('profile')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={Wallet} color="text-green-600" bg="bg-green-50"
            title="Billing & Payments" subtitle="Invoices, taxes, UPI, payment methods"
            onClick={() => openComingSoon('Billing & Payments')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={Box} color="text-orange-500" bg="bg-orange-50"
            title="Inventory" subtitle="Stock alerts, units, barcodes, expiry"
            onClick={() => openComingSoon('Inventory')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={Users} color="text-blue-500" bg="bg-blue-50"
            title="Customers" subtitle="Credit, loyalty points, messaging"
            onClick={() => openComingSoon('Customers')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={ShieldCheck} color="text-purple-600" bg="bg-purple-50"
            title="Team & Permissions" subtitle="Manage team, roles and access"
            badge={{ text: '1 Member', style: 'purple' }}
            onClick={() => openComingSoon('Team & Permissions')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={Bot} color="text-purple-600" bg="bg-purple-50"
            title="RetailBot AI ✦" subtitle="AI assistant, insights & recommendations"
            onClick={() => openComingSoon('RetailBot AI')}
          />
        </SectionCard>

        {/* Subscription Plan */}
        <div className="bg-[#FFF9F0] border border-[#FFEDD5] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(255,122,0,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none translate-x-4 -translate-y-4">
             <img src="/images/setup_store.jpg" className="w-full h-full object-contain mix-blend-multiply" alt="Store" />
          </div>
          
          <div className="flex items-start gap-4 mb-5 relative z-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <Crown className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[12px] font-bold text-[#64748B] tracking-wide uppercase mb-0.5">Your Plan</div>
              <h3 className="text-[20px] font-black text-[#101B35] leading-tight mb-1">{subscription.plan}</h3>
              <p className="text-[13px] font-bold text-[#FF7A00]">{subscription.daysRemaining} days remaining</p>
              <p className="text-[12px] text-[#64748B] font-medium mt-1">Explore Pro features and grow your business.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-[16px] p-3 flex gap-3 mb-4 shadow-sm border border-[#FFEDD5]/50 relative z-10">
            <div className="flex-1 flex flex-col items-center border-r border-[#F1F5F9] pr-3">
              <Package className="w-4 h-4 text-purple-600 mb-1" />
              <div className="text-[10px] font-bold text-[#64748B] mb-0.5">Products</div>
              <div className="text-[13px] font-black text-[#101B35]">{stats.products} <span className="text-[#94A3B8] font-semibold text-[11px]">/ 500</span></div>
            </div>
            <div className="flex-1 flex flex-col items-center border-r border-[#F1F5F9] px-2">
              <Users className="w-4 h-4 text-blue-500 mb-1" />
              <div className="text-[10px] font-bold text-[#64748B] mb-0.5">Customers</div>
              <div className="text-[13px] font-black text-[#101B35]">{stats.customers} <span className="text-[#94A3B8] font-semibold text-[11px]">/ 1,000</span></div>
            </div>
            <div className="flex-1 flex flex-col items-center pl-3">
              <FileText className="w-4 h-4 text-green-600 mb-1" />
              <div className="text-[10px] font-bold text-[#64748B] mb-0.5">Invoices</div>
              <div className="text-[13px] font-black text-[#101B35]">42 <span className="text-[#94A3B8] font-semibold text-[11px]">/ 1,000</span></div>
            </div>
          </div>
          
          <button className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6B00] hover:to-[#E64500] text-white font-bold text-[15px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,122,0,0.25)] transition-all active:scale-[0.98] relative z-10">
            <Crown className="w-4 h-4" /> Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Security Section */}
        <h3 className="text-[15px] font-bold text-[#101B35] pl-2 mb-[-12px]">Security</h3>
        <SectionCard>
          <SettingsRow 
            icon={Shield} color="text-green-600" bg="bg-green-50"
            title="Security" subtitle="Change password, devices, 2FA"
            onClick={() => setActiveView('security')}
          />
        </SectionCard>
        
        {/* Help & Support */}
        <h3 className="text-[15px] font-bold text-[#101B35] pl-2 mb-[-12px]">Support & More</h3>
        <SectionCard>
          <SettingsRow 
            icon={HelpCircle} color="text-orange-500" bg="bg-orange-50"
            title="Help & Support" subtitle="Contact support, help center"
            onClick={() => openComingSoon('Help & Support')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={AlertCircle} color="text-blue-500" bg="bg-blue-50"
            title="About RetailOS" subtitle="App version, rate us, privacy policy"
            onClick={() => openComingSoon('About')}
          />
        </SectionCard>

        {/* Data & Export */}
        <SectionCard>
          <SettingsRow 
            icon={Download} color="text-[#64748B]" bg="bg-slate-100"
            title="Export My Data" subtitle="Download all your store data"
            onClick={exportData}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={Trash2} color="text-red-500" bg="bg-red-50"
            title="Clear All Data" subtitle="Wipe data from this device"
            danger
            onClick={() => setIsClearDataOpen(true)}
          />
        </SectionCard>

        {/* Logout */}
        <div 
          onClick={() => setIsLogoutOpen(true)}
          className="flex items-center justify-center gap-2 py-4 mt-4 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="text-[16px] font-bold text-red-500">Log out of RetailOS</span>
        </div>
        
      </div>
    </motion.div>
  );

  const renderProfileView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-[#FAFAFA] z-50 flex flex-col h-full overflow-hidden"
    >
      <div className="bg-white border-b border-[#E8ECF2] px-4 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('main')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#101B35]" />
          </button>
          <h2 className="text-[18px] font-black text-[#101B35]">Store Profile</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar space-y-6 pb-[100px]">
        
        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
          <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-2">Basic Info</h3>
          
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Store Name</label>
            <input 
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400"
              value={profile.storeName}
              onChange={e => setProfile({...profile, storeName: e.target.value})}
              placeholder="e.g. Shree Ram Stores"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Owner Name</label>
            <input 
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400"
              value={profile.ownerName}
              onChange={e => setProfile({...profile, ownerName: e.target.value})}
              placeholder="e.g. Rajesh Kumar"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Phone Number</label>
            <input 
              type="tel"
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400"
              value={profile.phone}
              onChange={e => setProfile({...profile, phone: e.target.value})}
              placeholder="98765 43210"
            />
          </div>
          
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Store Type</label>
            <div className="relative">
              <select 
                className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors appearance-none"
                value={profile.storeType}
                onChange={e => setProfile({...profile, storeType: e.target.value})}
              >
                <option value="">Select type...</option>
                {storeTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
              <LucideIcons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
          <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-2">Location & Tax</h3>
          
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">City</label>
            <input 
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400"
              value={profile.city}
              onChange={e => setProfile({...profile, city: e.target.value})}
              placeholder="e.g. Bengaluru, Karnataka"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Full Address <span className="font-medium text-slate-400">(Optional)</span></label>
            <textarea 
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400 min-h-[80px] resize-none"
              value={profile.address}
              onChange={e => setProfile({...profile, address: e.target.value})}
              placeholder="Door No, Street, Landmark..."
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">GST Number <span className="font-medium text-slate-400">(Optional)</span></label>
            <input 
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400 uppercase"
              value={profile.gstNumber}
              onChange={e => setProfile({...profile, gstNumber: e.target.value.toUpperCase()})}
              placeholder="29ABCDE1234F1Z5"
            />
          </div>
        </div>
        
        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
          <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-2">Payments</h3>
          
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">UPI ID <span className="font-medium text-slate-400">(Optional)</span></label>
            <input 
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors placeholder:font-normal placeholder:text-slate-400"
              value={profile.upiId}
              onChange={e => setProfile({...profile, upiId: e.target.value})}
              placeholder="storename@bank"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-3 block">UPI QR Code (Shown on Bills)</label>
            {upiQrCode ? (
              <div className="flex flex-col items-center gap-3 bg-[#FAFAFA] border border-[#E8ECF2] rounded-[16px] p-4">
                <div className="w-40 h-40 border border-[#E8ECF2] rounded-xl overflow-hidden bg-white shadow-sm p-2">
                  <img src={upiQrCode} alt="UPI QR" className="w-full h-full object-contain" />
                </div>
                <button onClick={handleRemoveQr} className="text-[13px] font-bold text-red-500 py-2 px-4 hover:bg-red-50 rounded-full transition-colors">
                  Remove QR Code
                </button>
              </div>
            ) : (
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleQrUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full border-2 border-dashed border-[#E8ECF2] bg-[#FAFAFA] rounded-[16px] p-8 flex flex-col items-center justify-center text-center transition-colors hover:border-[#FF7A00] hover:bg-orange-50/30">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 text-[#FF7A00]" />
                  </div>
                  <span className="text-[14px] font-bold text-[#101B35] mb-1">Upload QR Code</span>
                  <span className="text-[12px] font-medium text-[#64748B]">Tap to select from gallery</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-[#E8ECF2] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
        <button 
          onClick={handleProfileSave}
          className="w-full h-[56px] bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] hover:from-[#FF6B00] hover:to-[#E64500] text-white font-bold text-[16px] rounded-[16px] shadow-[0_4px_14px_rgba(255,122,0,0.25)] transition-all active:scale-[0.98]"
        >
          Save Changes
        </button>
      </div>
    </motion.div>
  );

  const renderSecurityView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-[#FAFAFA] z-50 flex flex-col h-full overflow-hidden"
    >
      <div className="bg-white border-b border-[#E8ECF2] px-4 py-4 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveView('main')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#101B35]" />
          </button>
          <h2 className="text-[18px] font-black text-[#101B35]">Security</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar space-y-6">
        
        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#101B35] leading-tight mb-0.5">Password</h3>
              <p className="text-[12px] font-medium text-[#64748B]">Update your account password</p>
            </div>
          </div>
          
          {hasPassword && (
            <div>
              <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 pr-12 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors"
                  value={passwordForm.current}
                  onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                />
                <button 
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] p-1"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">New Password</label>
            <div className="relative">
              <input 
                type={showNewPassword ? "text" : "password"}
                className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 pr-12 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors"
                value={passwordForm.new}
                onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
              />
              <button 
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] p-1"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-[13px] font-bold text-[#64748B] mb-1.5 block">Confirm New Password</label>
            <input 
              type={showNewPassword ? "text" : "password"}
              className="w-full bg-[#FAFAFA] border border-[#E8ECF2] rounded-[14px] px-4 py-3 text-[15px] font-bold text-[#101B35] outline-none focus:border-[#FF7A00] focus:bg-white transition-colors"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
            />
          </div>
          
          <button 
            className="w-full bg-[#101B35] hover:bg-slate-800 text-white font-bold text-[15px] py-3.5 rounded-[14px] transition-all active:scale-[0.98] mt-2" 
            onClick={handlePasswordSave}
          >
            {hasPassword ? 'Update Password' : 'Set Password'}
          </button>
        </div>

        <SectionCard>
          <SettingsRow 
            icon={LucideIcons.Smartphone} color="text-blue-500" bg="bg-blue-50"
            title="Devices & Sessions" subtitle="Manage logged-in devices"
            onClick={() => openComingSoon('Devices & Sessions')}
          />
          <div className="h-[1px] bg-[#F1F5F9] mx-4" />
          <SettingsRow 
            icon={LucideIcons.Key} color="text-purple-600" bg="bg-purple-50"
            title="Two-Factor Authentication" subtitle="Add an extra layer of security"
            onClick={() => openComingSoon('Two-Factor Auth')}
          />
        </SectionCard>

      </div>
    </motion.div>
  );

  const renderComingSoon = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 bg-[#FAFAFA] z-50 flex flex-col h-full overflow-hidden items-center justify-center px-6"
    >
      <div className="absolute top-4 left-4">
        <button onClick={() => setActiveView('main')} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors bg-white shadow-sm border border-slate-100">
          <ChevronLeft className="w-6 h-6 text-[#101B35]" />
        </button>
      </div>

      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6 border border-orange-100">
        <LucideIcons.Hammer className="w-10 h-10 text-orange-500" strokeWidth={1.5} />
      </div>
      
      <h2 className="text-[24px] font-black text-[#101B35] mb-2 text-center">{comingSoonTitle}</h2>
      <p className="text-[15px] text-[#64748B] font-medium text-center mb-8 max-w-[280px]">
        We are building something amazing here. This feature will be available in a future update!
      </p>
      
      <button 
        onClick={() => setActiveView('main')}
        className="px-8 py-3.5 bg-white border border-[#E8ECF2] rounded-full font-bold text-[#101B35] shadow-sm hover:bg-slate-50 transition-colors"
      >
        Go Back
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AnimatePresence mode="wait">
        {activeView === 'main' && <div key="main">{renderMainView()}</div>}
        {activeView === 'profile' && <div key="profile">{renderProfileView()}</div>}
        {activeView === 'security' && <div key="security">{renderSecurityView()}</div>}
        {activeView === 'coming_soon' && <div key="coming">{renderComingSoon()}</div>}
      </AnimatePresence>

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
        {isLogoutOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsLogoutOpen(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] p-6 w-full max-w-[340px] shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                <LogOut className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-[20px] font-black text-[#101B35] text-center mb-2">Log out of RetailOS?</h3>
              <p className="text-[14px] text-[#64748B] text-center font-medium mb-6">You can sign in again anytime.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsLogoutOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-[#101B35] font-bold rounded-[14px] text-[15px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-[14px] text-[15px] shadow-[0_4px_14px_rgba(239,68,68,0.25)]"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-[#101B35] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 z-[200] text-[14px] font-bold whitespace-nowrap"
          >
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
\`;

fs.writeFileSync('src/app/(dashboard)/settings/page.tsx', code);
