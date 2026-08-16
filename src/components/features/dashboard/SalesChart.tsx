'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartDataPoint } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card p-3 text-xs" style={{ minWidth: 140 }}>
        <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-semibold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

interface SalesChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export function SalesChart({ data, title = 'Sales Overview' }: SalesChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['area', 'bar'] as const).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                chartType === type ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
              }`}
            >
              {type === 'area' ? '📈' : '📊'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#1a56db' }}></span>Sales</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#059669' }}></span>Profit</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></span>Expenses</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {chartType === 'area' ? (
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sales" name="Sales" stroke="#1a56db" strokeWidth={2.5} fill="url(#colorSales)" dot={false} activeDot={{ r: 5, fill: '#1a56db' }} />
            <Area type="monotone" dataKey="profit" name="Profit" stroke="#059669" strokeWidth={2.5} fill="url(#colorProfit)" dot={false} activeDot={{ r: 5, fill: '#059669' }} />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" name="Sales" fill="#1a56db" radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="profit" name="Profit" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={32} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
