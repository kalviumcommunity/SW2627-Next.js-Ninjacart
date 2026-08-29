"use client";

import React, { useState } from "react";
import Link from "next/link";
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
    produce.status === "AVAILABLE" && produce.quantity > 0;

  const isLowStock =
    produce.status === "LOW_STOCK" ||
    (isAvailable && produce.quantity <= 5);

  const fallbackImage =
    "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80";

  const imageUrl =
    !imgError && produce.imageUrl
      ? produce.imageUrl
      : fallbackImage;

  const farmerName =
    produce.farmer?.user?.name || "Verified Partner Farm";

  const farmerLocation =
    produce.farmer?.location || "Direct Farm Source";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md ${
        isAvailable
          ? "border-gray-200 hover:-translate-y-1 hover:border-emerald-300"
          : "border-gray-200 bg-gray-50/80 opacity-80"
      }`}
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={produce.name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Tag */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-700 shadow-sm backdrop-blur-md">
          {produce.category}
        </span>

        {/* Stock Status Badge */}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${
            !isAvailable
              ? "bg-red-600 text-white"
              : isLowStock
              ? "bg-amber-500 text-white"
              : "bg-emerald-600 text-white"
          }`}
        >
          {!isAvailable
            ? "Out of Stock"
            : isLowStock
            ? "Low Stock"
            : "Available"}
        </span>

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <span className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Farmer Attribution */}
        <p className="mb-1 text-xs font-medium text-emerald-700">
          🌾 Grown by {farmerName}
          {farmerLocation ? ` • ${farmerLocation}` : ""}
        </p>

        {/* Product Title */}
        <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
          <Link
            href={`/catalogue/${produce.id}`}
            className="hover:underline"
          >
            {produce.name}
          </Link>
        </h3>

        {/* Pricing & Stock */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">
              ₹{produce.price}
            </span>

            <span className="text-xs font-medium text-gray-500">
              {" "}
              / {produce.unit || "kg"}
            </span>
          </div>

          {/* Stock Quantity */}
          <div>
            {isAvailable ? (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                  isLowStock
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200/60 bg-emerald-50 text-emerald-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                    isLowStock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />

                {produce.quantity} {produce.unit || "kg"} left
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Minimum Order */}
        {produce.minOrderQuantity &&
          produce.minOrderQuantity > 1 && (
            <div className="mt-1 text-xs text-gray-400">
              Min order: {produce.minOrderQuantity}{" "}
              {produce.unit || "kg"}
            </div>
          )}

        {/* Card Actions */}
        <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-3">
          {/* Details */}
          <Link
            href={`/catalogue/${produce.id}`}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            Details
          </Link>

          {/* Add to Cart / Unavailable */}
          {isAvailable ? (
            <button
              type="button"
              onClick={() =>
                onOrderClick && onOrderClick(produce)
              }
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow active:scale-[0.98]"
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
              className="flex flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-400"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;