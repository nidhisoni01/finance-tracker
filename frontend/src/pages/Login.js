import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Handle JWT from Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      showToast('Google login successful!', 'success');
      navigate('/');
    }
  }, [navigate, showToast]);

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      showToast('Login successful!', 'success');
      navigate('/');
    } else {
      showToast('Invalid credentials', 'error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="bg-gray-100 dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-800">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-900 dark:text-gray-100">Welcome Back</h2>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 p-3 mb-4 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.65c-1.13-3.36-1.13-6.99 0-10.35l-7.98-6.2C.89 16.09 0 19.94 0 24c0 4.06.89 7.91 2.69 11.9l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.04 15.53-5.56l-7.19-5.6c-2.01 1.35-4.58 2.16-8.34 2.16-6.38 0-11.87-3.63-14.33-8.94l-7.98 6.2C6.71 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Login with Google
        </button>
        {/* Divider with OR */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700" />
          <span className="mx-4 text-gray-400 font-semibold">or</span>
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && (
            <div className="text-red-500 dark:text-red-400 text-center font-semibold">
              {error}
            </div>
          )}
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login; 