'use client';

import { useState } from 'react';
import { Product } from '@/lib/api';
import { createOrder } from '@/lib/api';

interface OrderModalProps {
  product: Product;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess?: (orderData: any) => void;
}

export default function OrderModal({
  product,
  quantity,
  isOpen,
  onClose,
  onConfirmSuccess,
}: OrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) {
    return null;
  }

  const totalPrice = product.price * quantity;

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        items: [
          {
            produceId: product.id || '',
            quantity: quantity,
          },
        ],
        deliveryAddress: '',
        notes: '',
      };

      const result = await createOrder(orderData);
      setShowSuccess(true);
      
      if (onConfirmSuccess) {
        onConfirmSuccess(result);
      }

      // Auto-close success screen after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setError(null);
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Order Confirmed!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your order has been successfully placed.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Confirm Order</h2>

        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Product:</span>
            <span>{product.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Quantity:</span>
            <span>
              {quantity} {product.unit}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Price per {product.unit}:</span>
            <span>₹{product.price}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Placing...
              </>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
