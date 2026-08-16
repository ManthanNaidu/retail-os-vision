import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Search } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  cart: { productId: string; quantity: number }[];
  onAddProduct: (product: Product) => void;
}

export function ProductGrid({ products, cart, onAddProduct }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-[#F8F9FB] rounded-full flex items-center justify-center text-[#98A2B3] mb-4">
          <Search size={32} />
        </div>
        <h3 className="text-[18px] font-extrabold text-[#172033] mb-1">No products found</h3>
        <p className="text-[14px] text-[#667085] max-w-[250px]">
          Try searching for a different keyword or scan another barcode.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.map(product => {
          const inCart = cart.find(c => c.productId === product.id);
          const quantityInCart = inCart?.quantity || 0;

          return (
            <ProductCard
              key={product.id}
              product={product}
              quantityInCart={quantityInCart}
              onAdd={onAddProduct}
            />
          );
        })}
      </div>
    </div>
  );
}
