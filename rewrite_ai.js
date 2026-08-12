const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/ai-assistant/page.tsx', 'utf-8');

content = content.replace(
  ""RefreshCw\n} from 'lucide-react';"",
  ""RefreshCw, ChevronDown\n} from 'lucide-react';""
);

content = content.replace(
  ""const [input, setInput] = useState('');"",
  ""const [input, setInput] = useState('');\n  const [isListening, setIsListening] = useState(false);\n  const recognitionRef = useRef<any>(null);""
);

const voiceEffect = 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.onresult = (event) => {
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
;

content = content.replace(
  ""const [usingGemini, setUsingGemini] = useState(!!GEMINI_API_KEY);"",
  ""const [usingGemini, setUsingGemini] = useState(!!GEMINI_API_KEY);\n"" + voiceEffect
);

const newHeader = 
      {/* Top Navigation */}
      <header className="px-5 py-4 flex items-center justify-between sticky top-0 bg-[#FF6B00] z-40 shadow-sm">
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
              <span className="absolute top-0 right-0 w-4 h-4 bg-white text-[#FF6B00] text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#FF6B00] font-bold text-sm shadow-sm">
            {initial}
          </div>
        </div>
      </header>
;
content = content.replace(/<header[\\s\\S]*?<\/header>/, newHeader);

const newMainUI = 
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
;
content = content.replace(/<motion\.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className=""px-5 pt-2 flex-1"">[\s\S]*?(?=\s*\) : \()/g, newMainUI);

const newInput = 
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
          <button type="button" onClick={toggleVoice} className={\w-10 h-10 flex items-center justify-center rounded-xl transition-colors shrink-0 \\}>
            <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
          </button>
          <button type="submit" disabled={!input.trim() || isTyping} className="w-12 h-10 bg-[#E9D5FF] text-[#7C3AED] rounded-xl flex items-center justify-center hover:bg-[#D8B4FE] transition-colors shrink-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none mr-1">
            <Send size={18} className={input.trim() && !isTyping ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
;
content = content.replace(/{\/\* Floating Input \*\/}[\s\S]*?(?=    <\/div>\n  \);\n})/g, newInput);

fs.writeFileSync('src/app/(dashboard)/ai-assistant/page.tsx', content);
