/**
 * ============================================================================
 * Inventory & Atomic Transaction Service (Implemented by Jovab)
 * ============================================================================
 * Purpose: Handles atomic order placement and prevents race conditions / overselling.
 *
 * Viva points to remember:
 * 1. Problem: If two retailers order the last 10kg simultaneously, without locking,
 *    both read stock = 10, both succeed, and inventory drops to -10 (Overselling!).
 * 2. Solution: Uses PostgreSQL row-level locks (SELECT ... FOR UPDATE) inside
 *    prisma.$transaction. The second request must wait until the first completes.
 * 3. Atomic Updates: Stock decrement and Order record creation happen in a single
 *    atomic database transaction. If anything fails, the entire transaction rolls back.
 * 4. Auto Status Update: If remaining stock reaches 0, status transitions to 'OUT_OF_STOCK';
 *    if <= 5kg, transitions to 'LOW_STOCK'.
 */

const prisma = require('../config/db');

class InventoryService {
  /**
   * Process and place an order atomically with inventory deduction
   * Uses PostgreSQL row-level locks (FOR UPDATE) inside a transaction to prevent race conditions.
   *
   * @param {Object} params
   * @param {string} params.retailerId - Retailer ID placing the order
   * @param {Array<{produceId: string, quantity: number}>} params.items - Array of items to order
   * @param {string} [params.deliveryAddress] - Delivery address
   * @param {string} [params.notes] - Delivery instructions or notes
   * @returns {Promise<Object>} Created order with items
   */
  async placeOrderWithInventoryDeduction({ retailerId, items, deliveryAddress, notes }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Order must contain at least one item');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsToCreate = [];

      for (const item of items) {
        const { produceId, quantity } = item;

        if (!produceId || !quantity || quantity <= 0) {
          const error = new Error('Invalid produce ID or quantity');
          error.statusCode = 400;
          throw error;
        }

        // Concurrency Guard: Lock the target produce row using PostgreSQL 'FOR UPDATE'.
        // Any concurrent transaction attempting to read/order this produce will pause
        // until this transaction commits or aborts, eliminating race conditions.
        const [produce] = await tx.$queryRaw`
          SELECT id, name, price, quantity, "minOrderQuantity", status, "farmerId"
          FROM produces
          WHERE id = ${produceId}
          FOR UPDATE
        `;

        if (!produce) {
          const error = new Error(`Produce with ID ${produceId} not found`);
          error.statusCode = 404;
          throw error;
        }

        if (quantity < produce.minOrderQuantity) {
          const error = new Error(
            `Quantity below minimum order quantity for "${produce.name}". Minimum: ${produce.minOrderQuantity}, Requested: ${quantity}`
          );
          error.statusCode = 400;
          error.code = 'BELOW_MIN_ORDER_QUANTITY';
          throw error;
        }

        // Check if sufficient stock is available
        if (produce.quantity < quantity) {
          const error = new Error(
            `Insufficient stock for "${produce.name}". Available: ${produce.quantity}, Requested: ${quantity}`
          );
          error.statusCode = 409;
          error.code = 'INSUFFICIENT_STOCK';
          throw error;
        }

        // Compute updated stock and dynamically adjust listing availability status
        const remainingQuantity = produce.quantity - quantity;
        const newStatus = remainingQuantity === 0 
          ? 'OUT_OF_STOCK' 
          : remainingQuantity <= 5 
            ? 'LOW_STOCK' 
            : produce.status;

        // Deduct inventory atomically inside the active transaction
        await tx.produce.update({
          where: { id: produceId },
          data: {
            quantity: remainingQuantity,
            status: newStatus,
          },
        });

        const unitPrice = produce.price;
        const itemTotal = unitPrice * quantity;
        totalAmount += itemTotal;

        orderItemsToCreate.push({
          produceId,
          quantity,
          unitPrice,
          totalPrice: itemTotal,
        });
      }

      // Create Order and nested OrderItems
      const createdOrder = await tx.order.create({
        data: {
          retailerId,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          status: 'PENDING',
          deliveryAddress: deliveryAddress || null,
          notes: notes || null,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              produce: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return createdOrder;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
  }
}

module.exports = new InventoryService();
