const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } else {
    res.status(501).json({ message: 'Google OAuth not configured' });
  }
});

router.get('/google/callback', (req, res, next) => {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication failed', error: err.message });
      }
      // Issue JWT and send user info
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      // Redirect to frontend with token
      res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
    });
  } else {
    res.status(501).json({ message: 'Google OAuth not configured' });
  }
});

module.exports = router;
  