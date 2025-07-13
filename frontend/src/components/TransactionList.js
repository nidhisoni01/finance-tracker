import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import ImageUploader from './ImageUploader';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const categoryIcons = {
  Food: { icon: "🍽️", color: "bg-orange-100 text-orange-600" },
  Transport: { icon: "🚗", color: "bg-blue-100 text-blue-600" },
  Income: { icon: "💵", color: "bg-emerald-100 text-emerald-600" },
  Utilities: { icon: "⚡", color: "bg-yellow-100 text-yellow-600" },
  Shopping: { icon: "🛒", color: "bg-pink-100 text-pink-600" },
  Entertainment: { icon: "🎬", color: "bg-purple-100 text-purple-600" },
  Other: { icon: "❓", color: "bg-gray-100 text-gray-500" },
  Transportation: { icon: "🚗", color: "bg-blue-100 text-blue-600" },
};

export default function TransactionList({ transactions: initialTransactions }) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [toast, setToast] = useState(null);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(tx => tx.category));
    return ['All', ...Array.from(cats)];
  }, [transactions]);

  // Enhanced filter and sort logic
  const filteredTransactions = useMemo(() => {
    let txs = transactions.filter(tx => {
      const matchesSearch =
        tx.title.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        tx.description?.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'All' || tx.type === filterType;
      const matchesCategory = filterCategory === 'All' || tx.category === filterCategory;
      const matchesMinAmount = !filterMinAmount || Number(tx.amount) >= Number(filterMinAmount);
      const matchesMaxAmount = !filterMaxAmount || Number(tx.amount) <= Number(filterMaxAmount);
      const matchesStartDate = !filterStartDate || new Date(tx.date) >= new Date(filterStartDate);
      const matchesEndDate = !filterEndDate || new Date(tx.date) <= new Date(filterEndDate);
      return matchesSearch && matchesType && matchesCategory && matchesMinAmount && matchesMaxAmount && matchesStartDate && matchesEndDate;
    });
    // Sorting
    if (sortBy === 'date-desc') txs.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === 'date-asc') txs.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortBy === 'amount-desc') txs.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'amount-asc') txs.sort((a, b) => a.amount - b.amount);
    return txs;
  }, [transactions, search, filterType, filterCategory, filterMinAmount, filterMaxAmount, filterStartDate, filterEndDate, sortBy]);

  useEffect(() => {
    if (editTx) {
      setAmount(editTx.amount || '');
      setType(editTx.type || 'Expense');
      setDate(editTx.date ? editTx.date.slice(0, 10) : '');
      setDescription(editTx.description || '');
      setCategory(editTx.category || 'Other');
      setReceiptPreview(editTx.receiptPhoto ? (editTx.receiptPhoto.startsWith('http') ? editTx.receiptPhoto : `${API_BASE_URL}/${editTx.receiptPhoto.replace(/\\/g, '/')}`) : null);
      setReceiptFile(null);
      setEditError(null);
      setEditSuccess(false);
      setEditLoading(false);
    }
  }, [editTx]);

  const handleReceiptCropped = file => {
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  // Filter and search logic
  const openEdit = tx => {
    setEditTx(tx);
    setEditForm({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date ? tx.date.slice(0, 10) : '',
      description: tx.description || '',
    });
  };
  const closeEdit = () => {
    setEditTx(null);
    setEditForm({});
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    setEditError(null);
    setEditLoading(true);
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('category', category);
    formData.append('date', date);
    if (receiptFile) formData.append('receipt', receiptFile);
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${editTx._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const updated = await res.json();
        setTransactions(txs => txs.map(t => t._id === updated._id ? updated : t));
        setEditSuccess(true);
        setTimeout(() => {
          setEditSuccess(false);
          closeEdit();
        }, 1000);
      } else {
        const errData = await res.json();
        setEditError(errData.message || 'Failed to update transaction');
      }
    } catch (err) {
      setEditError('Network error. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete logic
  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions(txs => txs.filter(t => t._id !== id));
        setToast({ type: 'success', message: 'Transaction deleted!' });
      } else {
        setToast({ type: 'error', message: 'Failed to delete transaction.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-2xl shadow p-6 max-w-3xl mx-auto">
      {/* Toast notification */}
      {toast && (
        <div className={`mb-4 px-4 py-2 rounded text-white font-semibold ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>{toast.message}</div>
      )}
      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-center justify-between w-full">
        <div className="flex flex-col w-full md:w-64">
          <label htmlFor="search" className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search by title, category, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-2 border border-gray-800 rounded w-full md:w-64 bg-gray-100 dark:bg-black text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-700 focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="filter-type" className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">Type</label>
          <select id="filter-type" value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-gray-700 dark:focus:ring-gray-300 focus:outline-none">
            <option value="All">All</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="filter-category" className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">Category</label>
          <select id="filter-category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="p-2 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-gray-700 dark:focus:ring-gray-300 focus:outline-none">
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="sort-by" className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">Sort By</label>
          <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className="p-2 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-gray-700 dark:focus:ring-gray-300 focus:outline-none">
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
            <option value="amount-desc">Amount (High-Low)</option>
            <option value="amount-asc">Amount (Low-High)</option>
          </select>
        </div>
      </div>
      {loading && <div className="text-center text-gray-500 dark:text-gray-400 font-semibold">Loading...</div>}
      <ul>
        {filteredTransactions.map(tx => (
          <li
            key={tx._id || tx.id}
            className="flex items-center justify-between gap-4 py-3 px-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-xl min-h-[64px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Receipt thumbnail if present */}
              {tx.receiptPhoto && (
                <img
                  src={tx.receiptPhoto.startsWith('http') ? tx.receiptPhoto : `${API_BASE_URL}/${tx.receiptPhoto.replace(/\\/g, '/')}`}
                  alt="Receipt"
                  className="w-10 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer"
                  onClick={() => setPreviewUrl(tx.receiptPhoto.startsWith('http') ? tx.receiptPhoto : `${API_BASE_URL}/${tx.receiptPhoto.replace(/\\/g, '/')}`)}
                />
              )}
              <span className={`text-xl rounded-full w-9 h-9 flex items-center justify-center shrink-0 ${categoryIcons[tx.category]?.color || categoryIcons.Other.color}`}>
                {categoryIcons[tx.category]?.icon || categoryIcons.Other.icon}
              </span>
              <div className="min-w-0">
                <div className="font-semibold truncate text-base leading-tight text-gray-900 dark:text-white">{tx.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {tx.date ? new Date(tx.date).toLocaleDateString() : ''} • {tx.category}
                </div>
                {tx.description && <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{tx.description}</div>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 min-w-[100px]">
              <div
                className={`font-bold text-base ${
                  tx.type === "Income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                }`}
              >
                {tx.type === "Income" ? "+" : "-"}${tx.amount}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(tx)}
                  className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 text-xs font-semibold"
                >Edit</button>
                <button
                  onClick={() => handleDelete(tx._id || tx.id)}
                  className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800 text-xs font-semibold"
                >Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/* Modal for large preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 flex flex-col items-center relative">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <img
              src={previewUrl}
              alt="Receipt Large Preview"
              className="max-w-[80vw] max-h-[80vh] rounded-lg border border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>
      )}
      {/* Edit modal */}
      {editTx && (
        <div className="flex flex-col items-center justify-center fixed inset-0 z-50 bg-black bg-opacity-60">
          <form onSubmit={handleEditSubmit} className="bg-gray-50 dark:bg-gray-800 p-5 rounded-3xl shadow-md flex flex-col gap-3 w-full relative" style={{ minWidth: 0, maxWidth: 400 }}>
            {/* Modal header with title and close button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Transaction</h2>
              </div>
              <button
                onClick={closeEdit}
                type="button"
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-2xl font-bold ml-4"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="Amount" 
                className="flex-1 h-10 p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 focus:outline-none text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900" 
                required 
              />
              <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="flex-1 h-10 p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 focus:outline-none text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="h-10 p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 focus:outline-none text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 w-full" 
              required 
              style={{minWidth:0}} 
            />
            <input 
              type="text" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Description" 
              className="p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-base focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 focus:outline-none text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900" 
              required 
            />
            <input 
              type="text" 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              placeholder="Category" 
              className="p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-base focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 focus:outline-none text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900" 
              required 
            />
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Receipt</span>
              <ImageUploader label="" onImageCropped={handleReceiptCropped} previewUrl={receiptPreview} />
            </div>
            <button 
              type="submit" 
              className="bg-gray-400 text-white font-bold py-2 rounded-full hover:bg-gray-500 transition text-base mt-1 shadow" 
              disabled={editLoading}
            > 
              {editLoading ? 'Saving...' : 'Save Changes'} 
            </button>
            {editError && <div className="text-red-500 dark:text-red-400 font-semibold text-sm text-center mt-2">{editError}</div>}
            {editSuccess && <div className="text-green-600 dark:text-green-400 font-semibold text-sm text-center">Transaction updated!</div>}
          </form>
        </div>
      )}
    </div>
  );
} 
