const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const enums = require('../../shared/enums.json');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post('/register', async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ ok: false, error: 'Authentication is not configured' });
    const { name, email, password } = req.body;
    const requestedRole = req.body.role || 'PRODUCER';
    if (!name || !email || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ ok: false, error: 'Name, email, and a password of at least 8 characters are required' });
    }
    if (!enums.roles.includes(requestedRole)) return res.status(400).json({ ok: false, error: 'Invalid role' });
    const user = await User.create({ name, email, role: requestedRole, passwordHash: await bcrypt.hash(password, 12) });
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.status(201).json({ ok: true, data: { user: publicUser(user), token } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ ok: false, error: 'Email is already registered' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) return res.status(500).json({ ok: false, error: 'Authentication is not configured' });
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password' });
    }
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    return res.json({ ok: true, data: { user: publicUser(user), token } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ ok: true, data: { user: publicUser(req.user) } }));

module.exports = router;