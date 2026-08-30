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
        const error = new Error('Order items are required and must be a non-empty array');
      error.statusCode = 400;
      return next(error);
      }

      for (const item of items) {
        if (!item.produceId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          const error = new Error('Each item must have a valid produceId and a positive quantity');
      error.statusCode = 400;
      return next(error);
        }
      }

      const retailer = await prisma.retailer.findUnique({
        where: { userId: req.user.id },
      });

      if (!retailer) {
        const error = new Error('Retailer profile not found for this user');
      error.statusCode = 404;
      return next(error);
      }

      const orderResult = await inventoryService.placeOrderWithInventoryDeduction({
        retailerId: retailer.id,
        items,
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: orderResult,
      });
    } catch (error) {
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
          const error = new Error('Retailer profile not found');
      error.statusCode = 404;
      return next(error);
        }
        whereClause.retailerId = retailer.id;
      } else if (role === 'ADMIN') {
        // Admin sees all
        whereClause = {};
      } else {
        const error = new Error('Access denied: You are not authorized to view orders');
      error.statusCode = 403;
      return next(error);
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
      const role = req.user.role;
      let whereClause = { id };

      if (role === 'RETAILER') {
        const retailer = await prisma.retailer.findUnique({
          where: { userId: req.user.id },
        });

        if (!retailer) {
          const error = new Error('Retailer profile not found');
      error.statusCode = 404;
      return next(error);
        }
        whereClause.retailerId = retailer.id;
      } else if (role !== 'ADMIN') {
        const error = new Error('Access denied: You are not authorized to view this order');
      error.statusCode = 403;
      return next(error);
      }

      const order = await prisma.order.findFirst({
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
      });

      if (!order) {
        const error = new Error('Order not found');
      error.statusCode = 404;
      return next(error);
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
