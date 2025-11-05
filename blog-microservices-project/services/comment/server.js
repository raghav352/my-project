// services/comment/server.js
const express = require('express');
const mongoose = require('mongoose');
const pino = require('pino');
require('dotenv').config();

const commentRoutesV1 = require('./routes/v1/comment.routes');

const app = express();
const PORT = process.env.PORT || 3003;
const SERVICE_NAME = process.env.SERVICE_NAME;
const MONGO_URI = process.env.MONGO_URI;

const logger = pino({ level: process.env.LOG_LEVEL || 'info', base: { service: SERVICE_NAME } });

app.use(express.json());

// Logging Middleware (For Observability/Tracing)
app.use((req, res, next) => {
    req.correlationId = req.headers['x-request-id'] || 'no-id';
    // Attach to request object for controller access
    req.logger = logger.child({ id: req.correlationId }); 
    next();
});

// 1. Health Endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'OK' : 'DOWN';
    res.status(200).json({ service: SERVICE_NAME, status: 'Up', database: dbStatus });
});

// 2. Versioned API Route Mounting
app.use('/api/v1/comments', commentRoutesV1); 

// 3. Database Connection and Server Start
mongoose.connect(MONGO_URI)
    .then(() => {
        logger.info('✅ MongoDB connected successfully.');
        app.listen(PORT, () => {
            logger.info(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error({ error: err.message }, '❌ MongoDB connection error. Exiting.');
        process.exit(1);
    });