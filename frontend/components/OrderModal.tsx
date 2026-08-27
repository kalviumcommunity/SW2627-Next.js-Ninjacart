'use client';

import { useState, useEffect } from 'react';
import { Product, Produce } from '@/lib/api';
import { createOrder } from '@/lib/api';

interface OrderModalProps {
  product?: Product;
  quantity?: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSuccess?: (orderData: any) => void;
  // Alternative interface for catalogue quick order
  produce?: Produce | null;
}

export default function OrderModal({
  product,
  quantity: initialQuantity = 1,
  isOpen,
  onClose,
  onConfirmSuccess,
  produce: catalogueProduce,
}: OrderModalProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  // Determine which product object to use
  const currentProduct = product || catalogueProduce;

  useEffect(() => {
    if (currentProduct) {
      const startingQuantity = catalogueProduce
        ? catalogueProduce.minOrderQuantity || 1
        : initialQuantity;
      setQuantity(Math.min(currentProduct.quantity, Math.max(0, startingQuantity)));
    }
  }, [catalogueProduce, currentProduct, initialQuantity]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen || !currentProduct) {
    return null;
  }

  const totalPrice = currentProduct.price * quantity;

  const updateQuantity = (value: number) => {
    setQuantity(Math.min(currentProduct.quantity, Math.max(0, value)));
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setQuantity(0);
      return;
    }

    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      updateQuantity(value);
    }
  };

  const handleConfirm = async () => {
    if (quantity <= 0 || quantity > currentProduct.quantity) {
      setError('Select a quantity that is available in stock.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        items: [
          {
            produceId: currentProduct.id || '',
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
            <span>{currentProduct.name}</span>
          </div>
          <div className="flex justify-between mb-2 items-center">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 0}
                aria-label="Decrease quantity"
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="0"
                max={currentProduct.quantity}
                aria-label="Quantity to order"
                className="w-16 py-1 text-center border border-gray-300 rounded font-semibold"
              />
              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= currentProduct.quantity}
                aria-label="Increase quantity"
                className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
              <span>{currentProduct.unit}</span>
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Price per {currentProduct.unit}:</span>
            <span>₹{currentProduct.price}</span>
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
            disabled={isLoading || quantity <= 0 || quantity > currentProduct.quantity}
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
