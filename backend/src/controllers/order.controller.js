/**
 * ============================================================================
 * Order Controller (Implemented by Jovab)
 * ============================================================================
 * Purpose: Manages wholesale order lifecycle, atomic placement, and role-based order queries.
 *
 * Flow:
 * 1. Retailer creates order via POST /api/orders with item IDs and quantities.
 * 2. Controller delegates validation and atomic inventory deduction to inventoryService.
 * 3. GET /api/orders provides role-aware filtering:
 *    - RETAILER sees their purchase history.
 *    - FARMER sees incoming retail orders for their produce listings.
 *    - ADMIN sees system-wide transactions.
 */

const inventoryService = require('../services/inventory.service');
const prisma = require('../config/db');

class OrderController {
  /**
   * Create an order with atomic stock validation and deduction
   * Flow: Authenticates retailer -> Delegates to inventoryService transaction -> Returns 201 with order details.
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
   * Get list of orders with role-based filtering:
   * - RETAILER: Filtered by retailerId matching logged-in retailer profile.
   * - FARMER: Filtered by order items containing produces owned by this farmer.
   * - ADMIN: Unfiltered (full system visibility).
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
      } else if (role === 'FARMER') {
        const farmer = await prisma.farmer.findUnique({
          where: { userId },
        });

        if (!farmer) {
          const error = new Error('Farmer profile not found');
          error.statusCode = 404;
          return next(error);
        }
        whereClause = {
          items: {
            some: {
              produce: {
                farmerId: farmer.id,
              },
            },
          },
        };
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
                  farmerId: true,
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
      } else if (role === 'FARMER') {
        const farmer = await prisma.farmer.findUnique({
          where: { userId: req.user.id },
        });

        if (!farmer) {
          const error = new Error('Farmer profile not found');
          error.statusCode = 404;
          return next(error);
        }
        whereClause = {
          id,
          items: {
            some: {
              produce: {
                farmerId: farmer.id,
              },
            },
          },
        };
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

  /**
   * Update status of an existing order
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const role = req.user.role;
      const userId = req.user.id;

      if (!status || typeof status !== 'string') {
        const error = new Error('Status is required');
        error.statusCode = 400;
        return next(error);
      }

      const normalizedStatus = status.trim().toUpperCase();
      const VALID_ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

      if (!VALID_ORDER_STATUSES.includes(normalizedStatus)) {
        const error = new Error(`Invalid status. Allowed values: ${VALID_ORDER_STATUSES.join(', ')}`);
        error.statusCode = 400;
        return next(error);
      }

      // Check order existence and permissions
      const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              produce: {
                select: {
                  farmerId: true,
                },
              },
            },
          },
          retailer: true,
        },
      });

      if (!existingOrder) {
        const error = new Error('Order not found');
        error.statusCode = 404;
        return next(error);
      }

      if (role === 'RETAILER') {
        if (existingOrder.retailer?.userId !== userId) {
          const error = new Error('Access denied: You are not authorized to update this order');
          error.statusCode = 403;
          return next(error);
        }
        if (normalizedStatus !== 'CANCELLED') {
          const error = new Error('Retailers can only cancel orders');
          error.statusCode = 403;
          return next(error);
        }
      } else if (role === 'FARMER') {
        const farmer = await prisma.farmer.findUnique({
          where: { userId },
        });
        if (!farmer) {
          const error = new Error('Farmer profile not found');
          error.statusCode = 404;
          return next(error);
        }
        const hasFarmerProduce = existingOrder.items.some(
          (item) => item.produce?.farmerId === farmer.id
        );
        if (!hasFarmerProduce) {
          const error = new Error('Access denied: You are not authorized to update this order');
          error.statusCode = 403;
          return next(error);
        }
      } else if (role !== 'ADMIN') {
        const error = new Error('Access denied: Insufficient permissions');
        error.statusCode = 403;
        return next(error);
      }

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: normalizedStatus },
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

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${normalizedStatus}`,
        data: updatedOrder,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
