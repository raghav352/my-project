// services/user/server.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON body
app.use(express.json());

// 1. Basic /health endpoint (required feature)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'User Service is Up and Running!' });
});

// 2. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        // Exit process if DB connection fails (critical failure)
        process.exit(1); 
    });


// 3. Start the Server
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});