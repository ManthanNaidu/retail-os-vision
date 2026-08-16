import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface SettingsHeaderProps {
  ownerName: string;
}

export function SettingsHeader({ ownerName }: SettingsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Go back"
        >
          <Menu className="w-6 h-6 text-[#172033]" />
        </button>
        <div>
          <h1 className="text-[26px] font-extrabold text-[#172033] leading-tight">Settings</h1>
          <p className="text-[14px] font-medium text-[#667085] mt-0.5">Manage your store and account</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell className="w-6 h-6 text-[#172033]" strokeWidth={1.5} />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF5A00] border-2 border-[#FAFAF8] rounded-full"></span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF8A00] to-[#FF5A00] flex items-center justify-center text-white font-bold text-[16px] shadow-sm">
          {ownerName ? ownerName.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </div>
  );
}
