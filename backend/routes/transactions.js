const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const jwtMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/receipts'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Add transaction
router.post('/', jwtMiddleware, upload.single('receipt'), transactionController.addTransaction);

// Get all transactions
router.get('/', jwtMiddleware, transactionController.getTransactions);

// Update transaction
router.put('/:id', jwtMiddleware, upload.single('receipt'), transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', jwtMiddleware, transactionController.deleteTransaction);

// Get dashboard stats
router.get('/dashboard/stats', jwtMiddleware, transactionController.getDashboard);

// Export transactions as CSV
router.get('/export/csv', jwtMiddleware, transactionController.exportCSV);

module.exports = router; 