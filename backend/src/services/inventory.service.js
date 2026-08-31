const prisma = require('../config/db');

/**
 * Service to handle inventory operations and atomic order creation
 */
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

        // Lock the produce row with FOR UPDATE to prevent race conditions
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

        const remainingQuantity = produce.quantity - quantity;
        const newStatus = remainingQuantity === 0 
          ? 'OUT_OF_STOCK' 
          : remainingQuantity <= 5 
            ? 'LOW_STOCK' 
            : produce.status;

        // Deduct inventory atomically
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
      maxWait: 5000,
      timeout: 10000,
    });
  }
}

module.exports = new InventoryService();
