require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory "DB"
const ACCOUNT = { username: 'alice', balance: 1000 };
const HARD_USER = { username: 'alice', password: 'pass123' };

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '1h';

// --------- ROUTES ---------

// Login route: issues JWT
app.post('/login', (req, res) => {
  console.log('Request body:', req.body); // Debug line
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (username !== HARD_USER.username || password !== HARD_USER.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ sub: username, role: 'user' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  res.json({ token, token_type: 'Bearer', expires_in: JWT_EXPIRES_IN });
});

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Malformed Authorization header' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      const status = err.name === 'TokenExpiredError' ? 401 : 403;
      return res.status(status).json({ message: 'Invalid or expired token' });
    }
    req.user = payload;
    next();
  });
}

// Protected route: get balance
app.get('/balance', authMiddleware, (req, res) => {
  if (req.user.sub !== ACCOUNT.username) return res.status(403).json({ message: 'Forbidden' });
  res.json({ username: ACCOUNT.username, balance: ACCOUNT.balance });
});

// Protected route: deposit money
app.post('/deposit', authMiddleware, (req, res) => {
  if (req.user.sub !== ACCOUNT.username) return res.status(403).json({ message: 'Forbidden' });

  const { amount } = req.body;
  const amt = Number(amount);

  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

  ACCOUNT.balance += amt;
  res.json({ message: 'Deposit successful', balance: ACCOUNT.balance });
});

// Protected route: withdraw money
app.post('/withdraw', authMiddleware, (req, res) => {
  if (req.user.sub !== ACCOUNT.username) return res.status(403).json({ message: 'Forbidden' });

  const { amount } = req.body;
  const amt = Number(amount);

  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });
  if (ACCOUNT.balance < amt) return res.status(400).json({ message: 'Insufficient balance' });

  ACCOUNT.balance -= amt;
  res.json({ message: 'Withdrawal successful', balance: ACCOUNT.balance });
});

// Optional: root route
app.get('/', (req, res) => res.send('Bank API is running'));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
