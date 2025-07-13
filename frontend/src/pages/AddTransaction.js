import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { useAuth } from '../context/AuthContext';

function AddTransaction({ onTransactionAdded }) {
  const { token } = useAuth();
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const res = await fetch('http://localhost:5000/api/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // setTransactions(data); // This line was removed as per the edit hint
  };

  const handleReceiptCropped = file => {
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('category', category);
    formData.append('date', date);
    if (receiptFile) formData.append('receipt', receiptFile);
    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const newTx = await res.json();
        setSuccess(true);
        setAmount('');
        setDescription('');
        setType('Expense');
        setCategory('Other');
        setDate(new Date().toISOString().slice(0, 10));
        setReceiptFile(null);
        setReceiptPreview(null);
        if (onTransactionAdded) onTransactionAdded(newTx);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to add transaction');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">💳</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Transaction</h2>
      </div>
      <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-900 p-5 rounded-3xl shadow-md flex flex-col gap-3 w-full" style={{minWidth: 0, maxWidth: 400}}>
        <div className="flex gap-2 items-center">
          <input 
            type="number" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            placeholder="Amount" 
            className="flex-1 h-10 p-2 px-4 border border-gray-800 rounded-full text-sm focus:ring-2 focus:ring-gray-700 focus:outline-none text-gray-900 bg-white dark:bg-gray-700" 
            required 
          />
          <select 
            value={type} 
            onChange={e => setType(e.target.value)} 
            className="flex-1 h-10 p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          className="h-10 p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:ring-2 focus:ring-gray-700 focus:outline-none text-gray-900 bg-white dark:bg-gray-700 w-full" 
          required 
          style={{minWidth:0}} 
        />
        <input 
          type="text" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Description" 
          className="p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-base focus:ring-2 focus:ring-gray-700 focus:outline-none text-gray-900 bg-white dark:bg-gray-700" 
          required 
        />
        <input 
          type="text" 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          placeholder="Category" 
          className="p-2 px-4 border border-gray-200 dark:border-gray-600 rounded-full text-base focus:ring-2 focus:ring-gray-700 focus:outline-none text-gray-900 bg-white dark:bg-gray-700" 
          required 
        />
        <div className="flex items-center gap-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Receipt</span>
          <ImageUploader label="" onImageCropped={handleReceiptCropped} previewUrl={receiptPreview} />
        </div>
        <button 
          type="submit" 
          className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-bold py-2 rounded-full hover:from-blue-500 hover:to-indigo-600 transition text-base mt-1 shadow" 
          disabled={loading}
        > 
          {loading ? 'Adding...' : 'Add'} 
        </button>
        {error && <div className="text-red-500 dark:text-red-400 font-semibold text-sm text-center mt-2">{error}</div>}
        {success && <div className="text-green-600 dark:text-green-400 font-semibold text-sm text-center">Transaction added!</div>}
      </form>
    </div>
  );
}
export default AddTransaction; 
