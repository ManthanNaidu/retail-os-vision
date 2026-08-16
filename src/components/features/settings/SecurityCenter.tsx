'use client';

import { useState } from 'react';
import { Shield, Smartphone, Activity, Download, Trash2, Key, CheckCircle, AlertTriangle, Monitor, XCircle, LogOut } from 'lucide-react';

export const SecurityCenter = () => {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar flex flex-col gap-6 pb-[100px]">
      
      {/* Account Protection */}
      <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
        <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Account Protection</h3>
        
        <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Key className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Password</p>
              <p className="text-[12px] font-medium text-slate-500">Last changed recently</p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-[#FF7A00] hover:text-[#E64500]">Change</button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Two-factor authentication</p>
              <p className="text-[12px] font-medium text-amber-600">Recommended</p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-[#FF7A00] hover:text-[#E64500]">Enable</button>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Active devices</p>
              <p className="text-[12px] font-medium text-slate-500">1 device</p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-[#FF7A00] hover:text-[#E64500]">Manage</button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Security alerts</p>
              <p className="text-[12px] font-medium text-green-600">Enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Protection */}
      <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
        <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Data Protection</h3>
        
        <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Your data</p>
              <p className="text-[12px] font-medium text-green-600">Protected & Encrypted</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Download className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Export my data</p>
              <p className="text-[12px] font-medium text-slate-500">Download inventory & sales</p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-[#FF7A00] hover:text-[#E64500]">Export</button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Delete account</p>
              <p className="text-[12px] font-medium text-red-600">Permanently delete everything</p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-red-600 hover:text-red-700">Delete</button>
        </div>
      </div>

      {/* Security Activity */}
      <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
        <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Security Activity</h3>
        
        <div className="flex items-center gap-3 py-2 border-b border-[#F1F5F9]">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-[13px] font-medium text-[#101B35]">Login successful (Mac OS)</p>
          <span className="text-[11px] text-slate-400 ml-auto">Just now</span>
        </div>
        
        <div className="flex items-center gap-3 py-2 border-b border-[#F1F5F9]">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-[13px] font-medium text-[#101B35]">Role mapped to OWNER</p>
          <span className="text-[11px] text-slate-400 ml-auto">2 mins ago</span>
        </div>

        <div className="flex items-center gap-3 py-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-[13px] font-medium text-[#101B35]">Cloud sync enabled</p>
          <span className="text-[11px] text-slate-400 ml-auto">10 mins ago</span>
        </div>
      </div>

      {/* Active Devices */}
      <div className="bg-white border border-[#E8ECF2] rounded-[20px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4">
        <h3 className="text-[14px] font-bold text-[#64748B] tracking-wider uppercase mb-1">Active Devices</h3>
        
        <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">Windows PC • Chrome</p>
              <p className="text-[12px] font-medium text-green-600">Current device</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#101B35]">iPhone 15 • Safari</p>
              <p className="text-[12px] font-medium text-slate-500">Last active: 2 hours ago</p>
            </div>
          </div>
          <button className="text-[13px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-1">
            <XCircle className="w-4 h-4" /> Revoke
          </button>
        </div>
      </div>

    </div>
  );
};
