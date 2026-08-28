import React from 'react';
import Link from 'next/link';
import { Produce } from '../lib/api';

interface ProductCardProps {
  produce: Produce;
  onOrderClick?: (produce: Produce) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ produce, onOrderClick }) => {
  const isAvailable = produce.status === 'AVAILABLE' && produce.quantity > 0;

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md ${isAvailable
          ? 'border-gray-200 hover:-translate-y-1 hover:border-emerald-300'
          : 'border-gray-200 bg-gray-50/80 opacity-75 grayscale-[25%]'
        }`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={produce.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'}
          alt={produce.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-gray-700 shadow-sm backdrop-blur-md">
          {produce.category}
        </span>

        {/* Stock Badge Overlay for Sold Out */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Farmer Attribution */}
        {produce.farmer?.user?.name && (
          <p className="mb-1 text-xs font-medium text-emerald-700">
            Grown by {produce.farmer.user.name}
          </p>
        )}

        {/* Product Title */}
        <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
          {produce.name}
        </h3>

        {/* Pricing & Stock Status */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">₹{produce.price}</span>
            <span className="text-xs font-medium text-gray-500"> / {produce.unit || 'kg'}</span>
          </div>

          {/* Stock / Quantity Display */}
          <div>
            {isAvailable ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {produce.quantity} {produce.unit || 'kg'} left
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 border border-red-200">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Card Footer / Action Button */}
        <div className="mt-5 pt-3 border-t border-gray-100">
          {isAvailable ? (
            <button
              type="button"
              onClick={() => onOrderClick && onOrderClick(produce)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow active:scale-[0.98] cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed shadow-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
