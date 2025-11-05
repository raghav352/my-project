// api-gateway/server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pino = require('pino');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET;
const logger = pino({ level: 'info', base: { service: 'api-gateway' } });

// --- 1. Global Middleware (CORS, JSON, Rate Limiting can go here) ---
app.use(cors());
app.use(express.json());

// 2. Tracing/Correlation ID Middleware
app.use((req, res, next) => {
    // Generate new ID if not present (first layer)
    const correlationId = req.headers['x-request-id'] || uuidv4();
    req.headers['x-request-id'] = correlationId; // Propagate to downstream services
    
    logger.info({ id: correlationId, method: req.method, url: req.originalUrl }, 'Gateway Incoming');
    next();
});

// 3. Authentication & Context Propagation Middleware
const authMiddleware = (req, res, next) => {
    // Whitelist public routes (login, register, /health)
    if (req.path.includes('/login') || req.path.includes('/register') || req.path.includes('/health')) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Propagate user context downstream via custom headers
        req.headers['x-user-id'] = decoded.userId;
        req.headers['x-user-role'] = decoded.role;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

app.use(authMiddleware);

// 4. Routing/Proxy Setup (Service Discovery via Docker DNS)
const proxyConfig = (target) => ({ 
    target, 
    changeOrigin: true, 
    pathRewrite: { '^/api/v1': '/api/v1' }, // Ensure version is passed through
    onProxyReq: (proxyReq, req) => {
        // Log request being forwarded
        logger.info({ id: req.correlationId, target: target, path: req.path }, 'Proxying Request');
    }
});

// Path-based routing for version 1
app.use('/api/v1/users', createProxyMiddleware(proxyConfig('http://user:3001')));
app.use('/api/v1/auth', createProxyMiddleware(proxyConfig('http://user:3001')));
app.use('/api/v1/posts', createProxyMiddleware(proxyConfig('http://post:3002')));
app.use('/api/v1/comments', createProxyMiddleware(proxyConfig('http://comment:3003')));

// Start Server
app.listen(PORT, () => {
    logger.info(`🚀 API Gateway running on port ${PORT}`);
});