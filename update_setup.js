const fs = require('fs');
let content = fs.readFileSync('src/app/setup/page.tsx', 'utf8');

// 1. Update the Header
content = content.replace(
  /\{\/\* Header - Hidden on success step \*\/\}[\s\S]*?\{\/\* Progress Bar \*\/\}/,
`{/* Header - Hidden on success step */}
        {step < 4 && (
          <div className="px-6 pt-6 pb-2 flex flex-col gap-6 bg-white z-10">
            <div className="grid grid-cols-3 items-center w-full">
              <div className="flex justify-start">
                <button className="text-slate-500 p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors" onClick={() => step > 1 ? handleBack() : router.back()}>
                  <LucideIcons.ArrowLeft size={24} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0"
                   style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}>
                  <Zap className="w-5 h-5 text-white" fill="white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-extrabold text-2xl text-slate-800 tracking-tight leading-none">Retail<span className="text-[#FF6B00]">OS</span></span>
                  <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase mt-1">Setup Your Store</span>
                </div>
              </div>
              <div className="flex justify-end"></div>
            </div>
            
            {/* Progress Bar */}`
);

// 2. Rewrite Case 2 completely
content = content.replace(
  /case 2:[\s\S]*?case 4:/,
`case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full absolute inset-0 pb-[88px]"
          >
            <div className="overflow-y-auto px-6 pt-4 pb-6 flex-1 custom-scrollbar w-full">
              
              <div className="flex items-start justify-between mb-8 relative">
                <div className="flex-1 pt-2 z-10">
                  <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight leading-[1.1]">
                    Let's set up<br/>your <span className="text-[#FF6B00]">store</span> <Sparkles className="inline w-7 h-7 text-amber-400" />
                  </h1>
                  <p className="text-slate-500 text-[14px] font-medium mt-1">Tell us a little about your business.</p>
                </div>
                <div className="w-40 h-40 shrink-0 absolute right-[-10px] top-[-20px] z-0">
                   <img src="/images/setup_store.jpg" alt="Store setup" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
              
              <div className="space-y-4 relative z-10 mt-10">
                <h3 className="text-[12px] font-bold text-slate-500 tracking-wider uppercase mb-2">Basic Information</h3>
                
                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-4">
                  <Store className="w-7 h-7 text-[#FF6B00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5">Store Name <span className="text-[#FF6B00]">*</span></label>
                    <input type="text" value={storeDetails.storeName} onChange={e => setStoreDetails({...storeDetails, storeName: e.target.value})} placeholder="e.g. Shree Ram Stores" className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[15px] p-0 placeholder:text-slate-300" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-4">
                  <LucideIcons.User className="w-7 h-7 text-[#FF6B00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5">Owner Name <span className="text-[#FF6B00]">*</span></label>
                    <input type="text" value={storeDetails.ownerName} onChange={e => setStoreDetails({...storeDetails, ownerName: e.target.value})} placeholder="e.g. Rajesh Kumar" className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[15px] p-0 placeholder:text-slate-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-start gap-3">
                    <Phone className="w-6 h-6 text-[#FF6B00] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1 overflow-hidden">
                      <label className="block text-[12px] font-bold text-slate-500 mb-0.5 whitespace-nowrap">Phone Number <span className="text-[#FF6B00]">*</span></label>
                      <input type="tel" value={storeDetails.phone} onChange={handlePhoneChange} placeholder="98765 43210" maxLength={10} className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[15px] p-0 placeholder:text-slate-300" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-start gap-3 relative">
                    <LucideIcons.MessageCircle className="w-6 h-6 text-[#10B981] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <label className="block text-[12px] font-bold text-slate-500 mb-0.5 whitespace-nowrap">WhatsApp Number</label>
                      <input type="tel" value={storeDetails.whatsapp} onChange={e => setStoreDetails({...storeDetails, whatsapp: e.target.value})} disabled={sameAsPhone} placeholder="98765 43210" maxLength={10} className={\`w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[15px] p-0 mb-2 placeholder:text-slate-300 \${sameAsPhone ? 'opacity-50' : ''}\`} />
                      <label className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium cursor-pointer">
                        <div className={\`w-4 h-4 rounded border flex items-center justify-center \${sameAsPhone ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-slate-300'}\`}>
                          {sameAsPhone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="sr-only" />
                        Same as phone
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center gap-4">
                  <MapPin className="w-7 h-7 text-[#FF6B00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-slate-500 mb-0.5">City <span className="text-[#FF6B00]">*</span></label>
                    <input type="text" value={storeDetails.city} onChange={e => setStoreDetails({...storeDetails, city: e.target.value})} placeholder="e.g. Bengaluru, Karnataka" className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-[15px] p-0 placeholder:text-slate-300" />
                  </div>
                  <LucideIcons.ChevronDown className="w-5 h-5 text-slate-400" />
                </div>

                <div className="bg-white border border-slate-200 rounded-[20px] p-4 flex items-center justify-between cursor-pointer">
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-900">More business details <span className="text-slate-400 font-medium text-[14px]">(Optional)</span></h4>
                    <p className="text-[12px] text-slate-400 font-medium mt-0.5">GST, UPI ID, Full Address, Pincode...</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>
                
                {/* Your Store Preview */}
                <div className="bg-[#FFF8F3] border border-[#FFE4D6] rounded-[24px] p-5 mt-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[15px] font-bold text-slate-800">Your Store Preview</h4>
                    <div className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                      <span className="text-[11px] font-bold tracking-wider uppercase">LIVE</span>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 p-1">
                      {selectedType?.image ? (
                         <img src={selectedType.image} alt="Store type" className="w-full h-full object-cover scale-110" />
                       ) : (
                         <Store className="w-8 h-8 text-slate-400" />
                       )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-slate-900 leading-tight mb-1">{storeDetails.storeName || 'Shree Ram Stores'}</h3>
                      <p className="text-slate-500 font-semibold text-[13px] mb-0.5">{selectedType?.name || 'Grocery / Kirana'}</p>
                      <div className="flex items-center gap-1 text-slate-500 text-[12px] font-medium">
                        <MapPin className="w-3.5 h-3.5" /> {storeDetails.city || 'Bengaluru, Karnataka'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: LucideIcons.Receipt, label: 'Billing', bg: 'bg-[#F3E8FF]', color: 'text-[#9333EA]' },
                      { icon: LucideIcons.Package, label: 'Inventory', bg: 'bg-[#FFEDD5]', color: 'text-[#EA580C]' },
                      { icon: LucideIcons.Users, label: 'Customers', bg: 'bg-[#E0F2FE]', color: 'text-[#0284C7]' },
                      { icon: Sparkles, label: 'AI Assistant', bg: 'bg-[#FDF4FF]', color: 'text-[#C026D3]' },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div className={\`w-12 h-12 rounded-full \${item.bg} flex items-center justify-center\`}>
                          <item.icon className={\`w-5 h-5 \${item.color}\`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100 z-50">
              <button
                onClick={handleComplete}
                disabled={loading || !storeDetails.storeName || !storeDetails.ownerName || !storeDetails.phone}
                className={\`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center transition-all text-[16px] active:scale-[0.98] \${
                  storeDetails.storeName && storeDetails.ownerName && storeDetails.phone && !loading
                    ? 'bg-[#FF6B00] shadow-lg shadow-orange-500/20' 
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                }\`}
              >
                {loading ? 'Saving...' : 'Continue'} {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
              <div className="text-center mt-3 flex items-center justify-center gap-1.5 text-slate-400 text-[11px] font-medium pb-1">
                <LucideIcons.Lock className="w-3.5 h-3.5" /> Your data is safe and secure
              </div>
            </div>
          </motion.div>
        );
        
      case 4:`
);

fs.writeFileSync('src/app/setup/page.tsx', content);
