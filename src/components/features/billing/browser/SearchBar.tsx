import React, { useEffect, useRef } from 'react';
import { Search, ScanBarcode, Mic } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onBarcodeScan?: () => void;
  onVoiceInput?: () => void;
}

export function SearchBar({ value, onChange, onBarcodeScan, onVoiceInput }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-4 pb-3">
      <div className="relative group">
        <Search 
          size={20} 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3] group-focus-within:text-[#FF8A00] transition-colors" 
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products or scan barcode..."
          style={{ paddingLeft: '48px', paddingRight: '110px' }}
          className="w-full h-14 bg-[#F8F9FB] border border-[#E9EDF2] rounded-2xl text-[16px] text-[#172033] font-medium placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/20 focus:border-[#FF8A00] transition-all shadow-sm"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <div className="hidden sm:flex items-center justify-center px-2 py-1 mr-2 bg-white border border-[#E9EDF2] rounded text-[10px] font-bold text-[#667085] shadow-sm">
            Ctrl K
          </div>
          <button
            onClick={onVoiceInput}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#667085] hover:bg-[#E9EDF2] hover:text-[#172033] transition-colors"
            title="Voice Billing (Coming Soon)"
          >
            <Mic size={20} />
          </button>
          <button
            onClick={onBarcodeScan}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#FF8A00] bg-[#FFF4E5] hover:bg-[#FFE5C2] transition-colors"
            title="Scan Barcode"
          >
            <ScanBarcode size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
