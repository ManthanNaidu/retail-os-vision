'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, Sparkles, TrendingUp, Package, CreditCard,
  Target, AlertTriangle, ArrowRight, CheckCircle2, Lightbulb,
  Mic, Send, BarChart3, Users, PieChart, Calendar, Menu as MenuIcon,
  RefreshCw, ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';
import { Product, Customer, Sale } from '@/types';
import { AnalyticsEngine } from '@/lib/services/analyticsEngine';

// --- Logic ---
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

function findLocalResponse(query: string, products: Product[], sales: Sale[], customers: Customer[]): string {
  const q = query.toLowerCase();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = AnalyticsEngine.filterSalesByDate(sales, today, new Date());
  const metrics = AnalyticsEngine.calculateMetrics(todaySales, products);
  const todayRevenue = metrics.totalRevenue;
  const todayProfit = metrics.totalProfit;
  
  const lowStock = products.filter(p => p.stock > 0 && p.stock < (p.minStock || 5));
  const outOfStock = products.filter(p => p.stock === 0);
  const expiring = products.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 30 && getDaysUntilExpiry(p.expiryDate) > 0);
  
  const pendingCreditCustomers = customers.filter(c => c.creditBalance > 0);
  const totalCredit = pendingCreditCustomers.reduce((s, c) => s + c.creditBalance, 0);
  
  if (q.includes('sale') || q.includes('today') || q.includes('aaj')) {
    return `Today's sales: **₹${todayRevenue}** across ${todaySales.length} orders.\nKeep it up!`;
  }
  if (q.includes('profit') || q.includes('munafa')) {
    return `Today's estimated profit: **₹${todayProfit}**.\nFocus on high margin items to boost this further!`;
  }
  if (q.includes('stock') || q.includes('inventory') || q.includes('low') || q.includes('restock')) {
    if (lowStock.length === 0 && outOfStock.length === 0) return "**Great news!** All your products are well stocked.";
    let res = `**Stock Alert:**\n`;
    if (outOfStock.length > 0) res += `Out of stock: ${outOfStock.slice(0,3).map(p => p.name).join(', ')}\n`;
    if (lowStock.length > 0) res += `Running low: ${lowStock.slice(0,3).map(p => `${p.name} (${p.stock} left)`).join(', ')}\n`;
    return res + `\nShall I prepare a reorder list?`;
  }
  if (q.includes('expir') || q.includes('khatam')) {
    if (expiring.length === 0) return "You have no products expiring in the next 30 days.";
    return `**Expiring soon:**\n` + expiring.slice(0,3).map(p => `• ${p.name} — ${getDaysUntilExpiry(p.expiryDate as string)} days`).join('\n') + `\n\nTip: Consider giving a discount on these to clear stock.`;
  }
  if (q.includes('payment') || q.includes('pending') || q.includes('credit') || q.includes('baki') || q.includes('customer')) {
    if (pendingCreditCustomers.length === 0) return "You have no pending payments. Great cash flow!";
    return `**Pending payments:**\n` + pendingCreditCustomers.slice(0,3).map(c => `• ${c.name} — ₹${c.creditBalance}`).join('\n') + `\n\n**Total: ₹${totalCredit}** — Should I send WhatsApp reminders?`;
  }
  
  return `Based on your store data, I can see **${lowStock.length + outOfStock.length} low-stock items** and **₹${totalCredit}** in pending credit.\n\nAsk me anything specific about sales, stock, customers, or profits!`;
}

