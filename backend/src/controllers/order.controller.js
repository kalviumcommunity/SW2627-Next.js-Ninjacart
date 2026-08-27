const prisma = require('../config/db');

/**
 * Create a new order (Transactional)
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, notes } = req.body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item',
      });
    }

    // Validate item structure
    for (const item of items) {
      if (!item.produceId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Each item must have a valid produceId and a positive quantity',
        });
      }
    }

    // Ensure the retailer profile exists for the user
    const retailer = await prisma.retailer.findUnique({
      where: { userId: req.user.id },
    });

    if (!retailer) {
      return res.status(403).json({
        success: false,
        error: 'Retailer profile not found for this user',
      });
    }

    // Execute the order creation within an interactive transaction
    const orderResult = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of items) {
        const { produceId, quantity: requestedQuantity } = item;

        // 1. Concurrency-safe stock deduction using atomic updateMany with condition
        // This ensures the stock is only decremented if the available quantity >= requestedQuantity
        const updatedCount = await tx.produce.updateMany({
          where: {
            id: produceId,
            quantity: {
              gte: requestedQuantity,
            },
          },
          data: {
            quantity: {
              decrement: requestedQuantity,
            },
          },
        });

        // 2. If no rows were updated, either the produce doesn't exist or there isn't enough stock
        if (updatedCount.count === 0) {
          // Let's find out why it failed to provide a helpful error
          const produceCheck = await tx.produce.findUnique({ where: { id: produceId } });
          if (!produceCheck) {
            throw new Error(`Produce item ${produceId} not found`);
          } else {
            throw new Error(`Insufficient stock for produce: ${produceCheck.name}. Requested: ${requestedQuantity}, Available: ${produceCheck.quantity}`);
          }
        }

        // 3. Fetch the updated produce to get price for total calculation and check if stock hit 0
        const updatedProduce = await tx.produce.findUnique({
          where: { id: produceId },
        });

        // 4. Flip status to OUT_OF_STOCK if quantity is completely depleted
        if (updatedProduce.quantity === 0) {
          await tx.produce.update({
            where: { id: produceId },
            data: { status: 'OUT_OF_STOCK' },
          });
        }

        const itemTotal = updatedProduce.price * requestedQuantity;
        totalAmount += itemTotal;

        orderItemsData.push({
          produceId,
          quantity: requestedQuantity,
          unitPrice: updatedProduce.price,
          totalPrice: itemTotal,
        });
      }

      // 5. Create the Order and OrderItems in the database
      const newOrder = await tx.order.create({
        data: {
          retailerId: retailer.id,
          totalAmount,
          deliveryAddress: deliveryAddress || null,
          notes: notes || null,
          items: {
            create: orderItemsData,
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
                },
              },
            },
          },
        },
      });

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      data: orderResult,
    });
  } catch (error) {
    // If our transaction threw a custom error (e.g., insufficient stock), handle it as a 400 Bad Request
    if (error.message && (error.message.includes('Insufficient stock') || error.message.includes('not found'))) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    
    // Pass unexpected errors to the global error handler
    next(error);
  }
};

module.exports = {
  createOrder,
};
