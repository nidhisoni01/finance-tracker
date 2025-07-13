import { Link } from 'react-router-dom';

export default function ChangePassword() {
  return (
    <div className="p-8 bg-gray-50 dark:bg-black min-h-screen max-w-xl mx-auto">
      <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block">&larr; Back to Settings</Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Change Password</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-4">
        <div className="text-gray-500 dark:text-gray-400">Password change coming soon...</div>
      </div>
    </div>
  );
} 