async function callGemini(messages: AIMessage[], systemContext: string): Promise<string> {
  if (!GEMINI_API_KEY) return '';
  const conversation = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemContext }] },
      contents: conversation,
      generationConfig: { temperature: 0.75, maxOutputTokens: 2000 },
    }),
  });
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// --- Components ---
function BotCharacter({ isTyping }: { isTyping: boolean }) {
  return (
    <motion.div 
      className="relative flex items-center justify-center mx-auto mb-2"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div 
        className="absolute inset-0 rounded-full blur-2xl z-0"
        style={{ background: '#7C3AED', opacity: 0.15 }}
        animate={{ scale: isTyping ? [1, 1.2, 1] : 1, opacity: isTyping ? [0.15, 0.3, 0.15] : 0.15 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.img 
        src="/images/retailbot.jpg"
        alt="RetailBot AI"
        className="relative z-10 w-20 h-20 object-cover rounded-full shadow-lg border-2 border-white mix-blend-multiply"
        animate={isTyping ? { scale: [1, 1.05, 1], rotate: [-3, 3, -3] } : { rotate: [-1, 1, -1] }}
        transition={{ duration: isTyping ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-[#7C3AED]"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

function MessageBubble({ msg, initial }: { msg: AIMessage, initial: string }) {
  const parts = msg.content.split(/(\*\*[^*]+\*\*)/g);
  const isUser = msg.role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 16, scale: 0.95 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex flex-col gap-1 w-full max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'} mb-4`}
    >
      <div className={`flex items-end gap-2 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm border-2 ${isUser ? 'bg-[#FF6B00] text-white border-white' : 'bg-[#F3E8FF] border-white'}`}>
          {isUser ? initial : <Sparkles size={14} className="text-[#7C3AED]" />}
        </div>
        
        <div className={`px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed whitespace-pre-line shadow-sm border ${isUser ? 'rounded-br-sm bg-gradient-to-br from-[#FF6B00] to-orange-500 text-white border-[#FF6B00]/50' : 'rounded-bl-sm bg-white text-slate-800 border-[#E9D5FF]'}`}>
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={i} className={isUser ? 'text-orange-100 font-bold' : 'text-[#7C3AED] font-bold'}>{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>
          )}
        </div>
      </div>
      
      {msg.timestamp && (
        <p className={`text-[10px] font-medium text-slate-400 px-10 ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </motion.div>
  );
}

export default function AIAssistantPage() {
  const { user } = useAuth();
  const { products, customers, sales, toggleSidebar, notifications } = useAppStore();
  
  const [ownerName, setOwnerName] = useState('BV');
  const [storeName, setStoreName] = useState('My Store');
  const [initial, setInitial] = useState('U');
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [usingGemini, setUsingGemini] = useState(!!GEMINI_API_KEY);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      }
    }
  }, []);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  const sectionNotifications = notifications.filter(n => !n.section || n.section === '/ai-assistant');
  const unreadCount = sectionNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    let currentOwnerName = user?.displayName ? user.displayName.split(' ')[0] : 'BV';
    let currentInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');
    let currentStoreName = 'My Store';

    if (typeof window !== 'undefined') {
        try {
            const profile = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
            if (profile.ownerName) {
                currentOwnerName = profile.ownerName.split(' ')[0];
                currentInitial = currentOwnerName.charAt(0).toUpperCase();
            }
            if (profile.storeName) {
                currentStoreName = profile.storeName;
            }
        } catch (e) {}
    }
    setOwnerName(currentOwnerName);
    setInitial(currentInitial);
    setStoreName(currentStoreName);
  }, [user]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = AnalyticsEngine.filterSalesByDate(sales, today, new Date());
    const metrics = AnalyticsEngine.calculateMetrics(todaySales, products);
    
    const todaySalesTotal = sales.length > 0 ? metrics.totalRevenue : 697;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < (p.minStock || 5)).length || 1;
    const pendingCredit = customers.reduce((sum, c) => sum + c.creditBalance, 0) || 0;
    
    return { todaySales: todaySalesTotal, lowStockCount, pendingCredit };
  }, [sales, products, customers]);

  const storeContext = useMemo(() => {
    return `You are RetailOS AI — a smart, friendly business assistant for Indian retail stores.
Store: ${storeName}.
LIVE DATA:
- Today's sales: ₹${stats.todaySales}
- Total products: ${products.length} | Low stock: ${stats.lowStockCount} items
- Customers: ${customers.length} | Credit outstanding: ₹${stats.pendingCredit}
Rules: You are an expert retail business advisor. Respond in clear, professional English or Hindi. Never use emojis. Use ₹ for currency. Use ** for bold text. Keep it concise.`;
  }, [products, customers, stats, storeName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: AIMessage = { role: 'user', content: text, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    try {
      let response = '';
      if (GEMINI_API_KEY) {
        try {
          response = await callGemini(newMessages, storeContext);
          setUsingGemini(true);
        } catch { setUsingGemini(false); }
      }
      if (!response) {
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        response = findLocalResponse(text, products, sales, customers);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, my circuits got crossed! Please try asking again.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const hasChat = messages.length > 0;

  return (
    <div className="flex flex-col min-h-full bg-white relative pb-[100px]">
      
      {/* Top Navigation */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 bg-[#f96c03] z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="p-1 -ml-1 text-white lg:hidden">
            <MenuIcon size={26} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col">
            <div className="text-white font-black text-xl tracking-tight leading-none flex items-center gap-1">
              Retail<span className="text-white/90">OS</span>
            </div>
            <span className="text-white/80 text-[11px] font-semibold tracking-wide mt-1">AI Business Copilot</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasChat && (
            <button onClick={clearChat} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <RefreshCw size={12} /> Reset
            </button>
          )}
          <button className="relative p-1 text-white">
            <Bell size={24} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-white text-[#f96c03] text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_0_2px_#f96c03]">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#f96c03] font-bold text-sm shadow-sm">
            {initial}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!hasChat ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-5 pt-4 flex-1">
            {/* Banner Section */}
            <div className="bg-white border border-[#E9D5FF]/50 rounded-[24px] p-5 relative overflow-hidden mb-8 shadow-[0_8px_30px_rgba(124,58,237,0.04)]">
              {/* Subtle wave background */}
              <div className="absolute right-0 bottom-0 top-0 w-2/3 bg-gradient-to-l from-[#F3E8FF]/60 to-transparent z-0 rounded-[24px]" style={{ clipPath: 'ellipse(100% 100% at 100% 100%)' }}></div>
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-full border border-[#E9D5FF] shadow-sm relative overflow-hidden bg-white shrink-0 p-1">
                    <img src="/images/retailbot.jpg" alt="Avatar" className="w-full h-full object-cover rounded-full mix-blend-multiply" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-slate-900 tracking-tight">RetailBot</h1>
                      <Sparkles size={16} className="text-[#9333EA]" />
                    </div>
                    <p className="text-slate-500 text-[13px] font-medium">Your smart business copilot</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                      <span className="text-[12px] font-bold text-green-600">Online</span>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => setInput('What can you do?')} className="bg-[#F3E8FF] text-[#7C3AED] px-4 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2 hover:bg-[#E9D5FF] transition-colors whitespace-nowrap shadow-sm">
                  Ask RetailBot <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Today at a glance */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-slate-800">Today at a glance</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold shadow-sm">
                  <Calendar size={14} /> 12 May, 2025 <ChevronDown size={14} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-slate-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <TrendingUp size={20} className="text-green-500" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700">Today's Sales</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.todaySales)}</div>
                  <div className="flex items-center gap-1 mt-1 text-[12px]">
                    <span className="text-green-600 font-bold">↑ 12%</span>
                    <span className="text-slate-400 font-medium">vs yesterday</span>
                  </div>
                  <svg className="absolute bottom-4 right-4 w-16 h-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0,40 L20,30 L40,35 L60,15 L80,20 L100,0" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="100" cy="0" r="4" fill="#22c55e" />
                  </svg>
                </div>

                <div className="bg-white border border-slate-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Package size={20} className="text-[#FF6B00]" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700">Low Stock</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.lowStockCount}</div>
                  <div className="text-[12px] text-slate-500 font-medium mt-1">Product{stats.lowStockCount !== 1 ? 's' : ''}</div>
                  <div className="absolute bottom-4 right-4 text-orange-400">
                    <AlertTriangle size={20} strokeWidth={2.5} />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] flex items-center justify-center">
                      <CreditCard size={20} className="text-[#7C3AED]" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700">Pending Credit</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.pendingCredit)}</div>
                  <div className="text-[12px] text-slate-500 font-medium mt-1">
                    {stats.pendingCredit === 0 ? 'No pending dues' : 'Needs attention'}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-[#F3E8FF] rounded-full p-1 text-[#7C3AED]">
                    <CheckCircle2 size={16} strokeWidth={3} />
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Target size={20} className="text-blue-500" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700">Target Progress</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">35%</div>
                  <div className="text-[12px] text-slate-500 font-medium mt-1">of ₹20,000</div>
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[17px] font-semibold text-slate-800">AI Insights</h3>
                <button className="text-[#7C3AED] text-xs font-bold hover:underline">View all</button>
              </div>
              
              <div className="flex flex-col gap-3">
                <button onClick={() => sendMessage('Analyze my sales today')} className="w-full text-left bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <TrendingUp size={22} className="text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-slate-800">Sales are improving! 🚀</h4>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">Your sales are 12% higher than yesterday.</p>
                  </div>
                  <div className="text-green-500 opacity-60">
                    <ArrowRight size={18} />
                  </div>
                </button>

                <button onClick={() => sendMessage('What should I restock?')} className="w-full text-left bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={22} className="text-[#FF6B00]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-slate-800">Stock needs attention</h4>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">Sunflower Oil 1L is running low. Current stock: 2 units</p>
                  </div>
                  <div className="text-[#FF6B00] opacity-60">
                    <ArrowRight size={18} />
                  </div>
                </button>

                <button onClick={() => sendMessage('Which category is selling best?')} className="w-full text-left bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-full bg-[#F3E8FF] flex items-center justify-center shrink-0">
                    <Lightbulb size={22} className="text-[#9333EA]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-bold text-slate-800">Top performing category</h4>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">Grocery is your top selling category today.</p>
                  </div>
                  <div className="text-[#9333EA] opacity-60">
                    <ArrowRight size={18} />
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 relative z-10 flex flex-col" style={{ overscrollBehavior: 'contain' }}>
            <AnimatePresence>
              {messages.map((msg, i) => <MessageBubble key={i} msg={msg} initial={initial} />)}
            </AnimatePresence>

            <AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="self-start mt-2">
                  <BotCharacter isTyping={true} />
                  <div className="ml-4 mt-2 rounded-2xl rounded-tl-sm border bg-white border-[#E9D5FF] shadow-sm inline-block">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Floating Input */}
      <div className="fixed bottom-[72px] lg:bottom-4 left-0 lg:left-[300px] right-0 px-4 pb-2 z-50">
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="max-w-3xl mx-auto bg-[#F8FAFC] rounded-2xl shadow-[0_8px_30px_rgba(124,58,237,0.1)] border border-[#E9D5FF]/60 p-1.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#7C3AED] shrink-0 ml-1 shadow-sm">
            <Sparkles size={20} />
          </div>
          <div className="flex-1 flex flex-col justify-center overflow-hidden py-1">
            <input 
              type="text" 
              placeholder='Ask RetailBot anything...'
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isTyping}
              className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-slate-800 placeholder:text-slate-400 ml-1 disabled:opacity-50"
            />
          </div>
          <button type="button" onClick={toggleVoice} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0 ${isListening ? 'bg-red-100 text-red-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
            <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
          </button>
          <button type="submit" disabled={!input.trim() || isTyping} className="w-12 h-10 bg-[#E9D5FF] text-[#7C3AED] rounded-xl flex items-center justify-center hover:bg-[#D8B4FE] transition-colors shrink-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none mr-1">
            <Send size={18} className={input.trim() && !isTyping ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
