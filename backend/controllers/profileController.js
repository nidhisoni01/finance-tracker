const User = require('../models/User');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile (name, email, photo)
exports.updateProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      email: req.body.email
    };
    
    if (req.file) {
      // Always save the relative path with forward slashes for frontend compatibility
      const relPath = 'uploads/' + req.file.filename;
      updates.profilePhoto = relPath;
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password before deletion
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Delete all user's transactions
    const transactions = await Transaction.find({ user: req.user.id });
    
    // Delete receipt files
    for (const transaction of transactions) {
      if (transaction.receiptPhoto) {
        const filePath = path.join(__dirname, '..', transaction.receiptPhoto);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error('Error deleting receipt file:', err);
        }
      }
    }
    
    // Delete user's profile photo
    if (user.profilePhoto) {
      const photoPath = path.join(__dirname, '..', user.profilePhoto);
      try {
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      } catch (err) {
        console.error('Error deleting profile photo:', err);
      }
    }
    
    // Delete all transactions
    await Transaction.deleteMany({ user: req.user.id });
    
    // Delete user account
    await User.findByIdAndDelete(req.user.id);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Get user's budget and available balance
exports.getFinance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      budget: user.budget, 
      availableBalance: user.availableBalance,
      totalBalance: user.totalBalance 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user's budget and available balance
exports.updateFinance = async (req, res) => {
  try {
    const { budget, availableBalance, totalBalance } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { budget, availableBalance, totalBalance },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      budget: user.budget, 
      availableBalance: user.availableBalance,
      totalBalance: user.totalBalance 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 