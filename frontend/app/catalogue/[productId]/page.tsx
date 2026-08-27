'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Product, getProduce } from '@/lib/api';
import OrderModal from '@/components/OrderModal';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProduce(productId);
        setProduct(data);
        setQuantity(data.quantity > 0 ? 1 : 0);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(0, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => Math.min(product?.quantity ?? prev, prev + 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const maximum = product?.quantity ?? 0;

    if (e.target.value === '') {
      setQuantity(0);
    } else if (!isNaN(value)) {
      setQuantity(Math.min(maximum, Math.max(0, value)));
    }
  };

  const handleOrderClick = () => {
    if (quantity > 0) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleConfirmSuccess = () => {
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4v2m0 0v2m0-6h4m-6 0h4m-6 0H6m6-12v2m0-2v2m0 4v2m0-6h4m-6 0h4"
            />
          </svg>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Product Not Found
          </h1>
          <p className="mt-2 text-gray-600">{error || 'The product you are looking for does not exist.'}</p>
          <a href="/catalogue" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Back to Catalogue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <a
          href="/catalogue"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Catalogue
        </a>

        {/* Product Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Image Section */}
          <div className="w-full bg-gray-200 h-64 sm:h-96 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-400 mt-2">No image available</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-6 sm:p-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                {product.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 mb-6">{product.description}</p>
            )}

            {/* Price and Stock Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Price per {product.unit}</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{product.price}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Available Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {product.quantity} {product.unit}
                </p>
              </div>
            </div>

            {/* Min Order Quantity */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Minimum Order:</span> {product.minOrderQuantity} {product.unit}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Quantity to Order
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 0}
                  aria-label="Decrease quantity"
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>

                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="0"
                  max={product.quantity}
                  aria-label="Quantity to order"
                  className="w-20 h-10 text-center border border-gray-300 rounded-lg font-semibold text-gray-900"
                />

                <button
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= product.quantity}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-xl font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  +
                </button>

                <span className="text-gray-600 ml-4">
                  {product.unit}
                </span>
              </div>
            </div>

            {/* Total Price */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-600 text-sm">Total Price</p>
              <p className="text-3xl font-bold text-blue-600">
                ₹{(product.price * quantity).toFixed(2)}
              </p>
            </div>

            {/* Order Button */}
            <button
              onClick={handleOrderClick}
              disabled={quantity <= 0 || quantity > product.quantity}
              className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place Order
            </button>
          </div>
        </div>

        {/* Farmer Info */}
        {product.farmer && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Farmer Details</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Name:</span> {product.farmer.user?.name || 'N/A'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {product.farmer.user?.email || 'N/A'}
              </p>
              {product.farmer.location && (
                <p className="text-gray-700">
                  <span className="font-semibold">Location:</span> {product.farmer.location}
                </p>
              )}
              {product.farmer.bio && (
                <p className="text-gray-700">
                  <span className="font-semibold">Bio:</span> {product.farmer.bio}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Modal */}
      {product && (
        <OrderModal
          product={product}
          quantity={quantity}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}
    </div>
  );
}
