// services/post/models/post.model.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    // Data Ownership: This links to the User Service's data, but Post owns this record.
    authorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Reference is conceptual, not enforced by Mongoose across services
        required: true 
    },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);