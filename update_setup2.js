const fs = require('fs');

let content = fs.readFileSync('src/app/setup/page.tsx', 'utf8');

const newCase2 = `case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full absolute inset-0 pb-[88px]"
          >
            <div className="overflow-y-auto px-6 pt-4 pb-6 flex-1 custom-scrollbar w-full">
              
              <div className="flex items-center justify-between mb-8 relative">
                <div className="flex-1 pt-2 z-10 w-[55%]">
                  <h1 className="text-[34px] font-[800] text-[#101B35] mb-2 tracking-tight leading-[1.15]">
                    Let's set up<br/>your <span className="text-[#FF7A00]">store</span> <Sparkles className="inline w-6 h-6 text-amber-400" />
                  </h1>
                  <p className="text-[#64748B] text-[14px] font-medium mt-2">Tell us a little about your business.</p>
                </div>
                <div className="w-[45%] h-40 shrink-0 relative z-0 flex justify-end">
                   <img src="/images/setup_store.jpg" alt="Store setup" className="w-[140%] h-[140%] max-w-none object-contain mix-blend-multiply translate-x-4 -translate-y-4" />
                </div>
              </div>
              
              <div className="space-y-4 relative z-10 mt-6">
                <h3 className="text-[13px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Basic Information</h3>
                
                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                  <Store className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#64748B] mb-0.5">Store Name <span className="text-[#FF7A00]">*</span></label>
                    <input type="text" value={storeDetails.storeName} onChange={e => setStoreDetails({...storeDetails, storeName: e.target.value})} placeholder="e.g. Shree Ram Stores" className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[16px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                  </div>
                </div>

                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                  <LucideIcons.User className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#64748B] mb-0.5">Owner Name <span className="text-[#FF7A00]">*</span></label>
                    <input type="text" value={storeDetails.ownerName} onChange={e => setStoreDetails({...storeDetails, ownerName: e.target.value})} placeholder="e.g. Rajesh Kumar" className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[16px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-start gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                    <Phone className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 overflow-hidden">
                      <label className="block text-[13px] font-medium text-[#64748B] mb-0.5 whitespace-nowrap">Phone Number <span className="text-[#FF7A00]">*</span></label>
                      <input type="tel" value={storeDetails.phone} onChange={handlePhoneChange} placeholder="98765 43210" maxLength={10} className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[15px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                    </div>
                  </div>

                  <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-start gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                    <LucideIcons.MessageCircle className="w-6 h-6 text-[#22C55E] shrink-0" strokeWidth={1.5} />
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <label className="block text-[13px] font-medium text-[#64748B] mb-0.5 whitespace-nowrap">WhatsApp Number</label>
                      <input type="tel" value={storeDetails.whatsapp} onChange={e => setStoreDetails({...storeDetails, whatsapp: e.target.value})} disabled={sameAsPhone} placeholder="98765 43210" maxLength={10} className={\`w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[15px] p-0 mb-3 placeholder:text-slate-300 placeholder:font-normal \${sameAsPhone ? 'opacity-50' : ''}\`} />
                      <label className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium cursor-pointer absolute bottom-3 left-[3.25rem]">
                        <div className={\`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors \${sameAsPhone ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-slate-300'}\`}>
                          {sameAsPhone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="sr-only" />
                        Same as phone
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus-within:border-[#FF7A00] focus-within:shadow-[0_0_0_2px_rgba(255,122,0,0.1)]">
                  <MapPin className="w-6 h-6 text-[#FF7A00] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1">
                    <label className="block text-[14px] font-medium text-[#64748B] mb-0.5">City <span className="text-[#FF7A00]">*</span></label>
                    <input type="text" value={storeDetails.city} onChange={e => setStoreDetails({...storeDetails, city: e.target.value})} placeholder="e.g. Bengaluru, Karnataka" className="w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[16px] p-0 placeholder:text-slate-300 placeholder:font-normal" />
                  </div>
                  <LucideIcons.ChevronDown className="w-5 h-5 text-[#64748B]" />
                </div>

                <div className="bg-white border border-[#E8ECF2] rounded-[16px] p-4 flex items-center justify-between cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#101B35]">More business details <span className="text-[#64748B] font-medium text-[14px]">(Optional)</span></h4>
                    <p className="text-[13px] text-[#64748B] mt-0.5">GST, UPI ID, Full Address, Pincode...</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#64748B]" />
                </div>
                
                {/* Your Store Preview */}
                <div className="bg-[#FFF9F0] border border-[#E8ECF2] rounded-[24px] p-5 mt-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-[15px] font-bold text-[#101B35]">Your Store Preview</h4>
                    <div className="bg-green-50 text-[#22C55E] px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-green-100">
                      <span className="text-[11px] font-bold tracking-wider uppercase">LIVE</span>
                      <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
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
                      <h3 className="text-[18px] font-bold text-[#101B35] leading-tight mb-1">{storeDetails.storeName || 'Shree Ram Stores'}</h3>
                      <p className="text-[#64748B] font-medium text-[13px] mb-1">{selectedType?.name || 'Grocery / Kirana'}</p>
                      <div className="flex items-center gap-1 text-[#64748B] text-[12px] font-medium">
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
                          <item.icon className={\`w-5 h-5 \${item.color}\`} strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-bold text-[#101B35] text-center leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full pt-4 pb-6 px-6 bg-white z-50">
              <button
                onClick={handleComplete}
                disabled={loading || !storeDetails.storeName || !storeDetails.ownerName || !storeDetails.phone || !storeDetails.city}
                className={\`w-full h-[56px] rounded-[16px] font-bold text-white flex items-center justify-center transition-all text-[17px] active:scale-[0.98] \${
                  storeDetails.storeName && storeDetails.ownerName && storeDetails.phone && storeDetails.city && !loading
                    ? 'bg-gradient-to-r from-[#FF7A00] to-[#FF4D00] shadow-[0_4px_14px_rgba(255,122,0,0.25)] hover:from-[#FF6B00] hover:to-[#E64500]' 
                    : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed opacity-70'
                }\`}
              >
                {loading ? 'Saving...' : 'Continue'} {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
              <div className="text-center mt-4 flex items-center justify-center gap-1.5 text-[#64748B] text-[13px] font-medium">
                <LucideIcons.Lock className="w-4 h-4" /> Your data is safe and secure
              </div>
            </div>
          </motion.div>
        );`;

content = content.replace(/case 2:[\s\S]*?case 4:/, newCase2 + '\n\n      case 4:');

fs.writeFileSync('src/app/setup/page.tsx', content);
