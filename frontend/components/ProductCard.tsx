"use client";

import React, { useState } from "react";
import { Produce } from "../lib/api";

interface ProductCardProps {
  produce: Produce;
  onOrderClick?: (produce: Produce) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  produce,
  onOrderClick,
}) => {
  const [imgError, setImgError] = useState(false);

  const isAvailable =
    (produce.status === "AVAILABLE" || produce.status === "LOW_STOCK") &&
    produce.quantity > 0;

  const isLowStock =
    produce.status === "LOW_STOCK" || (isAvailable && produce.quantity <= 5);

  const fallbackImage =
    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80";

  const imageUrl =
    !imgError && produce.imageUrl ? produce.imageUrl : fallbackImage;

  return (
    <div
      className={`group flex flex-col rounded-2xl shadow-sm transition-all hover:shadow-md bg-white border border-gray-200 overflow-hidden h-full ${
        !isAvailable ? "opacity-80" : ""
      }`}
    >
      {/* Product Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={produce.name}
          onError={() => setImgError(true)}
          loading="lazy"
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Category Badge */}
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
            {produce.category}
          </span>
          {/* Stock Status Badge */}
          {isLowStock && isAvailable && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
              Low Stock
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          {/* Product Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1 line-clamp-2">
            {produce.name}
          </h3>

          {/* Farmer Attribution */}
          {produce.farmer?.user?.name && (
            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <span>👨‍🌾</span> Grown by {produce.farmer.user.name}
            </p>
          )}

          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-900">
                ₹{produce.price.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-gray-500">
                / {produce.unit || "kg"}
              </span>
            </div>
          </div>
          
          <div className="space-y-1 mb-4">
            {/* Quantity */}
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <span className="text-gray-400">📦</span>
              {isAvailable
                ? `${produce.quantity} ${produce.unit || "kg"} available`
                : "Check back later"}
            </p>
            {/* Min Order */}
            <p className="text-sm text-gray-600 flex items-center gap-1.5">
              <span className="text-gray-400">⚖️</span>
              Min. order: {produce.minOrderQuantity} {produce.unit || "kg"}
            </p>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto pt-2 flex w-full">
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => isAvailable && onOrderClick && onOrderClick(produce)}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-colors ${
              isAvailable
                ? "cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800"
                : "cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200"
            }`}
          >
            {isAvailable ? (
              <>
                <span>Add to Cart</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </>
            ) : (
              "Unavailable"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;