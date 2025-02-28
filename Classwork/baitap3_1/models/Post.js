const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 150
    },
    content: {
        type: String,
        required: true,
        minlength: 20
    },
    // status: {
    //     type: Boolean,
    //     default: false
    // },
    status: { 
        type: String, 
        enum: ['published', 'draft'], 
        default: 'draft' },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Post', postSchema);
