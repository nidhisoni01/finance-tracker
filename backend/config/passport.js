const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendLoginNotification } = require('../utils/mailer');

// Debug environment variables
console.log('Passport config - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('Passport config - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');

// Only configure Google OAuth if environment variables are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Configuring Google OAuth strategy...');
  
  passport.use('google', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback - Profile:', profile.emails[0].value);
      
      // Find or create user
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePhoto: profile.photos[0]?.value,
          password: Math.random().toString(36).slice(-8) // random password, not used
        });
        console.log('Created new user via Google OAuth:', user.email);
      } else {
        console.log('Found existing user via Google OAuth:', user.email);
      }
      // Send login notification email (non-blocking)
      if (user.email) {
        sendLoginNotification(user.email, user.name).catch(console.error);
      }
      return done(null, user);
    } catch (err) {
      console.error('Google OAuth error:', err);
      return done(err, null);
    }
  }));
  
  console.log('Google OAuth strategy configured successfully');
  console.log('Available passport strategies:', Object.keys(passport._strategies));
} else {
  console.warn('Google OAuth not configured: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
}

module.exports = passport; 