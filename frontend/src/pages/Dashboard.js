import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import StatCard from '../components/StatCard';
import BalanceTrendChart from '../components/BalanceTrendChart';
import TransactionList from '../components/TransactionList';
import AddTransaction from './AddTransaction';
import CategorySpendingChart from '../components/CategorySpendingChart';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function Dashboard({ onNavigate }) {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savingsRate: 0,
    balanceTrend: [],
    spendingByCategory: []
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [budget, setBudget] = useState("");
  const [totalBalance, setTotalBalance] = useState("");
  const [displayedBudget, setDisplayedBudget] = useState("");
  const [displayedTotalBalance, setDisplayedTotalBalance] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch budget and available balance
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/profile/finance`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBudget("0");
        setTotalBalance("0");
        setDisplayedBudget(data.budget !== undefined && data.budget !== null ? String(data.budget) : "");
        setDisplayedTotalBalance(data.totalBalance !== undefined && data.totalBalance !== null ? String(data.totalBalance) : "");
      });
  }, [token]);

  const saveFinance = async () => {
    setSaving(true);
    const response = await fetch(`${API_BASE_URL}/api/profile/finance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        budget: budget === "" ? null : Number(budget),
        totalBalance: totalBalance === "" ? null : Number(totalBalance)
      })
    });
    setSaving(false);
    showToast('Budget and balance updated!', 'success');
    setTotalBalance("0");
    setBudget("0");
    // Only update stat cards if the backend returns new values
    if (response.ok) {
      const data = await response.json();
      setDisplayedBudget(data.budget !== undefined && data.budget !== null ? String(data.budget) : "");
      setDisplayedTotalBalance(data.totalBalance !== undefined && data.totalBalance !== null ? String(data.totalBalance) : "");
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard stats
        const statsRes = await fetch(`${API_BASE_URL}/api/transactions/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        // Fetch recent transactions
        const transactionsRes = await fetch(`${API_BASE_URL}/api/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(transactionsData.slice(0, 10)); // Show only recent 10
        }
      } catch (err) {
        setError(err.message);
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [token, showToast]);

  const handleTransactionAdded = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
    setShowAddTransaction(false);
  };

  if (loading) {
    return (
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-black">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-800 bg-gray-100 dark:bg-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-800 w-72 text-lg text-gray-900 dark:text-gray-100 placeholder-gray-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </span>
          </div>
          <div
            className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
            onClick={() => onNavigate && onNavigate('profile')}
            title="Go to Profile"
            aria-label="Go to Profile"
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE_URL}/${user.profilePhoto.replace(/\\/g, '/')}`}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <svg className="w-7 h-7 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
              </svg>
            )}
          </div>
        </div>
      </div>
      {/* Budget/Balance Editor */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Total Balance</label>
          <input
            type="number"
            value={totalBalance}
            onChange={e => setTotalBalance(e.target.value.replace(/[^\d.\-]/g, ""))}
            placeholder="0"
            className="p-2 border border-gray-300 dark:border-gray-700 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Budget</label>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value.replace(/[^\d.\-]/g, ""))}
            placeholder="0"
            className="p-2 border border-gray-300 dark:border-gray-700 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-row gap-2 mt-6 md:mt-0 self-end">
          <button
            onClick={saveFinance}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => { setTotalBalance("0"); setBudget("0"); }}
            className="bg-gray-700 text-gray-100 px-4 py-2 rounded hover:bg-gray-600 transition"
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10 w-full">
        <StatCard
          title="Total Balance"
          value={`$${displayedTotalBalance.toLocaleString()}`}
          icon={<span className="inline-block">💼</span>}
          color="text-indigo-500"
          className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <StatCard
          title="Budget"
          value={`$${displayedBudget.toLocaleString()}`}
          icon={<span className="inline-block">💰</span>}
          color="text-yellow-500"
          className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <StatCard
          title="Income"
          value={`$${stats.income.toLocaleString()}`}
          icon={<span className="inline-block">📈</span>}
          color="text-blue-500"
          className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <StatCard
          title="Expenses"
          value={`$${stats.expenses.toLocaleString()}`}
          icon={<span className="inline-block">📉</span>}
          color="text-rose-500"
          className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        <StatCard
          title="Savings Rate"
          value={`${stats.savingsRate}%`}
          icon={<span className="inline-block">🐷</span>}
          color="text-pink-500"
          className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
      </div>
      {/* Charts Section - Match reference HTML style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Balance Trend</h3>
            <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option>Last 7 Days</option>
              <option selected>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="chart-container h-[300px]">
            <BalanceTrendChart data={stats.balanceTrend} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Spending by Category</h3>
            <select className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option>Last 7 Days</option>
              <option selected>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="chart-container h-[300px] flex items-center justify-center">
            <CategorySpendingChart data={stats.spendingByCategory || []} />
          </div>
        </div>
      </div>
      {/* Recent Transactions Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="col-span-1 md:col-span-4 bg-white dark:bg-gray-900 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">All Transactions</div>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg transition"
              onClick={() => setShowAddTransaction(true)}
            >
              + Add Transaction
            </button>
          </div>
          {transactions.length > 0 ? (
            <TransactionList transactions={transactions} />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-center py-8">
              No transactions yet. 
              <button 
                onClick={() => setShowAddTransaction(true)}
                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
              >
                Add your first transaction
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-4 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
              onClick={() => setShowAddTransaction(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <AddTransaction embedded onTransactionAdded={handleTransactionAdded} />
          </div>
        </div>
      )}
    </main>
  );
} 