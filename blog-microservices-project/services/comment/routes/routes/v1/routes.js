// services/comment/routes/v1/comment.routes.js
const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/comment.controller');

// BASE ROUTE: /api/v1/comments

// GET comments for a specific post
// Accessed via: /api/v1/comments/post/:postId
router.get('/post/:postId', commentController.getCommentsByPostId); 

// Requires JWT/Auth (Handled by Gateway)
router.post('/', commentController.createComment); 
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;