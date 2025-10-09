// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// ----------------------
// Connect to MongoDB
// ----------------------
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bankapp';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('🔗 MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ----------------------
// Mongoose User model
// ----------------------
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // plain for this exercise only (do NOT do this in prod)
  balance: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// ----------------------
// Logging middleware (global)
// ----------------------
function logger(req, res, next) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
  next();
}
app.use(logger);

// ----------------------
// Simple Bearer middleware
// Accepts ONLY exact token: "mysecrettoken"
// ----------------------
function checkMySecretBearer(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authorization header missing or incorrect" });
  }
  const token = auth.split(' ')[1];
  if (token !== 'mysecrettoken') {
    return res.status(401).json({ message: "Authorization header missing or incorrect" });
  }
  next();
}

// Public & protected route to reproduce your first screenshots
app.get('/public', (req, res) => {
  res.json({ message: "This is a public route. No authentication required." });
});

app.get('/protected', checkMySecretBearer, (req, res) => {
  res.json({ message: "You have accessed a protected route with a valid Bearer token!" });
});

// ----------------------
// JWT authentication (banking)
// ----------------------
// Login (hardcoded credentials are stored in DB via /seed)
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }
  const user = await User.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user._id.toString(), username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

function verifyJwt(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: "Token missing" });
  const token = auth.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded; // contains id and username
    next();
  });
}

// banking endpoints: require JWT
app.get('/balance', verifyJwt, async (req, res) => {
  const u = await User.findById(req.user.id);
  if (!u) return res.status(404).json({ message: "User not found" });
  res.json({ username: u.username, balance: u.balance });
});

app.post('/deposit', verifyJwt, async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
  const u = await User.findByIdAndUpdate(req.user.id, { $inc: { balance: amount } }, { new: true });
  res.json({ message: "Deposit successful", balance: u.balance });
});

app.post('/withdraw', verifyJwt, async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

  // atomic conditional debit: only succeed if balance >= amount
  const updated = await User.findOneAndUpdate(
    { _id: req.user.id, balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { new: true }
  );
  if (!updated) {
    return res.status(400).json({ message: "Insufficient funds" });
  }
  res.json({ message: "Withdraw successful", balance: updated.balance });
});

// ----------------------
// Transfer endpoint (no DB transactions)
// - debit is performed atomically (conditional $gte)
// - if credit fails we attempt to rollback the debit
// ----------------------
app.post('/transfer', verifyJwt, async (req, res) => {
  const fromId = req.user.id;
  const { toUsername, amount } = req.body;
  const amt = Number(amount);
  if (!toUsername || !amt || amt <= 0) return res.status(400).json({ message: "toUsername and positive amount required" });

  // Step 1: atomically debit sender if they have enough balance
  const debited = await User.findOneAndUpdate(
    { _id: fromId, balance: { $gte: amt } },
    { $inc: { balance: -amt } },
    { new: true }
  );

  if (!debited) {
    return res.status(400).json({ message: "Insufficient funds or sender not found" });
  }

  // Step 2: credit recipient
  const recipient = await User.findOneAndUpdate(
    { username: toUsername },
    { $inc: { balance: amt } },
    { new: true }
  );

  if (!recipient) {
    // recipient not found -> try to rollback (credit back sender)
    try {
      await User.findByIdAndUpdate(fromId, { $inc: { balance: amt } });
    } catch (rollbackErr) {
      console.error('Rollback failed after failed credit:', rollbackErr);
      return res.status(500).json({ message: "Critical: transfer partial failure and rollback failed. Please contact admin." });
    }
    return res.status(404).json({ message: "Recipient not found. Transfer rolled back." });
  }

  res.json({
    message: "Transfer successful",
    from: { username: debited.username, balanceAfter: debited.balance },
    to: { username: recipient.username, balanceAfter: recipient.balance }
  });
});

// ----------------------
// Seed route to create test users (safe to run during dev)
// ----------------------
app.post('/seed', async (req, res) => {
  await User.deleteMany({});
  const alice = new User({ username: 'alice', password: 'password123', balance: 1000 });
  const bob = new User({ username: 'bob', password: 'password123', balance: 500 });
  await alice.save();
  await bob.save();
  res.json({ message: 'Seeded users', users: [{ username: alice.username, balance: alice.balance }, { username: bob.username, balance: bob.balance }] });
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
