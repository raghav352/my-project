// services/post/routes/v1/post.routes.js
const express = require('express');
const router = express.Router();
const postController = require('../../controllers/post.controller');

// BASE ROUTE: /api/v1/posts

// Publicly accessible feed endpoint
router.get('/', postController.getAllPosts); 

// Requires JWT/Auth (Handled by Gateway)
// User must be logged in to create content
router.post('/', postController.createPost); 

// Specific post access
router.get('/:postId', postController.getPostById); 

// router.put('/:postId', postController.updatePost);
// router.delete('/:postId', postController.deletePost);

module.exports = router;