// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cartback.js');

// Add/update item in cart
router.post('/add', async (req, res) => {
    const { userId, bookId, quantity } = req.body;

    try {
        let cart = await Cart.findOne({ userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(item => item.bookId.toString() === bookId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ bookId, quantity });
            }
            await cart.save();
        } else {
            cart = await Cart.create({ userId, items: [{ bookId, quantity }] });
        }
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error adding to cart", error: err });
    }
});

// Get cart for user
router.get('/:userId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.bookId');
        res.status(200).json(cart || { items: [] });
    } catch (err) {
        res.status(500).json({ message: "Error fetching cart", error: err });
    }
});

// Remove item
router.delete('/remove/:userId/:bookId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        cart.items = cart.items.filter(item => item.bookId.toString() !== req.params.bookId);
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error removing item", error: err });
    }
});

// Update quantity
router.put('/update', async (req, res) => {
    const { userId, bookId, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        const itemIndex = cart.items.findIndex(item => item.bookId.toString() === bookId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            res.status(200).json(cart);
        } else {
            res.status(404).json({ message: "Item not in cart" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error updating quantity", error: err });
    }
});

module.exports = router;
