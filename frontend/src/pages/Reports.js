import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BalanceTrendChart from '../components/BalanceTrendChart';
import CategorySpendingChart from '../components/CategorySpendingChart';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function Reports() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ balanceTrend: [], spendingByCategory: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/transactions/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError('Failed to fetch report data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchStats();
  }, [token]);

  return (
    <div className="p-8 bg-gray-50 dark:bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Reports</h1>
      {loading && <div className="text-indigo-500 dark:text-indigo-400 font-semibold">Loading...</div>}
      {error && <div className="text-red-500 dark:text-red-400 font-semibold">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="font-medium text-gray-800 dark:text-white mb-4">Balance Trend</div>
          <div className="chart-container h-[300px]">
            <BalanceTrendChart data={stats.balanceTrend} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="font-medium text-gray-800 dark:text-white mb-4">Spending by Category</div>
          <div className="chart-container h-[300px] flex items-center justify-center">
            <CategorySpendingChart data={stats.spendingByCategory || []} />
          </div>
        </div>
      </div>
    </div>
  );
} 