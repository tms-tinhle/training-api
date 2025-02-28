const router = require('express').Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

// Hàm validation tùy chỉnh
const validatePost = (req, res, next) => {
    const errors = {}; // Sử dụng đối tượng để lưu trữ lỗi
    if (!req.body.title || req.body.title.trim().length < 5) {
        errors.title = 'Title is required & must be at least 5 characters';
    }
    if (!req.body.content || req.body.content.trim().length < 10) {
        errors.content = 'Content is required & must be at least 10 characters';
    }
    if (!req.body.author || !mongoose.Types.ObjectId.isValid(req.body.author)) {
        errors.author = 'Invalid author ID';
    }
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
};


// Get all posts
router.get('/', async (req, res) => {
    try {
        const { author_id, authorName, status, month, year, countOnly, limit = 10, page = 1 } = req.query;
        let filter = {};

        // Lọc theo author_id (ưu tiên nếu có)
        if (author_id) {
            if (!mongoose.Types.ObjectId.isValid(author_id)) {
                return res.status(400).json({ success: false, message: 'Invalid author_id' });
            }
            filter.author = author_id;
        } 
        // Nếu không có author_id, kiểm tra authorName
        else if (authorName) {
            const users = await User.find({ name: new RegExp(authorName, 'i') }).select('_id');
            if (users.length === 0) {
                return res.status(404).json({ success: false, message: 'No users found with that name' });
            }
            filter.author = { $in: users.map(user => user._id) };
        }

        if (status !== undefined) {
            const statusMap = { 'true': 'published', 'false': 'draft' };
            if (!(status in statusMap)) {
                return res.status(400).json({ success: false, message: 'Invalid status. Allowed: true (published), false (draft)' });
            }
            filter.status = statusMap[status];
        }

        if (status) filter.status = status;

        // Lọc theo tháng & năm
if (month || year) {
    const currentYear = new Date().getFullYear();
    const queryYear = year ? parseInt(year) : currentYear;

    if (isNaN(queryYear) || queryYear < 2000 || queryYear > currentYear) {
        return res.status(400).json({ success: false, message: 'Invalid year' });
    }

    if (month) {
        const queryMonth = parseInt(month);
        if (isNaN(queryMonth) || queryMonth < 1 || queryMonth > 12) {
            return res.status(400).json({ success: false, message: 'Invalid month (1-12)' });
        }
        const startDate = new Date(queryYear, queryMonth - 1, 1);
        const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);
        filter.createdAt = { $gte: startDate, $lte: endDate };
    } else {
        // Nếu chỉ có năm, lấy tất cả bài viết trong năm đó
        const startDate = new Date(queryYear, 0, 1);
        const endDate = new Date(queryYear, 11, 31, 23, 59, 59);
        filter.createdAt = { $gte: startDate, $lte: endDate };
    }
}
        // Đếm số lượng bài viết nếu `countOnly=true`
        if (countOnly === 'true') {
            const count = await Post.countDocuments(filter);
            return res.json({ success: true, count });
        }

        // Giới hạn `limit` tối đa là 50
        const maxLimit = 50;
        const parsedLimit = Math.min(parseInt(limit), maxLimit);
        const parsedPage = Math.max(1, parseInt(page));

        // Truy vấn & phân trang
        const posts = await Post.find(filter)
            .populate('author', 'name') // Lấy thêm thông tin tên tác giả
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        res.json({ success: true, data: posts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

// Get post by ID
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.json({ success: true, data: post });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});


// Create post
router.post('/', validatePost, async (req, res) => {
    try {
        // Kiểm tra xem author có tồn tại trong User database hay không
        const user = await User.findById(req.body.author);
        if (!user) {
            return res.status(400).json({ message: 'Author not found' });
        }   

        const post = new Post({
            author: req.body.author,
            title: req.body.title,
            content: req.body.content,
            status: req.body.status === true ? 'published' : 'draft', // Chuyển boolean thành string
            updateAt: Date.now()
        });

 
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        // Xử lý lỗi khi gọi User.findById()
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid author ID' });
        }
        res.status(400).json({ message: err.message });
    }
})

// Update post
router.put('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        const post = await Post.findById(req.params.id);
        if (post) {
            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;
            post.status = req.body.status === true ? 'published' : req.body.status === false ? 'draft' : post.status;
            post.updateAt = Date.now();
            const updatedPost = await post.save();
            res.json(updatedPost);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Delete post
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        
        const post = await Post.findById(req.params.id);
        if (post) {
            await post.deleteOne();
            res.json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
