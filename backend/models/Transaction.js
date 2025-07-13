const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  receiptPhoto: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema); 