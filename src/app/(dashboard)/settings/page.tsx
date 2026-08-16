'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Store, User, Shield, HelpCircle, Eye, EyeOff, Check, 
  Phone, MapPin, Edit2, Download, Trash2, MessageCircle, 
  ExternalLink, ChevronRight, Package, Users, DollarSign, Crown,
  Bell, ChevronLeft, Wallet, Box, Bot, ShieldCheck, FileText,
  AlertCircle, LogOut, ArrowRight
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { getStoreTypeList } from '@/lib/storeTypes';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  SettingsHeader, 
  StoreSummary, 
  SettingsSection, 
  SettingsCard, 
  PlanCard 
} from '@/components/features/settings';
import { SecurityCenter } from '@/components/features/settings/SecurityCenter';

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
      className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${danger ? 'hover:bg-red-50' : 'hover:bg-slate-50'}`}
    >
      <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 text-red-500' : bg}`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : color}`} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-[15px] font-bold leading-tight mb-0.5 ${danger ? 'text-red-600' : 'text-[#101B35]'}`}>{title}</h4>
        {subtitle && <p className="text-[13px] text-[#64748B] font-medium truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge.style === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
            {badge.text}
          </span>
        )}
        {!danger && <ChevronRight className="w-5 h-5 text-slate-300" />}
      </div>
    </div>
  );

  const SectionCard = ({ children, className = '' }: any) => (
    <div className={`bg-white border border-[#E8ECF2] rounded-[24px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${className}`}>
      {children}
    </div>
  );

  // Views
  
  const renderMainView = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="pb-[100px] min-h-screen bg-[#FAFAF8]"
    >
      <SettingsHeader ownerName={profile.ownerName} />

      <div className="px-4 flex flex-col">
        <StoreSummary 
          productsCount={stats.products}
          customersCount={stats.customers}
          salesTotal={stats.sales}
        />

        <SettingsSection title="Store">
          <SettingsCard
            icon={Store}
            iconBgColor="bg-[#FFF4E5]"
            iconColor="text-[#FF8A00]"
            title="Store Profile"
            subtitle="Store details, address, GST, UPI & more"
            badge={{ text: 'Updated', style: 'orange' }}
            onClick={() => setActiveView('profile')}
          />
        </SettingsSection>

        <SettingsSection title="Operations">
          <SettingsCard
            icon={Wallet}
            iconBgColor="bg-[#ECFDF3]"
            iconColor="text-[#027A48]"
            title="Billing & Payments"
            subtitle="Invoices, taxes, UPI & payment methods"
            onClick={() => openComingSoon('Billing & Payments')}
          />
          <SettingsCard
            icon={Box}
            iconBgColor="bg-[#FFF4E5]"
            iconColor="text-[#FF8A00]"
            title="Inventory"
            subtitle="Stock alerts, units, barcodes & expiry"
            onClick={() => openComingSoon('Inventory')}
          />
        </SettingsSection>

        <SettingsSection title="Customers">
          <SettingsCard
            icon={Users}
            iconBgColor="bg-[#E0F2FE]"
            iconColor="text-[#0284C7]"
            title="Customers"
            subtitle="Credit, loyalty points & messaging"
            onClick={() => openComingSoon('Customers')}
          />
        </SettingsSection>

        <SettingsSection title="Access">
          <SettingsCard
            icon={ShieldCheck}
            iconBgColor="bg-[#F3F0FF]"
            iconColor="text-[#6941C6]"
            title="Team & Permissions"
            subtitle="Manage team, roles & access"
            badge={{ text: '1 Member', style: 'purple' }}
            onClick={() => openComingSoon('Team & Permissions')}
          />
        </SettingsSection>

        <SettingsSection title="Intelligence">
          <SettingsCard
            icon={Bot}
            iconBgColor="bg-[#FDF4FF]"
            iconColor="text-[#C026D3]"
            title="RetailBot AI"
            subtitle="AI assistant, insights & recommendations"
            onClick={() => openComingSoon('RetailBot AI')}
          />
        </SettingsSection>

        <SettingsSection title="Plan">
          <PlanCard
            plan={subscription.plan}
            daysRemaining={subscription.daysRemaining}
            productsCount={stats.products}
            customersCount={stats.customers}
            salesCount={42}
          />
        </SettingsSection>

        <SettingsSection title="Security">
          <SettingsCard
            icon={Shield}
            iconBgColor="bg-[#ECFDF3]"
            iconColor="text-[#027A48]"
            title="Security"
            subtitle="Change password, devices & 2FA"
            onClick={() => setActiveView('security')}
          />
        </SettingsSection>

        <SettingsSection title="Support & Data">
          <SettingsCard
            icon={HelpCircle}
            iconBgColor="bg-[#FFF4E5]"
            iconColor="text-[#FF8A00]"
            title="Help & Support"
            subtitle="Contact support, help center"
            onClick={() => openComingSoon('Help & Support')}
          />
          <SettingsCard
            icon={AlertCircle}
            iconBgColor="bg-[#E0F2FE]"
            iconColor="text-[#0284C7]"
            title="About RetailOS"
            subtitle="App version, rate us, privacy policy"
            onClick={() => openComingSoon('About')}
          />
          <SettingsCard
            icon={Download}
            iconBgColor="bg-[#F1F5F9]"
            iconColor="text-[#64748B]"
            title="Export My Data"
            subtitle="Download all your store data"
            onClick={exportData}
          />
          <SettingsCard
            icon={Trash2}
            iconBgColor="bg-red-50"
            iconColor="text-red-500"
            title="Clear All Data"
            subtitle="Wipe data from this device"
            danger
            onClick={() => setIsClearDataOpen(true)}
          />
        </SettingsSection>

        <div 
          onClick={() => setIsLogoutOpen(true)}
          className="flex items-center justify-center gap-2 py-4 mt-2 mb-8 cursor-pointer active:scale-95 transition-transform"
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

      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar flex flex-col gap-6 pb-[100px]">
        
        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-5">
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

        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-5">
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
        
        <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-5">
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

      <div className="absolute bottom-[60px] left-0 w-full p-4 bg-white border-t border-[#E8ECF2] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
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
          <h2 className="text-[18px] font-black text-[#101B35]">Security Center</h2>
        </div>
      </div>

      <SecurityCenter />
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
    <div className="min-h-screen bg-[#FAFAF8] w-full">
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
