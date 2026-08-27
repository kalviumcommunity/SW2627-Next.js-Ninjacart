const inventoryService = require('../services/inventory.service');
const prisma = require('../config/db');

/**
 * Controller to handle Order operations
 */
class OrderController {
  /**
   * Create an order with atomic stock validation and deduction
   */
  async createOrder(req, res, next) {
    try {
      const { items, deliveryAddress, notes } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Order items are required and must be a non-empty array',
        });
      }

      for (const item of items) {
        if (!item.produceId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Each item must have a valid produceId and a positive quantity',
          });
        }
      }

      const retailer = await prisma.retailer.findUnique({
        where: { userId: req.user.id },
      });

      if (!retailer) {
        return res.status(403).json({
          success: false,
          error: 'Retailer profile not found for this user',
        });
      }

      const orderResult = await prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
          const { produceId, quantity: requestedQuantity } = item;

          const updatedCount = await tx.produce.updateMany({
            where: {
              id: produceId,
              quantity: { gte: requestedQuantity },
            },
            data: {
              quantity: { decrement: requestedQuantity },
            },
          });

          if (updatedCount.count === 0) {
            const produceCheck = await tx.produce.findUnique({ where: { id: produceId } });
            if (!produceCheck) {
              throw new Error(`Produce item ${produceId} not found`);
            } else {
              throw new Error(`Insufficient stock for produce: ${produceCheck.name}. Requested: ${requestedQuantity}, Available: ${produceCheck.quantity}`);
            }
          }

          const updatedProduce = await tx.produce.findUnique({
            where: { id: produceId },
          });

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

        return await tx.order.create({
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
                  select: { id: true, name: true, unit: true, price: true, imageUrl: true },
                },
              },
            },
          },
        });
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: orderResult,
      });
    } catch (error) {
      if (error.message && (error.message.includes('Insufficient stock') || error.message.includes('not found'))) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      next(error);
    }
  }

  /**
   * Get list of orders for the authenticated retailer or all orders if authorized
   */
  async getOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      let whereClause = {};

      if (role === 'RETAILER') {
        const retailer = await prisma.retailer.findUnique({
          where: { userId },
        });

        if (!retailer) {
          return res.status(404).json({
            success: false,
            error: 'Retailer profile not found',
          });
        }
        whereClause.retailerId = retailer.id;
      }

      const orders = await prisma.order.findMany({
        where: whereClause,
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
          retailer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single order by ID
   */
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id },
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
          retailer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
