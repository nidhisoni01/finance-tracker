import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'reports', label: 'Reports', icon: '📊' },
  { key: 'profile', label: 'Profile', icon: '👤' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ onSectionChange, activeSection }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-64 bg-white dark:bg-black shadow-lg flex flex-col">
      <div className="p-6 text-xl font-extrabold text-gray-900 dark:text-gray-100 flex flex-row items-center gap-2 flex-nowrap overflow-x-auto">
        <span className="text-3xl rounded-lg bg-white dark:bg-black p-2">📈</span>
        <span>FinTrack Pro</span>
      </div>
      <nav className="flex-1 flex flex-col gap-2 mt-4">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => onSectionChange(item.key)}
            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-colors text-left ${
              activeSection === item.key
                ? 'bg-gray-200 text-gray-900 dark:bg-black dark:text-gray-100'
                : 'text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      {/* Logout Button */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-colors text-left w-full text-red-600 dark:text-red-400 hover:bg-red-900/20"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
} 
