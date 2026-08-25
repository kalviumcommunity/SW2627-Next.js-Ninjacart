const prisma = require('../config/db');

/**
 * Create a new produce listing
 * POST /produce (or /api/produce)
 */
const createProduce = async (req, res, next) => {
  try {
    const { name, price, quantity, category, image } = req.body;

    // Validation: ensure all fields are provided
    if (
      name === undefined ||
      price === undefined ||
      quantity === undefined ||
      category === undefined ||
      image === undefined ||
      name === '' ||
      category === '' ||
      image === ''
    ) {
      return res.status(400).json({
        success: false,
        error: 'All fields (name, price, quantity, category, image) are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a valid non-negative number',
      });
    }

    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a valid non-negative number',
      });
    }

    // Business rule: status based on quantity
    const status = parsedQuantity > 0 ? 'AVAILABLE' : 'SOLD_OUT';

    const produce = await prisma.produce.create({
      data: {
        name: typeof name === 'string' ? name.trim() : name,
        price: parsedPrice,
        quantity: parsedQuantity,
        category: typeof category === 'string' ? category.trim() : category,
        image: typeof image === 'string' ? image.trim() : image,
        status,
        farmerId: req.user.id,
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
 * Update an existing produce listing
 * PATCH /produce/:id (or /api/produce/:id)
 */
const updateProduce = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, quantity } = req.body;

    // 1. Fetch existing produce listing
    const existingProduce = await prisma.produce.findUnique({
      where: { id },
    });

    if (!existingProduce) {
      return res.status(404).json({
        success: false,
        error: 'Produce listing not found',
      });
    }

    // 2. Security check: Ensure authenticated user is the owner
    if (existingProduce.farmerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to update this listing',
      });
    }

    // 3. Build update payload
    const updateData = {};

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          error: 'Price must be a valid non-negative number',
        });
      }
      updateData.price = parsedPrice;
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);
      if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be a valid non-negative number',
        });
      }
      updateData.quantity = parsedQuantity;
      // Dynamically recalculate status
      updateData.status = parsedQuantity > 0 ? 'AVAILABLE' : 'SOLD_OUT';
    }

    // 4. Update the record
    const updatedProduce = await prisma.produce.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      data: updatedProduce,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduce,
  updateProduce,
};
