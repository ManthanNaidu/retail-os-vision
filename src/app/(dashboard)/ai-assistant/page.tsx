'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, RefreshCw, TrendingUp, Package, CreditCard,
  BarChart3, AlertTriangle, FileText, Star, Cpu, Clock,
  ChevronRight, MessageSquare, Zap
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatCurrency, getDaysUntilExpiry } from '@/lib/utils';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

const localResponses: Record<string, string> = {
  sales:    "Today's sales: **₹16,700** across 47 orders.\nProfit margin is **26.9%**. Saturday is your best day — consider extra stock for weekends!",
  profit:   "Today's profit: **₹4,500** — up **14%** from yesterday!\nYour best margin items are Paracetamol (50%) and Dettol Soap (26%).",
  stock:    "**4 items need attention:**\n• Maggi Noodles — only 5 packs left\n• Aashirvaad Atta — 8 bags (order today!)\n• Amul Butter — 3 units\n• Amoxicillin — expiring in 20 days\n\nShall I create a purchase order?",
  expiry:   "**Expiring soon:**\n• Amoxicillin 250mg — 20 days (9 strips)\n• Amul Butter 500g — 15 Feb (3 units)\n\nTip: Give 10% discount on Amoxicillin to clear stock. You'll save ₹585 vs total loss.",
  customer: "**Customer insights:**\n• Rahul Sharma owes **₹2,300** (45 days overdue)\n• Suresh Kumar inactive for **72 days**\n• Ravi Gupta inactive for **108 days**\n\nSend WhatsApp reminders to recover ₹8,550 total.",
  payment:  "**Pending payments:**\n• Rahul Sharma — ₹2,300\n• Suresh Kumar — ₹1,800\n• Ravi Gupta — ₹3,200\n• Others — ₹1,250\n\n**Total: ₹8,550** — Should I send WhatsApp reminders to all?",
  forecast: "**Tomorrow's forecast:**\n• Expected sales: **₹18,200 – ₹21,500**\n• It's Sunday, typically your 2nd best day\n• Stock up: Fortune Oil, Maggi, Tata Salt tend to sell more on weekends",
  gst:      "**GST Summary (this month):**\n• Total sales: ₹4,56,000\n• GST collected: ₹48,320\n• Input GST: ₹32,100\n• **GST payable: ₹16,220**\n\nNext filing due: 20th. Want me to generate the full report?",
  suggest:  "**Top 3 profit moves for today:**\n1. Raise Maggi price by ₹2 → +₹480/month\n2. Remind Rahul Sharma about ₹2,300 → immediate cash\n3. Order Aashirvaad Atta before stockout → avoid ₹3,000 lost sales",
  best:     "**Top selling products this month:**\n1. Tata Salt 1kg — 420 units — ₹9,240\n2. Aashirvaad Atta 5kg — 185 units — ₹38,850\n3. Maggi 70g — 312 units — ₹4,680\n4. Fortune Oil 1L — 94 units — ₹15,510\n\nFocus reorder on items 2 and 3 — both running low!",
};

function findLocalResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('sale') || q.includes('today') || q.includes('aaj')) return localResponses.sales;
  if (q.includes('profit') || q.includes('munafa'))                    return localResponses.profit;
  if (q.includes('stock') || q.includes('inventory') || q.includes('low')) return localResponses.stock;
  if (q.includes('expir') || q.includes('khatam'))                    return localResponses.expiry;
  if (q.includes('payment') || q.includes('pending') || q.includes('credit') || q.includes('baki')) return localResponses.payment;
  if (q.includes('customer') || q.includes('grahak'))                 return localResponses.customer;
  if (q.includes('forecast') || q.includes('tomorrow') || q.includes('kal')) return localResponses.forecast;
  if (q.includes('gst') || q.includes('tax'))                         return localResponses.gst;
  if (q.includes('suggest') || q.includes('advice') || q.includes('improve') || q.includes('tip')) return localResponses.suggest;
  if (q.includes('best') || q.includes('top') || q.includes('popular')) return localResponses.best;
  return "Based on your store data, I can see **4 low-stock items** and **₹8,550** in pending credit.\n\nAsk me anything specific about sales, stock, customers, or profits!";
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

const QUICK_PROMPTS = [
  { label: "Today's sales",      icon: TrendingUp  },
  { label: 'Low stock items',    icon: Package     },
  { label: 'Pending payments',   icon: CreditCard  },
  { label: 'Predict tomorrow',   icon: BarChart3   },
  { label: 'Increase profit',    icon: Star        },
];

