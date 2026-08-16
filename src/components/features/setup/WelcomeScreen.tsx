'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  MapPin, 
  Check, 
  Sparkles, 
  Receipt, 
  Package, 
  Users, 
  Bot, 
  Rocket,
  HelpCircle,
  Globe,
  ChevronDown,
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';
import { StoreType } from '@/lib/storeTypes';

interface WelcomeScreenProps {
  storeDetails: {
    storeName: string;
    ownerName: string;
    city: string;
  };
  selectedType: StoreType | null;
  onFinish: () => void;
}

export default function WelcomeScreen({ storeDetails, selectedType, onFinish }: WelcomeScreenProps) {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] w-full flex flex-col font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <header className="w-full bg-white border-b border-[#E8EAF0] px-6 lg:px-12 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9A00] to-[#FF7A00] flex items-center justify-center shadow-sm">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[20px] text-[#14213D] leading-none tracking-tight">
              Retail<span className="text-[#FF7A00]">OS</span>
            </span>
            <span className="text-[#64748B] text-[11px] font-semibold tracking-wide">
              Smart. Simple. Profitable.
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 hidden sm:flex">
          <button className="flex items-center gap-2 text-[#64748B] hover:text-[#14213D] transition-colors text-[14px] font-medium">
            <HelpCircle className="w-4 h-4" /> Need help?
          </button>
          <button className="flex items-center gap-1.5 text-[#14213D] font-medium text-[14px] bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors">
            <Globe className="w-4 h-4 text-[#64748B]" /> English <ChevronDown className="w-4 h-4 text-[#64748B]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[14px] uppercase border border-purple-200">
            {storeDetails.ownerName ? storeDetails.ownerName.substring(0,2) : 'SA'}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-16"
        >
          
          {/* HERO SECTION */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8">
            <motion.div variants={itemVariants} className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h1 className="text-[36px] sm:text-[42px] lg:text-[56px] font-extrabold text-[#14213D] leading-[1.1] tracking-tight mb-4">
                Welcome Onboard!
              </h1>
              <p className="text-[16px] sm:text-[18px] text-[#64748B] font-medium leading-relaxed max-w-[500px]">
                <strong className="text-[#FF7A00] font-bold">Shubh Aarambh!</strong> Your store is all set to grow smarter and faster.
              </p>
              
              {/* Quick Success Metrics */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-10 bg-white border border-[#E8EAF0] p-4 sm:p-5 rounded-[20px] shadow-[0_8px_30px_rgba(15,23,42,0.04)] w-full max-w-[540px]">
                <div className="flex items-center gap-3 flex-1 w-full justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Setup Progress</span>
                    <span className="text-[18px] font-extrabold text-[#22C55E]">100%</span>
                  </div>
                </div>
                
                <div className="w-full h-[1px] sm:w-[1px] sm:h-12 bg-[#E8EAF0] shrink-0 hidden sm:block"></div>
                
                <div className="flex items-center gap-3 flex-1 w-full justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Est. Time Saved</span>
                    <span className="text-[16px] font-extrabold text-[#14213D] whitespace-nowrap"><span className="text-[#FF7A00]">5+</span> hrs/week</span>
                  </div>
                </div>

                <div className="w-full h-[1px] sm:w-[1px] sm:h-12 bg-[#E8EAF0] shrink-0 hidden sm:block"></div>

                <div className="flex items-center gap-3 flex-1 w-full justify-center sm:justify-start">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">Business Ready</span>
                    <span className="text-[16px] font-extrabold text-[#14213D] flex items-center gap-1">Yes <Check className="w-4 h-4 text-[#22C55E]" strokeWidth={3}/></span>
                  </div>
                </div>
              </div>

            </motion.div>
            
            <motion.div variants={itemVariants} className="flex-1 w-full flex justify-center lg:justify-end relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-50 via-orange-50 to-transparent opacity-50 blur-3xl rounded-full -z-10 scale-90"></div>
              <img src="/images/store-3d.jpg" alt="3D Storefront" className="w-full max-w-[400px] lg:max-w-[500px] object-contain drop-shadow-xl" />
            </motion.div>
          </div>

          <div className="w-full h-[1px] bg-[#E8EAF0]/50 my-2"></div>

          {/* STORE IDENTITY & READY SECTION */}
          <div className="flex flex-col lg:flex-row gap-10">
            
            <div className="flex-1 flex flex-col gap-10">
              
              <motion.div variants={itemVariants} className="bg-[#FFFDF8] border border-[#F3E8D6] rounded-[24px] p-6 shadow-[0_10px_40px_rgba(255,122,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden group hover:border-[#FF7A00]/20 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden shrink-0 border border-[#E8EAF0] p-1">
                    {selectedType?.image ? (
                      <img src={selectedType.image} alt="Store type" className="w-full h-full object-cover scale-110" />
                    ) : (
                      <Store className="w-8 h-8 text-[#64748B]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[22px] font-extrabold text-[#14213D] leading-tight">{storeDetails.storeName || 'Shree Ram Stores'}</h3>
                      <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Premium
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748B] text-[14px] font-medium mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {selectedType?.name || 'Clothing / Textiles'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[#64748B] text-[13px] font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {storeDetails.city || 'Dubai'}
                    </div>
                  </div>
                </div>

                <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-[16px] flex items-start gap-3 sm:max-w-[240px]">
                  <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-green-500/20">
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#14213D] leading-tight">Your store is ready to roll!</h4>
                    <p className="text-[12px] text-[#64748B] font-medium mt-1 leading-snug">All essential features are configured.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-6">
                <h2 className="text-[14px] font-bold text-[#64748B] uppercase tracking-[0.1em] flex items-center gap-2 pl-2">
                  Your Store is Ready <Sparkles className="w-4 h-4 text-purple-500" />
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Store, title: 'Store Profile', subtitle: 'Your business profile is complete.', iconBg: 'bg-[#FFF4E5]', iconColor: 'text-[#FF7A00]', hoverBorder: 'hover:border-[#FF7A00]/30' },
                    { icon: Receipt, title: 'Billing & Invoicing', subtitle: 'Create and send invoices in seconds.', iconBg: 'bg-[#F3E8FF]', iconColor: 'text-[#9333EA]', hoverBorder: 'hover:border-[#9333EA]/30' },
                    { icon: Package, title: 'Inventory Management', subtitle: 'Track, manage & optimize your stock.', iconBg: 'bg-[#FFF4E5]', iconColor: 'text-[#FF7A00]', hoverBorder: 'hover:border-[#FF7A00]/30' },
                    { icon: Users, title: 'Customers & Credit', subtitle: 'Manage customers, credit and follow-ups easily.', iconBg: 'bg-[#E0F2FE]', iconColor: 'text-[#0284C7]', hoverBorder: 'hover:border-[#0284C7]/30' }
                  ].map((feat, i) => (
                    <div 
                      key={i} 
                      className={`bg-white border border-[#E8EAF0] rounded-[20px] p-5 flex flex-col justify-center relative group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] ${feat.hoverBorder} min-h-[110px]`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-[14px] ${feat.iconBg} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                          <feat.icon className={`w-6 h-6 ${feat.iconColor}`} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 pr-6">
                          <h4 className="text-[16px] font-bold text-[#14213D] leading-tight mb-1">{feat.title}</h4>
                          <p className="text-[13px] text-[#64748B] font-medium leading-snug">{feat.subtitle}</p>
                        </div>
                      </div>
                      <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center transition-colors group-hover:bg-[#22C55E] group-hover:border-[#22C55E]">
                        <Check className="w-3.5 h-3.5 text-green-500 group-hover:text-white transition-colors" strokeWidth={3} />
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-[#FAF7FF] border border-[#E9D5FF] rounded-[20px] p-5 flex flex-col justify-center relative group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(124,58,237,0.08)] hover:border-[#7C3AED]/30 min-h-[110px]">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-[14px] bg-white border border-[#E9D5FF] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm">
                        <Bot className="w-6 h-6 text-[#7C3AED]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 pr-6">
                        <h4 className="text-[16px] font-bold text-[#14213D] leading-tight mb-1">RetailBot AI Assistant</h4>
                        <p className="text-[13px] text-[#64748B] font-medium leading-snug">Your AI copilot is active and ready to help.</p>
                      </div>
                    </div>
                    <div className="absolute top-5 right-5 w-6 h-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center transition-colors group-hover:bg-[#22C55E] group-hover:border-[#22C55E]">
                      <Check className="w-3.5 h-3.5 text-green-500 group-hover:text-white transition-colors" strokeWidth={3} />
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>
            
            {/* RETAILBOT PROMO & CTA */}
            <motion.div variants={itemVariants} className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
              
              <div className="bg-gradient-to-b from-[#FAF7FF] to-[#FDFBFF] border border-[#E9D5FF] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(124,58,237,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 pointer-events-none opacity-30">
                  <div className="w-32 h-32 bg-[#7C3AED] rounded-full blur-[60px] translate-x-10 -translate-y-10"></div>
                </div>
                
                <div className="flex items-center gap-4 mb-5 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-[#E9D5FF] flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/images/retailbot.jpg" alt="RetailBot" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-extrabold text-[#7C3AED] leading-tight flex items-center gap-1.5 mb-1">
                      RetailBot is here to help you <Sparkles className="w-4 h-4" />
                    </h4>
                    <p className="text-[12px] text-[#64748B] font-medium leading-tight max-w-[200px]">
                      I've set up everything for your store. What would you like to do next?
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2.5 mb-6 relative z-10">
                  {[
                    { icon: TrendingUp, text: "Show me today's summary" },
                    { icon: Sparkles, text: "What should I do now?" },
                    { icon: HelpCircle, text: "Explore insights" }
                  ].map((chip, i) => (
                    <button key={i} className="flex items-center gap-2 bg-white hover:bg-[#F3E8FF] border border-[#E9D5FF] text-[#64748B] hover:text-[#7C3AED] px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold transition-colors text-left w-max shadow-sm">
                      <chip.icon className="w-4 h-4" /> {chip.text}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-end relative z-10">
                  <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-[13px] px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all active:scale-95">
                    Ask RetailBot <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col mt-4">
                <button
                  onClick={onFinish}
                  className="w-full bg-gradient-to-r from-[#FF7A00] to-[#FF9A00] hover:from-[#E66E00] hover:to-[#E68A00] text-white font-bold text-[18px] py-4 rounded-[16px] shadow-[0_8px_20px_rgba(255,122,0,0.25)] flex items-center justify-center transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                >
                  Launch Dashboard <Rocket className="ml-2 w-5 h-5" fill="currentColor" />
                </button>
                
                <div className="flex justify-center gap-6 mt-5 opacity-70">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] tracking-wide uppercase">
                    <Check className="w-3.5 h-3.5 text-[#FF7A00]" strokeWidth={3} /> Secure & Reliable
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] tracking-wide uppercase">
                    <Store className="w-3.5 h-3.5 text-[#FF7A00]" strokeWidth={2} /> Made for Indian Retailers
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] tracking-wide uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" strokeWidth={2.5} /> Backed by AI
                  </div>
                </div>

                <div className="text-center mt-8">
                  <button onClick={onFinish} className="text-[#7C3AED] font-bold text-[14px] hover:underline flex items-center justify-center gap-1 mx-auto">
                    Explore all features <span className="text-[16px]">→</span>
                  </button>
                </div>
              </div>
              
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
