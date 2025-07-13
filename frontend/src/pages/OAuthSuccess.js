import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setToken(token);
      // Fetch user profile immediately after setting token
      axios.get('http://localhost:5000/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setUser(res.data);
          showToast('Google login successful!', 'success');
          navigate('/');
        })
        .catch(() => {
          showToast('Google login failed: Could not fetch profile', 'error');
          navigate('/login');
        });
    } else {
      showToast('Google login failed: No token received', 'error');
      navigate('/login');
    }
    // eslint-disable-next-line
  }, [location.search, navigate, setToken, setUser, showToast]);

  return null;
}

export default OAuthSuccess; 