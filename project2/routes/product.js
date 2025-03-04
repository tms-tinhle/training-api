const express = require('express');
const router = express.Router();
const { authenticate, adminAuth } = require('../middleware/authMiddleware');
const { body, param, validationResult } = require('express-validator');
const Product = require('../models/Product');    
const { faker } = require('@faker-js/faker'); 

// Middleware for error handling
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Chỉ admin có thể tạo sản phẩm
router.post('/', [
    authenticate, // Yêu cầu đăng nhập
    adminAuth, // Kiểm tra quyền admin
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('sku').notEmpty().withMessage('SKU is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('qty').isInt({ min: 0 }).withMessage('Quantity must be a positive integer'),
], validate, async (req, res) => {
    try {
        // Tạo ảnh giả lập
        const thumbnail = faker.image.urlPicsumPhotos({ width: 200, height: 200 });
        const image = faker.image.urlPicsumPhotos({ width: 600, height: 400 });
        const product = new Product({ ...req.body, thumbnail, image });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mọi user đều có thể xem danh sách sản phẩm
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mọi user đều có thể xem chi tiết sản phẩm
router.get('/:id', [param('id').isMongoId().withMessage('Invalid Product ID')], validate, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chỉ admin có thể cập nhật sản phẩm
router.put('/:id', [
    authenticate,
    adminAuth,
    param('id').isMongoId().withMessage('Invalid Product ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('qty').optional().isInt({ min: 0 }).withMessage('Quantity must be a positive integer')
], validate, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chỉ admin có thể xóa sản phẩm
router.delete('/:id', [
    authenticate,
    adminAuth,
    param('id').isMongoId().withMessage('Invalid Product ID')
], validate, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
