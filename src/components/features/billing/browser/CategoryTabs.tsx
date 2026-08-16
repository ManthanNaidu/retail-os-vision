import React from 'react';
import { motion } from 'framer-motion';

const CATEGORY_ICONS: Record<string, string> = {
  'All': '🛍️',
  'Snacks': '🍪',
  'Grocery': '🛒',
  'Cleaning': '🧹',
  'Fruits': '🍎',
  'Dairy': '🥛',
  'Beverages': '🧃',
  'Medicine': '💊',
  'Personal Care': '💆',
  'Other': '📦'
};

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelectCategory }: CategoryTabsProps) {
  // Ensure 'All' is always first
  const displayCategories = ['All', ...categories.filter(c => c !== 'All')];

  return (
    <div className="px-4 pb-4">
      <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2 -mb-2">
        {displayCategories.map(cat => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-[14px] transition-all border ${
                isActive 
                  ? 'bg-[#FF8A00] text-white border-[#FF8A00] shadow-md shadow-[#FF8A00]/20' 
                  : 'bg-white text-[#667085] border-[#E9EDF2] hover:border-[#D0D5DD] hover:bg-[#F8F9FB]'
              }`}
            >
              <span className="text-[16px] leading-none">{CATEGORY_ICONS[cat] || '📦'}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
