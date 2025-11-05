// services/comment/controllers/comment.controller.js
const Comment = require('../models/comment.model');
const axios = require('axios');
const pino = require('pino'); // Or require your unified logger

const logger = pino({ level: 'info', base: { service: 'comment-service' } });

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
const POST_SERVICE_URL = process.env.POST_SERVICE_URL;

// --- Helper Functions for Inter-Service Calls ---

// Check if the Post exists
async function checkPostExistence(postId, correlationId) {
    try {
        const response = await axios.get(`${POST_SERVICE_URL}/api/v1/posts/${postId}`, {
            headers: { 'X-Request-ID': correlationId },
            timeout: 3000 // 3-second timeout
        });
        return response.status === 200;
    } catch (error) {
        logger.warn({ id: correlationId, postId }, 'Post existence check failed (Post service unreachable or Post not found).');
        return false;
    }
}

// Fetch Author Details (Graceful Degradation)
async function fetchAuthorDetails(authorId, correlationId) {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/api/v1/users/${authorId}`, {
            headers: { 'X-Request-ID': correlationId },
            timeout: 3000
        });
        return response.data;
    } catch (error) {
        return { username: 'Deleted User', email: 'unavailable' }; // Fallback data
    }
}

// --- Controller Logic ---

// CREATE Comment
exports.createComment = async (req, res) => {
    const correlationId = req.correlationId;
    const { content, postId } = req.body;
    const authorId = req.headers['x-user-id']; // User ID injected by the Gateway

    if (!authorId) {
        return res.status(403).json({ message: 'Authentication required.' });
    }

    // 1. Check if the parent post exists
    const postExists = await checkPostExistence(postId, correlationId);
    if (!postExists) {
        return res.status(404).json({ message: 'Cannot comment: Post not found or is unavailable.' });
    }

    try {
        const newComment = new Comment({ content, postId, authorId });
        await newComment.save();
        
        logger.info({ id: correlationId, commentId: newComment._id, postId }, 'Comment created.');
        res.status(201).json(newComment);
    } catch (error) {
        logger.error({ id: correlationId, error: error.message }, 'Error creating comment.');
        res.status(400).json({ message: 'Failed to create comment.', details: error.message });
    }
};

// READ Comments by Post ID
exports.getCommentsByPostId = async (req, res) => {
    const correlationId = req.correlationId;
    const { postId } = req.params;

    try {
        const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

        // Enhance comments with author details
        const enhancedComments = await Promise.all(comments.map(async (comment) => {
            const author = await fetchAuthorDetails(comment.authorId, correlationId);
            return { ...comment, author: author };
        }));

        res.status(200).json(enhancedComments);

    } catch (error) {
        logger.error({ id: correlationId, postId, error: error.message }, 'Error fetching comments.');
        res.status(500).json({ message: 'Internal server error fetching comments.' });
    }
};

// DELETE Comment
exports.deleteComment = async (req, res) => {
    const correlationId = req.correlationId;
    const { commentId } = req.params;
    const currentUserId = req.headers['x-user-id']; 
    const currentUserRole = req.headers['x-user-role'];

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Authorization Check: Must be the author or an admin
        const isAuthor = comment.authorId.toString() === currentUserId;
        const isAdmin = currentUserRole === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: You do not own this comment.' });
        }

        await Comment.deleteOne({ _id: commentId });
        logger.info({ id: correlationId, commentId }, 'Comment deleted.');
        res.status(204).send(); // No content

    } catch (error) {
        logger.error({ id: correlationId, error: error.message }, 'Error deleting comment.');
        res.status(500).json({ message: 'Internal server error deleting comment.' });
    }
};