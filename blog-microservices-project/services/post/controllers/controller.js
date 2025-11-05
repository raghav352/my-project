// services/post/controllers/post.controller.js
const Post = require('../models/post.model');
const axios = require('axios');
const logger = require('../logger'); // Assume logger is set up in server.js/logger.js

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// Helper function for inter-service communication (Resilience: REST with Retries/Timeout)
async function fetchAuthorDetails(authorId, correlationId) {
    try {
        // Make REST call to User Service
        const response = await axios.get(`${USER_SERVICE_URL}/api/v1/users/${authorId}`, {
            headers: {
                'X-Request-ID': correlationId, // Propagate tracing ID
            },
            timeout: 5000 // 5-second timeout for resilience
        });
        return response.data;
    } catch (error) {
        // Graceful Degradation: Return placeholder if user service fails
        logger.warn({ id: correlationId, authorId }, 'Failed to fetch author details from User Service.');
        return { username: 'Author Not Found', email: 'unavailable@blog.com' };
    }
}

// --- Post CRUD Logic ---

// CREATE Post (Requires authorId from the Gateway's propagated header)
exports.createPost = async (req, res) => {
    const correlationId = req.correlationId;
    const { title, content, tags } = req.body;
    
    // Authorization: Get userId injected by the API Gateway middleware
    const authorId = req.headers['x-user-id']; 

    if (!authorId) {
        return res.status(403).json({ message: 'User context missing.' });
    }

    try {
        const newPost = new Post({ title, content, tags, authorId });
        await newPost.save();
        logger.info({ id: correlationId, postId: newPost._id }, 'Post created successfully.');
        res.status(201).json(newPost);
    } catch (error) {
        logger.error({ id: correlationId, error: error.message }, 'Error creating post.');
        res.status(400).json({ message: 'Failed to create post.', details: error.message });
    }
};

// READ All Posts (Supports Pagination/Sorting)
exports.getAllPosts = async (req, res) => {
    const correlationId = req.correlationId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'desc' ? -1 : 1;

    try {
        const posts = await Post.find()
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Use .lean() for faster read performance

        // Enhance posts with author details (Inter-Service Communication)
        const enhancedPosts = await Promise.all(posts.map(async (post) => {
            const author = await fetchAuthorDetails(post.authorId, correlationId);
            return {
                ...post,
                author: author // Inject author data here
            };
        }));

        const total = await Post.countDocuments();
        res.status(200).json({
            data: enhancedPosts,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        logger.error({ id: correlationId, error: error.message }, 'Error fetching all posts.');
        res.status(500).json({ message: 'Internal server error fetching posts.' });
    }
};

// GET Single Post (Example: Include comments if that service was implemented)
exports.getPostById = async (req, res) => {
    const correlationId = req.correlationId;
    const { postId } = req.params;
    
    try {
        const post = await Post.findById(postId).lean();

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Enhance author details for single view as well
        const author = await fetchAuthorDetails(post.authorId, correlationId);

        res.status(200).json({ ...post, author });

    } catch (error) {
        logger.error({ id: correlationId, postId, error: error.message }, 'Error fetching single post.');
        res.status(500).json({ message: 'Error retrieving post.' });
    }
};
// ... (Implement updatePost, deletePost similarly)