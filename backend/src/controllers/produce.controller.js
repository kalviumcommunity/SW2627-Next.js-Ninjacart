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
      const error = new Error('Produce name is required');
      error.statusCode = 400;
      return next(error);
    }

    // -------------------------
    // Validate price
    // -------------------------
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      const error = new Error('Valid non-negative price is required');
      error.statusCode = 400;
      return next(error);
    }

    // -------------------------
    // Validate quantity
    // -------------------------
    const parsedQuantity =
      quantity === undefined || quantity === null || quantity === ''
        ? 0
        : Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      const error = new Error('Quantity must be a non-negative number');
      error.statusCode = 400;
      return next(error);
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
      const error = new Error('Minimum order quantity must be greater than 0');
      error.statusCode = 400;
      return next(error);
    }

    // -------------------------
    // Validate category
    // -------------------------
    let normalizedCategory = 'VEGETABLES';

    if (category !== undefined && category !== null && category !== '') {
      normalizedCategory = String(category).trim().toUpperCase();

      if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        const error = new Error(`Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`);
      error.statusCode = 400;
      return next(error);
      }
    }

    // -------------------------
    // Validate status
    // -------------------------
    let normalizedStatus = 'AVAILABLE';

    if (status !== undefined && status !== null && status !== '') {
      normalizedStatus = String(status).trim().toUpperCase();

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        const error = new Error(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
      error.statusCode = 400;
      return next(error);
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
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
    }

    const farmer = await prisma.farmer.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    if (!farmer) {
      const error = new Error('Farmer profile not found for this user');
      error.statusCode = 404;
      return next(error);
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
        const error = new Error(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
      error.statusCode = 400;
      return next(error);
      }

      where.status = normalizedStatus;
    } else {
      // By default, exclude OUT_OF_STOCK and ARCHIVED for general catalogue browsing
      // Unless it's a farmer viewing their own products
      if (!farmerId) {
        where.status = {
          in: ['AVAILABLE', 'LOW_STOCK'],
        };
        // Explicitly exclude sold-out listings (quantity <= 0)
        where.quantity = {
          gt: 0,
        };
      }
    }

    // -------------------------
    // Category filter
    // -------------------------
    if (category) {
      const normalizedCategory = category.trim().toUpperCase();

      if (!VALID_CATEGORIES.includes(normalizedCategory)) {
        const error = new Error(`Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`);
      error.statusCode = 400;
      return next(error);
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
      const error = new Error('Produce item not found');
      error.statusCode = 404;
      return next(error);
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
      const error = new Error('Produce item not found');
      error.statusCode = 404;
      return next(error);
    }

    // -------------------------
    // Check authentication
    // -------------------------
    if (!req.user || !req.user.id) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
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
        const error = new Error('Forbidden: You can only modify your own produce listings');
      error.statusCode = 403;
      return next(error);
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
        const error = new Error('Produce name cannot be empty');
      error.statusCode = 400;
      return next(error);
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
        const error = new Error(`Invalid category. Allowed values: ${VALID_CATEGORIES.join(', ')}`);
      error.statusCode = 400;
      return next(error);
      }

      updateData.category = normalizedCategory;
    }

    // -------------------------
    // Price
    // -------------------------
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);

      if (
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        const error = new Error('Price must be a valid non-negative number');
      error.statusCode = 400;
      return next(error);
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
        const error = new Error('Unit cannot be empty');
      error.statusCode = 400;
      return next(error);
      }

      updateData.unit = unit.trim();
    }

    // -------------------------
    // Quantity
    // -------------------------
    let quantityWasUpdated = false;

    if (quantity !== undefined) {
      const parsedQuantity = parseFloat(quantity);

      if (
        !Number.isFinite(parsedQuantity) ||
        parsedQuantity < 0
      ) {
        const error = new Error('Quantity must be a valid non-negative number');
      error.statusCode = 400;
      return next(error);
      }

      updateData.quantity = parsedQuantity;
      quantityWasUpdated = true;
    }

    // -------------------------
    // Minimum order quantity
    // -------------------------
    if (minOrderQuantity !== undefined) {
      const parsedMinOrderQuantity = parseFloat(minOrderQuantity);

      if (
        !Number.isFinite(parsedMinOrderQuantity) ||
        parsedMinOrderQuantity <= 0
      ) {
        const error = new Error('Minimum order quantity must be greater than 0');
      error.statusCode = 400;
      return next(error);
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
        const error = new Error(`Invalid status. Allowed values: ${VALID_STATUSES.join(', ')}`);
      error.statusCode = 400;
      return next(error);
      }

      updateData.status = normalizedStatus;
    }

    // -------------------------
    // Status Logic
    // -------------------------
    if (quantityWasUpdated) {
      if (updateData.quantity === 0) {
        if (status !== undefined && String(status).trim().toUpperCase() === 'AVAILABLE') {
          const error = new Error('Cannot set status to AVAILABLE when quantity is 0');
      error.statusCode = 400;
      return next(error);
        }
        updateData.status = 'OUT_OF_STOCK';
      } else if (status === undefined) {
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
      const error = new Error('Produce item not found');
      error.statusCode = 404;
      return next(error);
    }

    // -------------------------
    // Check authentication
    // -------------------------
    if (!req.user || !req.user.id) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      return next(error);
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
        const error = new Error('Forbidden: You can only delete your own produce listings');
      error.statusCode = 403;
      return next(error);
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
