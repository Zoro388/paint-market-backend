
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Tool from "../models/Tool.js";
import asyncHandler from "../utils/asyncHandler.js";


// ADD ITEM TO CART
export const addToCart = asyncHandler(async (req, res) => {
  const {
    itemType = "product",
    productId,
    toolId,
    quantity,
    selectedColour,
  } = req.body;

  const itemQuantity = Number(quantity);

  if (
    !Number.isInteger(itemQuantity) ||
    itemQuantity < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be a positive whole number",
    });
  }

  if (!["product", "tool"].includes(itemType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart item type",
    });
  }

  let item;
  let itemId;

  if (itemType === "tool") {
    if (!toolId) {
      return res.status(400).json({
        success: false,
        message: "Tool ID is required",
      });
    }

    item = await Tool.findById(toolId);
    itemId = toolId;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }

    if (
      typeof item.price !== "number" ||
      !Number.isFinite(item.price) ||
      item.price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "This tool does not have a valid price yet",
      });
    }
  } else {
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    item = await Product.findById(productId);
    itemId = productId;

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!selectedColour) {
      return res.status(400).json({
        success: false,
        message: "Please select a product colour",
      });
    }

    const variantExists = item.variants.some(
      (variant) => variant._id.toString() === selectedColour
    );

    if (!variantExists) {
      return res.status(400).json({
        success: false,
        message: "Selected product colour is invalid",
      });
    }
  }

  let cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find((cartItem) => {
    const currentType = cartItem.itemType || "product";

    if (currentType !== itemType) {
      return false;
    }

    if (itemType === "tool") {
      return cartItem.tool?.toString() === itemId.toString();
    }

    return (
      cartItem.product?.toString() === itemId.toString() &&
      cartItem.selectedColour === selectedColour
    );
  });

  if (existingItem) {
    existingItem.quantity += itemQuantity;
  } else {
    cart.items.push({
      itemType,
      ...(itemType === "tool"
        ? { tool: toolId }
        : {
            product: productId,
            selectedColour,
          }),
      quantity: itemQuantity,
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .populate("items.tool");

  res.status(200).json({
    success: true,
    message: "Item added to cart",
    cart: populatedCart,
  });
});


// GET MY CART
export const getMyCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  })
    .populate("items.product")
    .populate("items.tool");

  res.status(200).json({
    success: true,
    cart,
  });
});


// UPDATE CART ITEM QUANTITY
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity, itemType = "product" } = req.body;

  const itemQuantity = Number(quantity);

  if (
    !Number.isInteger(itemQuantity) ||
    itemQuantity < 1
  ) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be at least 1",
    });
  }

  if (!["product", "tool"].includes(itemType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart item type",
    });
  }

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const item = cart.items.find((cartItem) => {
    const currentType = cartItem.itemType || "product";

    if (currentType !== itemType) {
      return false;
    }

    if (itemType === "tool") {
      return cartItem.tool?.toString() === req.params.productId;
    }

    return cartItem.product?.toString() === req.params.productId;
  });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  if (itemType === "product") {
    const product = await Product.findById(
      req.params.productId
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stockAvailability === "out_of_stock") {
      return res.status(400).json({
        success: false,
        message: "This product is currently out of stock",
      });
    }

    if (
      typeof product.stockQuantity === "number" &&
      itemQuantity > product.stockQuantity
    ) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} item(s) available in stock`,
      });
    }
  } else {
    const tool = await Tool.findById(req.params.productId);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Tool not found",
      });
    }

    if (
      typeof tool.price !== "number" ||
      !Number.isFinite(tool.price) ||
      tool.price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "This tool does not have a valid price yet",
      });
    }
  }

  item.quantity = itemQuantity;

  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .populate("items.tool");

  res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    cart: populatedCart,
  });
});


// REMOVE ITEM FROM CART
export const removeCartItem = asyncHandler(async (req, res) => {
  const itemType = req.query.itemType || "product";

  if (!["product", "tool"].includes(itemType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid cart item type",
    });
  }

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter((cartItem) => {
    const currentType = cartItem.itemType || "product";

    if (currentType !== itemType) {
      return true;
    }

    if (itemType === "tool") {
      return cartItem.tool?.toString() !== req.params.productId;
    }

    return cartItem.product?.toString() !== req.params.productId;
  });

  await cart.save();

  const populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .populate("items.tool");

  res.status(200).json({
    success: true,
    message: "Item removed",
    cart: populatedCart,
  });
});


// CLEAR CART
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = [];

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Cart cleared",
    cart,
  });
});
