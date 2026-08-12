const fs = require('fs');
let content = fs.readFileSync('src/app/setup/page.tsx', 'utf8');

// 1. Add state for accordion
content = content.replace(
  /const \[sameAsPhone, setSameAsPhone\] = useState\(false\);/,
  `const [sameAsPhone, setSameAsPhone] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);`
);

// 2. Fix WhatsApp layout
content = content.replace(
  /WhatsApp Number<\/label>[\s\S]*?Same as phone\s*<\/label>/,
  `WhatsApp Number</label>
                      <input type="tel" value={storeDetails.whatsapp} onChange={e => setStoreDetails({...storeDetails, whatsapp: e.target.value})} disabled={sameAsPhone} placeholder="98765 43210" maxLength={10} className={\`w-full bg-transparent border-none outline-none text-[#101B35] font-bold text-[15px] p-0 mb-2 placeholder:text-slate-300 placeholder:font-normal \${sameAsPhone ? 'opacity-50' : ''}\`} />
                      <label className="flex items-center gap-1.5 text-[12px] text-[#64748B] font-medium cursor-pointer mt-1">
                        <div className={\`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors \${sameAsPhone ? 'bg-[#FF7A00] border-[#FF7A00]' : 'border-slate-300'}\`}>
                          {sameAsPhone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" checked={sameAsPhone} onChange={handleSameAsPhoneChange} className="sr-only" />
                        Same as phone
                      </label>`
);

// 3. Make "More business details" expandable
content = content.replace(
  /<div className="bg-white border border-\[\#E8ECF2\] rounded-\[16px\] p-4 flex items-center justify-between cursor-pointer shadow-\[0_2px_10px_rgba\(0,0,0,0.02\)\]">[\s\S]*?<\/div>/,
  `<div className="bg-white border border-[#E8ECF2] rounded-[16px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setShowMoreDetails(!showMoreDetails)}
                  >
                    <div>
                      <h4 className="text-[14px] font-bold text-[#101B35]">More business details <span className="text-[#64748B] font-medium text-[14px]">(Optional)</span></h4>
                      <p className="text-[13px] text-[#64748B] mt-0.5">GST, UPI ID, Full Address, Pincode...</p>
                    </div>
                    <LucideIcons.ChevronDown className={\`w-5 h-5 text-[#64748B] transition-transform duration-300 \${showMoreDetails ? 'rotate-180' : ''}\`} />
                  </div>
                  
                  <AnimatePresence>
                    {showMoreDetails && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[#E8ECF2] bg-slate-50/50"
                      >
                        <div className="p-4 space-y-4">
                          <div>
                            <label className="block text-[13px] font-medium text-[#64748B] mb-1">GST Number</label>
                            <input type="text" value={storeDetails.gstNumber} onChange={e => setStoreDetails({...storeDetails, gstNumber: e.target.value})} placeholder="e.g. 29ABCDE1234F1Z5" className="w-full bg-white border border-[#E8ECF2] rounded-xl p-3 text-[14px] outline-none focus:border-[#FF7A00]" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#64748B] mb-1">UPI ID</label>
                            <input type="text" value={storeDetails.upiId} onChange={e => setStoreDetails({...storeDetails, upiId: e.target.value})} placeholder="e.g. storename@bank" className="w-full bg-white border border-[#E8ECF2] rounded-xl p-3 text-[14px] outline-none focus:border-[#FF7A00]" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#64748B] mb-1">Full Address</label>
                            <input type="text" value={storeDetails.address} onChange={e => setStoreDetails({...storeDetails, address: e.target.value})} placeholder="e.g. #123, Main Market Road" className="w-full bg-white border border-[#E8ECF2] rounded-xl p-3 text-[14px] outline-none focus:border-[#FF7A00]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>`
);

// 4. Center the "Made for Indian Retailers" in Case 4
content = content.replace(
  /<div className="mt-4 mx-auto w-fit bg-\[\#FFF8F3\] border border-orange-100 rounded-md px-3 py-1\.5 flex items-center gap-1\.5">[\s\S]*?<\/div>/,
  `<div className="mt-4 flex justify-center w-full">
                <div className="bg-[#FFF8F3] border border-orange-100 rounded-md px-3 py-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">Made for Indian Retailers</span>
                </div>
              </div>`
);

fs.writeFileSync('src/app/setup/page.tsx', content);