// --- Cute Animated Bot Character Component ---
function BotCharacter({ isTyping }: { isTyping: boolean }) {
  return (
    <motion.div 
      className="relative flex items-center justify-center mx-auto mb-2"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-2xl z-0"
        style={{ background: 'var(--primary)', opacity: 0.2 }}
        animate={{ scale: isTyping ? [1, 1.2, 1] : 1, opacity: isTyping ? [0.2, 0.4, 0.2] : 0.2 }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      
      {/* Bot Body */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Antenna */}
        <motion.div className="w-1 h-3 bg-amber-300 rounded-t-full" />
        <motion.div 
          className="w-3 h-3 bg-orange-500 rounded-full mb-[-2px] z-20"
          animate={isTyping ? { backgroundColor: ['#f97316', '#fcd34d', '#f97316'], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        
        {/* Head */}
        <motion.div 
          className="w-20 h-16 rounded-3xl flex items-center justify-center shadow-lg overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: '2px solid #fff' }}
          animate={isTyping ? { rotate: [-2, 2, -2] } : { rotate: 0 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Shine effect */}
          <div className="absolute top-1 left-2 w-4 h-4 rounded-full bg-white/30 blur-[2px]" />
          
          {/* Eyes Container */}
          <div className="flex gap-3 relative z-10 mt-1">
            {/* Left Eye */}
            <motion.div 
              className="w-3.5 h-4.5 bg-white rounded-full flex items-center justify-center overflow-hidden"
              animate={isTyping ? { 
                scaleY: [1, 1, 1, 0.1, 1], // Blink
                scaleX: [1, 1.1, 1] // Thinking widen
              } : {
                scaleY: [1, 1, 1, 1, 1, 0.1, 1] // Random blink
              }}
              transition={{ duration: isTyping ? 1.5 : 4, repeat: Infinity }}
            >
              <motion.div 
                className="w-1.5 h-1.5 bg-orange-800 rounded-full"
                animate={isTyping ? { x: [-1, 1, -1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>
            
            {/* Right Eye */}
            <motion.div 
              className="w-3.5 h-4.5 bg-white rounded-full flex items-center justify-center overflow-hidden"
              animate={isTyping ? { 
                scaleY: [1, 1, 1, 0.1, 1], 
                scaleX: [1, 1.1, 1] 
              } : {
                scaleY: [1, 1, 1, 1, 1, 0.1, 1] 
              }}
              transition={{ duration: isTyping ? 1.5 : 4, repeat: Infinity }}
            >
              <motion.div 
                className="w-1.5 h-1.5 bg-orange-800 rounded-full"
                animate={isTyping ? { x: [-1, 1, -1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Mouth (only shows when happy/typing) */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-orange-800/80 rounded-b-full"
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-orange-500"
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
      className={`flex flex-col gap-1 w-full max-w-[85%] ${isUser ? 'self-end items-end' : 'self-start items-start'}`}
    >
      <div className={`flex items-end gap-2 w-full ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm border-2 ${isUser ? 'bg-amber-600 text-white border-white' : 'bg-white border-amber-200'}`}>
          {isUser ? initial : <Sparkles size={14} className="text-orange-500" />}
        </div>
        
        {/* Bubble */}
        <div className={`px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed whitespace-pre-line shadow-sm border ${isUser ? 'rounded-br-sm bg-gradient-to-br from-orange-500 to-amber-600 text-white border-orange-600/50' : 'rounded-bl-sm bg-white text-slate-800 border-amber-100'}`}>
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={i} className={isUser ? 'text-amber-100 font-bold' : 'text-orange-700 font-bold'}>{part.slice(2, -2)}</strong>
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
  const { products, customers, sales } = useAppStore();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [usingGemini, setUsingGemini] = useState(!!GEMINI_API_KEY);
  const [ownerName, setOwnerName] = useState('Owner');
  const [initial, setInitial] = useState('O');
  const bottomRef = useRef<HTMLDivElement>(null);

  const storeContext = useMemo(() => {
    const todaySales   = sales.slice(0, 10).reduce((s, sale) => s + sale.total, 0);
    const lowStock     = products.filter(p => p.stock > 0 && p.stock < p.minStock);
    const expiring     = products.filter(p => p.expiryDate && getDaysUntilExpiry(p.expiryDate) <= 30 && getDaysUntilExpiry(p.expiryDate) > 0);
    const pendingCredit = customers.filter(c => c.creditBalance > 0);
    const totalCredit  = customers.reduce((s, c) => s + c.creditBalance, 0);
    return `You are RetailOS AI — a smart, friendly business assistant for Indian retail stores.
Store: Shree Ram Medical & General Stores.
LIVE DATA (${new Date().toLocaleDateString('en-IN')}):
- Today's sales: ₹${todaySales > 0 ? todaySales.toFixed(0) : '16,700'}
- Total products: ${products.length} | Low stock: ${lowStock.map(p => p.name).join(', ') || 'None'}
- Customers: ${customers.length} | Credit outstanding: ₹${totalCredit.toFixed(0)} from ${pendingCredit.length} customers
Rules: You are an expert retail business advisor. Respond in clear, professional English or Hindi. Never use emojis. Use ₹ for currency. Use ** for bold text.`;
  }, [products, customers, sales]);

  useEffect(() => {
    let currentOwnerName = user?.displayName ? user.displayName.split(' ')[0] : '';
    let currentInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

    if (!currentOwnerName && typeof window !== 'undefined') {
        try {
            const profile = JSON.parse(localStorage.getItem('retailos_profile') || '{}');
            if (profile.ownerName) {
                currentOwnerName = profile.ownerName.split(' ')[0];
                currentInitial = currentOwnerName.charAt(0).toUpperCase();
            }
        } catch (e) {}
    }

    const finalOwnerName = currentOwnerName || 'Owner';
    setOwnerName(finalOwnerName);
    setInitial(currentInitial || 'O');

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const totalCredit = customers.reduce((s, c) => s + c.creditBalance, 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < p.minStock).length;
    
    setMessages([{
      role: 'assistant',
      content: `${greeting}, ${finalOwnerName} ji!\n\nI'm **RetailBot**, your smart business partner. Here is your daily summary:\n\n**🎯 Target:** ₹20,000\n**📦 Stock:** ${lowStockCount} items running low\n**💰 Credit:** ${formatCurrency(totalCredit)} pending\n\nWhat would you like to analyze today?`,
      timestamp: new Date(),
    }]);
  }, [user, products, customers]);

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
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800)); // slightly longer fake delay for cute animation
        response = findLocalResponse(text);
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, my circuits got crossed! Please try asking again.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Chat cleared. Ready for the next question, ${ownerName} ji!`, timestamp: new Date() }]);
  };

  return (
    <div className="flex flex-col relative bg-slate-50" style={{ height: 'calc(100dvh - 56px)' }}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-100/50 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -left-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative px-5 pt-5 pb-3 flex-shrink-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-amber-200 flex items-center justify-center">
              <Zap size={18} className="text-orange-500 fill-orange-100" />
            </div>
            <div>
              <h1 className="text-[17px] font-extrabold text-slate-800 tracking-tight">RetailBot AI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-1.5 h-1.5 rounded-full ${usingGemini && GEMINI_API_KEY ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`} />
                <span className={`text-[11px] font-bold uppercase tracking-wider ${usingGemini && GEMINI_API_KEY ? 'text-green-600' : 'text-amber-600'}`}>
                  {usingGemini && GEMINI_API_KEY ? 'Gemini Online' : 'Smart Offline'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-orange-600 transition-colors">
            <RefreshCw size={13} /> Reset
          </button>
        </div>

        {/* Quick Prompt Chips */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
          {QUICK_PROMPTS.map((p, i) => (
            <motion.button key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(p.label)}
              className="flex-shrink-0 flex items-center gap-2 text-[13px] font-bold px-4 py-2.5 rounded-2xl bg-white border border-amber-200/60 shadow-sm hover:border-orange-400 hover:shadow-md transition-all text-slate-700">
              <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center">
                <p.icon size={12} className="text-orange-600" />
              </div>
              {p.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-5 relative z-10 flex flex-col" style={{ overscrollBehavior: 'contain' }}>
        <AnimatePresence>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} initial={initial} />)}
        </AnimatePresence>

        {/* Animated Bot appearing while typing */}
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }}
              className="self-start mt-2"
            >
              <BotCharacter isTyping={true} />
              <div className="ml-4 mt-2 rounded-2xl rounded-tl-sm border bg-white border-amber-100 shadow-sm inline-block">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty state big bot if no typing and only 1 message */}
        {!isTyping && messages.length <= 1 && (
           <div className="mt-8 opacity-80 pointer-events-none">
             <BotCharacter isTyping={false} />
           </div>
        )}
        
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-20" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="relative max-w-3xl mx-auto flex items-end gap-2">
          <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-3xl p-1 shadow-inner focus-within:bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              placeholder="Ask RetailBot anything..."
              className="w-full bg-transparent px-4 py-3 min-h-[48px] outline-none text-[15px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal" 
              disabled={isTyping} 
            />
          </div>
          <motion.button type="submit" disabled={!input.trim() || isTyping}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
            className={`w-[56px] h-[56px] rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md
              ${input.trim() && !isTyping ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-500/30' : 'bg-slate-100 text-slate-400 shadow-none'}`}
          >
            <Send size={22} className={input.trim() && !isTyping ? 'translate-x-0.5 -translate-y-0.5' : ''} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
