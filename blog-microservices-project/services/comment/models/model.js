// services/comment/models/comment.model.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true },
    // Links to the Post Service's data
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    // Links to the User Service's data
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);