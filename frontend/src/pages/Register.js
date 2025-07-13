import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function Register() {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    const success = await register(name, email, password);
    if (success) {
      showToast('Registration successful!', 'success');
      navigate('/');
    } else {
      showToast('Registration failed', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="bg-gray-100 dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-800">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-gray-100">Create Account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-gray-300 font-medium mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 border border-gray-800 rounded-xl focus:ring-2 focus:ring-gray-700 focus:outline-none bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-800 rounded-xl focus:ring-2 focus:ring-gray-700 focus:outline-none bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-800 rounded-xl focus:ring-2 focus:ring-gray-700 focus:outline-none bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white font-bold p-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 mt-2" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          {error && <div className="text-red-500 dark:text-red-400 text-center font-semibold">{error}</div>}
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register; 