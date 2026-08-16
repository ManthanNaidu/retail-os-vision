import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export interface SettingsCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: {
    text: string;
    style: 'orange' | 'purple' | 'green';
  };
  onClick: () => void;
  danger?: boolean;
}

export function SettingsCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  subtitle,
  badge,
  onClick,
  danger = false
}: SettingsCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full bg-white border border-[#14233c]/5 rounded-[18px] p-4 flex items-center gap-4 text-left transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${danger ? 'hover:bg-red-50/50' : 'hover:bg-slate-50/50'}`}
      style={{ minHeight: '72px' }}
    >
      <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 text-red-500' : iconBgColor}`}>
        <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : iconColor}`} strokeWidth={1.5} />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className={`text-[15px] font-semibold leading-tight mb-1 ${danger ? 'text-red-600' : 'text-[#172033]'}`}>
          {title}
        </h4>
        {subtitle && (
          <p className="text-[13px] text-[#667085] leading-snug truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        {badge && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            badge.style === 'orange' ? 'bg-[#FFF4E5] text-[#B54708]' : 
            badge.style === 'green' ? 'bg-[#ECFDF3] text-[#027A48]' :
            'bg-[#F3F0FF] text-[#6941C6]'
          }`}>
            {badge.text}
          </span>
        )}
        {!danger && <ChevronRight className="w-5 h-5 text-[#98A2B3]" strokeWidth={1.5} />}
      </div>
    </motion.button>
  );
}
