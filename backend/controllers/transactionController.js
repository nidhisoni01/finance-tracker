const Transaction = require('../models/Transaction');

// Add a transaction
exports.addTransaction = async (req, res) => {
  try {
    const { description, amount, type, date, category } = req.body;
    const transaction = new Transaction({
      user: req.user.id,
      title: description, // Use description as title
      amount,
      type,
      date,
      category,
      receiptPhoto: req.file ? 'uploads/receipts/' + req.file.filename : undefined
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all transactions for user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (req.file) {
      updates.receiptPhoto = 'uploads/receipts/' + req.file.filename;
    }
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updates,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Export transactions as CSV
exports.exportCSV = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    
    // Create CSV header
    const csvHeader = 'Date,Type,Category,Description,Amount,Receipt\n';
    
    // Create CSV rows
    const csvRows = transactions.map(transaction => {
      const date = new Date(transaction.date).toLocaleDateString();
      const type = transaction.type;
      const category = transaction.category;
      const description = transaction.title || '';
      const amount = transaction.amount.toFixed(2);
      const receipt = transaction.receiptPhoto ? 'Yes' : 'No';
      
      // Escape commas and quotes in CSV
      const escapeCSV = (str) => {
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      return `${escapeCSV(date)},${escapeCSV(type)},${escapeCSV(category)},${escapeCSV(description)},${escapeCSV(amount)},${escapeCSV(receipt)}`;
    }).join('\n');
    
    const csvContent = csvHeader + csvRows;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: 1 });
    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Calculate balance trend by month
    const trendMap = {};
    let runningBalance = 0;
    
    transactions.forEach(t => {
      const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!trendMap[month]) {
        trendMap[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'Income') {
        trendMap[month].income += t.amount;
      } else {
        trendMap[month].expense += t.amount;
      }
    });

    const balanceTrend = Object.keys(trendMap).sort().map(month => {
      const monthData = trendMap[month];
      runningBalance += monthData.income - monthData.expense;
      return {
        month,
        balance: runningBalance,
        income: monthData.income,
        expense: monthData.expense
      };
    });

    // Calculate spending by category
    const categorySpending = {};
    transactions.filter(t => t.type === 'Expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });

    const spendingByCategory = Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);

    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    res.json({
      balance,
      income: totalIncome,
      expenses: totalExpense,
      savingsRate,
      balanceTrend,
      spendingByCategory
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 