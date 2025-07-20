const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const multer = require('multer');
const path = require('path');
const jwtMiddleware = require('../middleware/auth');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Get profile
router.get('/', jwtMiddleware, profileController.getProfile);

// Update profile (with optional photo upload)
router.put('/', jwtMiddleware, upload.single('profilePhoto'), profileController.updateProfile);

// Change password
router.put('/change-password', jwtMiddleware, profileController.changePassword);

// Delete account
router.delete('/', jwtMiddleware, profileController.deleteAccount);

// Add endpoints for budget and availableBalance
router.get('/finance', jwtMiddleware, profileController.getFinance);
router.put('/finance', jwtMiddleware, profileController.updateFinance);

// --- SESSION MANAGEMENT ENDPOINTS ---
// List all sessions for the current user
router.get('/sessions', jwtMiddleware, async (req, res) => {
  try {
    const store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions'
    });
    const client = await mongoose.connection.getClient();
    const sessions = await client
      .db()
      .collection('sessions')
      .find({})
      .toArray();
    // Filter sessions belonging to this user
    const userSessions = sessions
      .map(sess => ({
        ...sess,
        session: JSON.parse(sess.session)
      }))
      .filter(sess => sess.session?.passport?.user === req.user.id)
      .map(sess => ({
        _id: sess._id,
        lastActivity: sess.session?.cookie?.expires,
        userAgent: sess.session?.userAgent,
        createdAt: sess.session?.createdAt,
        isCurrent: req.sessionID === sess._id.toString()
      }));
    res.json(userSessions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: err.message });
  }
});

// Delete a specific session
router.delete('/sessions/:sessionId', jwtMiddleware, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const client = await mongoose.connection.getClient();
    await client.db().collection('sessions').deleteOne({ _id: sessionId });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete session', error: err.message });
  }
});

// Delete all sessions except current
router.delete('/sessions', jwtMiddleware, async (req, res) => {
  try {
    const client = await mongoose.connection.getClient();
    const sessions = await client.db().collection('sessions').find({}).toArray();
    const userSessions = sessions
      .map(sess => ({ ...sess, session: JSON.parse(sess.session) }))
      .filter(sess => sess.session?.passport?.user === req.user.id);
    const sessionsToDelete = userSessions.filter(sess => sess._id.toString() !== req.sessionID);
    const idsToDelete = sessionsToDelete.map(sess => sess._id);
    if (idsToDelete.length > 0) {
      await client.db().collection('sessions').deleteMany({ _id: { $in: idsToDelete } });
    }
    res.json({ message: 'Other sessions deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete other sessions', error: err.message });
  }
});

module.exports = router; 