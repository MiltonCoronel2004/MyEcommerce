import * as orderService from "../services/orderService.js";

// @desc    Create new order
export const create = async (req, res) => {
  try {
    const order = await orderService.createOrder(req.user.id);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
export const getForUser = async (req, res) => {
  try {
    const orders = await orderService.getOrdersForUser(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders" });
  }
};

// @desc    Get order by ID for logged in user
export const getByIdForUser = async (req, res) => {
  try {
    const order = await orderService.getOrderByIdForUser(
      req.params.id,
      req.user.id
    );
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// --- Admin Controllers ---

// @desc    Get all orders (Admin)
export const getAllAdmin = async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersAdmin();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving all orders" });
  }
};

// @desc    Update order status (Admin)
export const updateStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const order = await orderService.updateOrderStatusAdmin(
      req.params.id,
      status
    );
    res.json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
