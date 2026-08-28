const prisma = require('../config/db');

/**
 * Valid values
 */
const VALID_CATEGORIES = [
  'VEGETABLES',
  'FRUITS',
  'GRAINS',
  'TUBERS',
  'HERBS',
  'DAIRY',
  'OTHER',
];

const VALID_STATUSES = [
  'AVAILABLE',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'ARCHIVED',
];

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

    // -------------------------
    // Validate name
    // -------------------------
    if (
      !name ||
      typeof name !== 'string' ||
      name.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Produce name is required',
      });
    }

    // -------------------------
    // Validate price
    // -------------------------
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid non-negative price is required',
      });
    }

    // -------------------------
    // Validate quantity
    // -------------------------
    const parsedQuantity =
      quantity === undefined || quantity === null || quantity === ''
        ? 0
        : Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a non-negative number',
      });
    }

    // -------------------------
    // Validate minimum order quantity
    // -------------------------
    const parsedMinOrderQuantity =
      minOrderQuantity === undefined ||
      minOrderQuantity === null ||
      minOrderQuantity === ''
        ? 1
        : Number(minOrderQuantity);

    if (
      !Number.isFinite(parsedMinOrderQuantity) ||
      parsedMinOrderQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Minimum order quantity must be greater than 0',
      });
    }

    // -------------------------
    // Validate category
    // -------------------------
    let normalizedCategory = 'VEGETABLES';

    if (category !== undefined && category !== null && category !== '') {
      normalizedCategory = String(category).trim().toUpperCase();

      if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`,
        });
      }
    }

    // -------------------------
    // Validate status
    // -------------------------
    let normalizedStatus = 'AVAILABLE';

    if (status !== undefined && status !== null && status !== '') {
      normalizedStatus = String(status).trim().toUpperCase();

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
        });
      }
    }

    // If quantity is 0, listing cannot be AVAILABLE
    if (parsedQuantity === 0) {
      normalizedStatus = 'OUT_OF_STOCK';
    }

    // -------------------------
    // Find authenticated farmer
    // -------------------------
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const farmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!farmer) {
      return res.status(403).json({
        success: false,
        error: 'Farmer profile not found for this user',
      });
    }

    // -------------------------
    // Create produce
    // -------------------------
    const produce = await prisma.produce.create({
      data: {
        name: name.trim(),
        description:
          description && typeof description === 'string'
            ? description.trim()
            : null,

        category: normalizedCategory,

        price: parsedPrice,

        unit:
          unit && typeof unit === 'string'
            ? unit.trim()
            : 'kg',

        quantity: parsedQuantity,

        minOrderQuantity: parsedMinOrderQuantity,

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
 * Get paginated produce catalogue
 * GET /api/produce
 */
const getProduces = async (req, res, next) => {
  try {
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        parseInt(req.query.limit, 10) || 10
      )
    );

    const skip = (page - 1) * limit;

    const {
      status,
      category,
      farmerId,
      search,
      sortBy,
      order,
    } = req.query;

    const where = {};

    // -------------------------
    // Status filter
    // -------------------------
    if (status) {
      const normalizedStatus = status.trim().toUpperCase();

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
        });
      }

      where.status = normalizedStatus;
    }

    // -------------------------
    // Category filter
    // -------------------------
    if (category) {
      const normalizedCategory = category.trim().toUpperCase();

      if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      where.category = normalizedCategory;
    }

    // -------------------------
    // Farmer filter
    // -------------------------
    if (farmerId) {
      where.farmerId = farmerId;
    }

    // -------------------------
    // Search
    // -------------------------
    if (search && typeof search === 'string') {
      const searchTerm = search.trim();

      if (searchTerm) {
        where.OR = [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ];
      }
    }

    // -------------------------
    // Sorting
    // -------------------------
    const allowedSortFields = [
      'createdAt',
      'price',
      'quantity',
      'name',
    ];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : 'createdAt';

    const sortOrder =
      order && order.toLowerCase() === 'asc'
        ? 'asc'
        : 'desc';

    // -------------------------
    // Fetch data
    // -------------------------
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

      prisma.produce.count({
        where,
      }),
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
      where: {
        id,
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
 * PATCH /api/produce/:id
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

    // -------------------------
    // Find existing produce
    // -------------------------
    const existing = await prisma.produce.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Produce item not found',
      });
    }

    // -------------------------
    // Check authentication
    // -------------------------
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // -------------------------
    // Check ownership
    // -------------------------
    if (req.user.role !== 'ADMIN') {
      const farmer = await prisma.farmer.findUnique({
        where: {
          userId: req.user.id,
        },
      });

      if (!farmer || farmer.id !== existing.farmerId) {
        return res.status(403).json({
          success: false,
          error:
            'Forbidden: You can only modify your own produce listings',
        });
      }
    }

    const updateData = {};

    // -------------------------
    // Name
    // -------------------------
    if (name !== undefined) {
      if (
        typeof name !== 'string' ||
        name.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: 'Produce name cannot be empty',
        });
      }

      updateData.name = name.trim();
    }

    // -------------------------
    // Description
    // -------------------------
    if (description !== undefined) {
      updateData.description =
        description && typeof description === 'string'
          ? description.trim()
          : null;
    }

    // -------------------------
    // Category
    // -------------------------
    if (category !== undefined) {
      const normalizedCategory = String(category)
        .trim()
        .toUpperCase();

      if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      updateData.category = normalizedCategory;
    }

    // -------------------------
    // Price
    // -------------------------
    if (price !== undefined) {
      const parsedPrice = Number(price);

      if (
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Price must be a valid non-negative number',
        });
      }

      updateData.price = parsedPrice;
    }

    // -------------------------
    // Unit
    // -------------------------
    if (unit !== undefined) {
      if (
        typeof unit !== 'string' ||
        unit.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: 'Unit cannot be empty',
        });
      }

      updateData.unit = unit.trim();
    }

    // -------------------------
    // Quantity
    // -------------------------
    let quantityWasUpdated = false;

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (
        !Number.isFinite(parsedQuantity) ||
        parsedQuantity < 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Quantity must be a valid non-negative number',
        });
      }

      updateData.quantity = parsedQuantity;
      quantityWasUpdated = true;
    }

    // -------------------------
    // Minimum order quantity
    // -------------------------
    if (minOrderQuantity !== undefined) {
      const parsedMinOrderQuantity =
        Number(minOrderQuantity);

      if (
        !Number.isFinite(parsedMinOrderQuantity) ||
        parsedMinOrderQuantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Minimum order quantity must be greater than 0',
        });
      }

      updateData.minOrderQuantity =
        parsedMinOrderQuantity;
    }

    // -------------------------
    // Images
    // -------------------------
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null;
    }

    if (imagePublicId !== undefined) {
      updateData.imagePublicId =
        imagePublicId || null;
    }

    // -------------------------
    // Status
    // -------------------------
    if (status !== undefined) {
      const normalizedStatus = String(status)
        .trim()
        .toUpperCase();

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`,
        });
      }

      updateData.status = normalizedStatus;
    }

    // -------------------------
    // Automatically update status
    // -------------------------
    if (quantityWasUpdated && status === undefined) {
      if (updateData.quantity === 0) {
        updateData.status = 'OUT_OF_STOCK';
      } else {
        updateData.status = 'AVAILABLE';
      }
    }

    // -------------------------
    // Update database
    // -------------------------
    const updatedProduce = await prisma.produce.update({
      where: {
        id,
      },

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
 * Delete produce listing
 * DELETE /api/produce/:id
 */
const deleteProduce = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.produce.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Produce item not found',
      });
    }

    // -------------------------
    // Check authentication
    // -------------------------
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // -------------------------
    // Check ownership
    // -------------------------
    if (req.user.role !== 'ADMIN') {
      const farmer = await prisma.farmer.findUnique({
        where: {
          userId: req.user.id,
        },
      });

      if (!farmer || farmer.id !== existing.farmerId) {
        return res.status(403).json({
          success: false,
          error:
            'Forbidden: You can only delete your own produce listings',
        });
      }
    }

    await prisma.produce.delete({
      where: {
        id,
      },
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
