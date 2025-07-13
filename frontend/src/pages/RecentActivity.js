import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function RecentActivity() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.slice(0, 10));
        } else {
          setError('Failed to fetch transactions');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchTransactions();
  }, [token]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen w-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white pt-8 pl-8">Recent Activity</h2>
      {loading && <div className="text-indigo-500 dark:text-indigo-400 font-semibold pl-8">Loading...</div>}
      {error && <div className="text-red-500 dark:text-red-400 font-semibold pl-8">{error}</div>}
      <ul className="pl-8 pr-8">
        {transactions.map(tx => (
          <li key={tx._id || tx.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{tx.category === 'Food' ? '🍽️' : tx.category === 'Transport' ? '🚗' : tx.category === 'Income' ? '💵' : tx.category === 'Utilities' ? '⚡' : tx.category === 'Shopping' ? '🛒' : tx.category === 'Entertainment' ? '🎬' : '❓'}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{tx.title}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{tx.date ? new Date(tx.date).toLocaleDateString() : ''}</span>
            </div>
            <span className={`font-bold ${tx.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{tx.type === 'Income' ? '+' : '-'}${tx.amount}</span>
          </li>
        ))}
      </ul>
      {!loading && transactions.length === 0 && (
        <div className="text-gray-400 dark:text-gray-500 text-center py-8">No recent activity.</div>
      )}
    </div>
  );
} 