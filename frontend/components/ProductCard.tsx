"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Produce } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface ProductCardProps {
  produce: Produce;
  onOrderClick?: (produce: Produce) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  produce,
  onOrderClick,
}) => {
  const { role, user } = useAuth();
  const isFarmer = (role || user?.role) === "FARMER";
  const [imgError, setImgError] = useState(false);

  const isAvailable =
    (produce.status === "AVAILABLE" || produce.status === "LOW_STOCK") &&
    produce.quantity > 0;

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
      className={`product-card ${!isAvailable ? "card-unavailable" : ""}`}
    >
      {/* Product Image & Badges */}
      <div className="product-card-image-wrap">
        <img
          src={imageUrl}
          alt={produce.name}
          onError={() => setImgError(true)}
          className="product-card-image"
          loading="lazy"
        />

        {/* Category Tag */}
        <span className="product-card-badge-category">
          {produce.category}
        </span>

        {/* Stock Status Badge */}
        <span
          className={`product-card-badge-status ${
            !isAvailable
              ? "status-out-of-stock"
              : isLowStock
              ? "status-low-stock"
              : "status-available"
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
          <div className="product-card-sold-out-overlay">
            <span className="product-card-sold-out-pill">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="product-card-body">
        {/* Farmer Attribution */}
        <p className="product-card-farmer">
          🌾 Grown by {farmerName}
          {farmerLocation ? ` • ${farmerLocation}` : ""}
        </p>

        {/* Product Title */}
        <h3 className="product-card-title">
          <Link
            href={`/catalogue/${produce.id}`}
          >
            {produce.name}
          </Link>
        </h3>

        {/* Pricing & Stock */}
        <div className="product-card-pricing-row">
          <div>
            <span className="product-card-price">
              ₹{produce.price}
            </span>

            <span className="product-card-unit">
              {" "}
              / {produce.unit || "kg"}
            </span>
          </div>

          {/* Stock Quantity */}
          <div>
            {isAvailable ? (
              <span
                className={`product-card-stock-pill ${
                  isLowStock ? "pill-low-stock" : "pill-available"
                }`}
              >
                <span
                  className={`stock-pulse-dot ${
                    isLowStock ? "dot-low-stock" : "dot-available"
                  }`}
                />

                {produce.quantity} {produce.unit || "kg"} left
              </span>
            ) : (
              <span className="product-card-stock-pill pill-out-of-stock">
                Sold Out
              </span>
            )}
          </div>
        </div>

        {/* Minimum Order */}
        {produce.minOrderQuantity &&
          produce.minOrderQuantity > 1 && (
            <div className="product-card-min-order">
              Min order: {produce.minOrderQuantity}{" "}
              {produce.unit || "kg"}
            </div>
          )}

        {/* Card Actions */}
        <div className="product-card-actions">
          {/* Details */}
          <Link
            href={`/catalogue/${produce.id}`}
            className="product-card-btn-details"
            style={isFarmer ? { width: "100%", textAlign: "center" } : undefined}
          >
            {isFarmer ? "View Details" : "Details"}
          </Link>

          {/* Add to Cart / Unavailable (Retailers and Guests only) */}
          {!isFarmer && (
            isAvailable ? (
              <button
                type="button"
                onClick={() =>
                  onOrderClick && onOrderClick(produce)
                }
                className="product-card-btn-order"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="product-card-cart-icon"
                  width={17}
                  height={17}
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
                className="product-card-btn-disabled"
              >
                Unavailable
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;