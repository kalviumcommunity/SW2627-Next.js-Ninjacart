const prisma = require('../config/db');

/**
 * Create a new produce listing
 * POST /api/produce
 */
const createProduce = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      price,
      unit,
      quantity,
      minOrderQuantity,
      imageUrl,
      imagePublicId,
      status,
    } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Produce name is required',
      });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid non-negative price is required',
      });
    }

    const parsedQuantity = quantity !== undefined ? parseFloat(quantity) : 0;
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a non-negative number',
      });
    }

    // Find farmer profile associated with authenticated user
    const farmer = await prisma.farmer.findUnique({
      where: { userId: req.user.id },
    });

    if (!farmer) {
      return res.status(403).json({
        success: false,
        error: 'Farmer profile not found for this user',
      });
    }

    // Normalize category and status
    const validCategories = ['VEGETABLES', 'FRUITS', 'GRAINS', 'TUBERS', 'HERBS', 'DAIRY', 'OTHER'];
    const normalizedCategory = category && validCategories.includes(category.toUpperCase())
      ? category.toUpperCase()
      : 'VEGETABLES';

    const validStatuses = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARCHIVED'];
    let normalizedStatus = status && validStatuses.includes(status.toUpperCase())
      ? status.toUpperCase()
      : 'AVAILABLE';

    if (parsedQuantity === 0 && normalizedStatus === 'AVAILABLE') {
      normalizedStatus = 'OUT_OF_STOCK';
    }

    const produce = await prisma.produce.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        category: normalizedCategory,
        price: parsedPrice,
        unit: unit ? unit.trim() : 'kg',
        quantity: parsedQuantity,
        minOrderQuantity: minOrderQuantity ? parseFloat(minOrderQuantity) : 1,
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        status: normalizedStatus,
        farmerId: farmer.id,
      },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: produce,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated produce catalogue with filtering (utilizes status & createdAt indexes)
 * GET /api/produce
 */
const getProduces = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { status, category, farmerId, search, sortBy, order } = req.query;

    const where = {};

    if (status) {
      where.status = status.toUpperCase();
    }

    if (category) {
      where.category = category.toUpperCase();
    }

    if (farmerId) {
      where.farmerId = farmerId;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const sortField = ['createdAt', 'price', 'quantity', 'name'].includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order && order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [produces, total] = await Promise.all([
      prisma.produce.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortField]: sortOrder,
        },
        include: {
          farmer: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.produce.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        produces,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + produces.length < total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single produce by ID
 * GET /api/produce/:id
 */
const getProduceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const produce = await prisma.produce.findUnique({
      where: { id },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!produce) {
      return res.status(404).json({
        success: false,
        error: 'Produce item not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: produce,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update produce listing
 * PUT /api/produce/:id
 */
const updateProduce = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      price,
      unit,
      quantity,
      minOrderQuantity,
      imageUrl,
      imagePublicId,
      status,
    } = req.body;

    const existing = await prisma.produce.findUnique({
      where: { id },
      include: { farmer: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Produce item not found',
      });
    }

    // Ensure farmer owns this produce item (or user is admin)
    if (req.user.role !== 'ADMIN') {
      const farmer = await prisma.farmer.findUnique({
        where: { userId: req.user.id },
      });

      if (!farmer || farmer.id !== existing.farmerId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You can only modify your own produce listings',
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (category !== undefined) updateData.category = category.toUpperCase();
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, error: 'Price must be a valid non-negative number' });
      }
      updateData.price = parsedPrice;
    }
    if (unit !== undefined) updateData.unit = unit.trim();
    
    if (quantity !== undefined) {
      const parsedQuantity = parseFloat(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({ success: false, error: 'Quantity must be a valid non-negative number' });
      }
      updateData.quantity = parsedQuantity;
      if (parsedQuantity === 0) {
        updateData.status = 'OUT_OF_STOCK';
      } else if (parsedQuantity > 0 && status === undefined) {
        updateData.status = 'AVAILABLE';
      }
    }
    
    if (minOrderQuantity !== undefined) updateData.minOrderQuantity = parseFloat(minOrderQuantity);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (imagePublicId !== undefined) updateData.imagePublicId = imagePublicId;
    if (status !== undefined) {
      const validStatuses = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARCHIVED'];
      if (validStatuses.includes(status.toUpperCase())) {
        updateData.status = status.toUpperCase();
      }
    }

    const updatedProduce = await prisma.produce.update({
      where: { id },
      data: updateData,
      include: {
        farmer: {
          include: {
            user: {
              select: {
                id: true,
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
      data: updatedProduce,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete or archive produce item
 * DELETE /api/produce/:id
 */
const deleteProduce = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.produce.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Produce item not found',
      });
    }

    if (req.user.role !== 'ADMIN') {
      const farmer = await prisma.farmer.findUnique({
        where: { userId: req.user.id },
      });

      if (!farmer || farmer.id !== existing.farmerId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You can only delete your own produce listings',
        });
      }
    }

    await prisma.produce.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Produce item deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduce,
  getProduces,
  getProduceById,
  updateProduce,
  deleteProduce,
};
