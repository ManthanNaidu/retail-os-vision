import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-7">
      <h3 className="text-[12px] font-bold text-[#98A2B3] tracking-widest uppercase mb-2.5 px-1">
        {title}
      </h3>
      <div className="flex flex-col gap-3.5">
        {children}
      </div>
    </div>
  );
}
