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
      if (error.statusCode) {
        return res.status(error.statusCode).json({
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
      } else if (role === 'ADMIN') {
        // Admin sees all
        whereClause = {};
      } else {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not authorized to view orders',
        });
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
          return res.status(404).json({
            success: false,
            error: 'Retailer profile not found',
          });
        }
        whereClause.retailerId = retailer.id;
      } else if (role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not authorized to view this order',
        });
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
