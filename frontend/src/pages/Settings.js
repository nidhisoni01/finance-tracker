import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
      <button
        className="w-full flex justify-between items-center p-6 text-xl font-semibold focus:outline-none text-gray-800 dark:text-gray-200"
        onClick={() => setOpen(o => !o)}
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${open ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>▾</span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

// Helper to parse browser/OS from userAgent
function parseUserAgent(ua) {
  if (!ua) return 'Unknown device';
  // Simple parsing for common browsers/OS
  let browser = 'Unknown browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'Internet Explorer';

  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'Mac OS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} on ${os}`;
}

export default function Settings() {
  const { user, token, setUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pwFields, setPwFields] = useState({ current: '', new: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [profileFields, setProfileFields] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  
  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  // Session management state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [loggingOutSession, setLoggingOutSession] = useState(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/transactions/export/csv', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        // Get the filename from the response headers
        const contentDisposition = res.headers.get('content-disposition');
        const filename = contentDisposition 
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
          : `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        
        // Create blob and download
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        setPwMsg({ type: 'success', text: 'CSV file downloaded successfully!' });
        setTimeout(() => setPwMsg(null), 3000);
      } else {
        const errorData = await res.json();
        setPwMsg({ type: 'error', text: errorData.message || 'Failed to export CSV' });
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setExporting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      
      if (res.ok) {
        // Account deleted successfully, logout user
        logout();
        // Redirect to login page
        window.location.href = '/login';
      } else {
        const errorData = await res.json();
        setDeleteError(errorData.message || 'Failed to delete account');
      }
    } catch (err) {
      setDeleteError('Network error. Please try again.');
    } finally {
      setDeleting(false);
    }
  };
  
  const handleDelete = () => {
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError(null);
  };
  
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError(null);
  };
  
  const handlePwChange = e => setPwFields({ ...pwFields, [e.target.name]: e.target.value });
  const handlePwSubmit = async e => {
    e.preventDefault();
    setPwMsg(null);
    if (!pwFields.current || !pwFields.new || !pwFields.confirm) {
      setPwMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (pwFields.new !== pwFields.confirm) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: pwFields.current, newPassword: pwFields.new })
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ type: 'success', text: data.message || 'Password changed successfully.' });
        setPwFields({ current: '', new: '', confirm: '' });
      } else {
        setPwMsg({ type: 'error', text: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPwLoading(false);
    }
  };
  const handleProfileChange = e => setProfileFields({ ...profileFields, [e.target.name]: e.target.value });
  const handlePhotoChange = e => setProfilePhoto(e.target.files[0]);
  const handleProfileSubmit = async e => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileFields.name);
      formData.append('email', profileFields.email);
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
        setProfileEdit(false);
        setProfilePhoto(null);
        setProfileFields({ name: data.name, email: data.email });
        setUser(data); // Update user context globally
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const res = await fetch('/api/profile/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      } else {
        setSessionsError('Failed to fetch sessions');
      }
    } catch (err) {
      setSessionsError('Network error');
    } finally {
      setSessionsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchSessions();
  }, [token, fetchSessions]);

  // Logout a specific session
  const handleLogoutSession = async (sessionId) => {
    setLoggingOutSession(sessionId);
    try {
      const res = await fetch(`/api/profile/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
      }
    } finally {
      setLoggingOutSession(null);
    }
  };

  // Logout all other sessions
  const handleLogoutAllOther = async () => {
    setLoggingOutAll(true);
    try {
      const res = await fetch('/api/profile/sessions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
      }
    } finally {
      setLoggingOutAll(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Settings</h1>
      <div className="max-w-4xl mx-auto">
        <AccordionSection title="Password" defaultOpen={false}>
          <div className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Change Password</div>
          <div className="text-gray-500 dark:text-gray-400 mb-4">If you wish to change your password, you can change from here.</div>
          <form className="flex flex-col gap-4" onSubmit={handlePwSubmit}>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Enter current password</label>
              <input type="password" name="current" value={pwFields.current} onChange={handlePwChange} className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Enter new password</label>
                <input type="password" name="new" value={pwFields.new} onChange={handlePwChange} className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Confirm password</label>
                <input type="password" name="confirm" value={pwFields.confirm} onChange={handlePwChange} className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" />
              </div>
            </div>
            <button type="submit" className="mt-2 px-6 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition w-fit" disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Submit'}
            </button>
            {pwMsg && (
              <div className={`mt-2 text-sm font-semibold ${pwMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{pwMsg.text}</div>
            )}
          </form>
        </AccordionSection>
        <AccordionSection title="Profile">
          <div className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Profile Info</div>
          <form className="flex flex-col gap-4" onSubmit={handleProfileSubmit}>
            <div className="flex items-center gap-4 mb-2">
              <img
                src={profilePhoto ? URL.createObjectURL(profilePhoto) : (user?.profilePhoto ? (user.profilePhoto.startsWith('http') ? user.profilePhoto : `/` + user.profilePhoto.replace(/\\/g, '/')) : 'https://ui-avatars.com/api/?name=User')}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
              <div>
                <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Change Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="block text-gray-700 dark:text-gray-300" />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" name="name" value={profileFields.name} onChange={handleProfileChange} className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" name="email" value={profileFields.email} onChange={handleProfileChange} className="w-full p-2 border rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700" required />
            </div>
            <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition w-fit" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
            {profileMsg && (
              <div className={`mt-2 text-sm font-semibold ${profileMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{profileMsg.text}</div>
            )}
          </form>
        </AccordionSection>
        <AccordionSection title="Manage Devices">
          {sessionsLoading ? (
            <div className="text-gray-500 dark:text-gray-400">Loading sessions...</div>
          ) : sessionsError ? (
            <div className="text-red-500 dark:text-red-400">{sessionsError}</div>
          ) : (
            <>
              {sessions.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No active sessions found.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {sessions.map(sess => (
                    <div key={sess._id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg ${sess.isCurrent ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-gray-200 dark:bg-gray-800'}`}>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{sess.isCurrent ? 'This device' : 'Other device'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{parseUserAgent(sess.userAgent)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Session ID: {sess._id}</span>
                        {sess.lastActivity && <span className="text-xs text-gray-500 dark:text-gray-400">Expires: {new Date(sess.lastActivity).toLocaleString()}</span>}
                        {sess.createdAt && <span className="text-xs text-gray-500 dark:text-gray-400">Created: {new Date(sess.createdAt).toLocaleString()}</span>}
                      </div>
                      {!sess.isCurrent && (
                        <button
                          className="mt-2 md:mt-0 px-4 py-2 rounded bg-rose-600 text-white font-semibold hover:bg-rose-700 transition disabled:opacity-60"
                          onClick={() => handleLogoutSession(sess._id)}
                          disabled={loggingOutSession === sess._id}
                        >
                          {loggingOutSession === sess._id ? 'Logging out...' : 'Log out'}
                        </button>
                      )}
                    </div>
                  ))}
                  {sessions.length > 1 && (
                    <button
                      className="mt-4 px-4 py-2 rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-200 dark:hover:bg-rose-800 transition disabled:opacity-60 w-fit"
                      onClick={handleLogoutAllOther}
                      disabled={loggingOutAll}
                    >
                      {loggingOutAll ? 'Logging out...' : 'Log out from all other devices'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </AccordionSection>
        <AccordionSection title="Theme">
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700 dark:text-gray-300">Light</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition"></div>
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
            </label>
            <span className="font-medium text-gray-700 dark:text-gray-300">Dark</span>
          </div>
        </AccordionSection>
        <AccordionSection title="Export Data">
          <button
            className="px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800 transition disabled:opacity-60 w-fit mb-2"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export as CSV'}
          </button>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">Download all your transactions as a CSV file with date, type, category, description, amount, and receipt information.</div>
          {pwMsg && pwMsg.text.includes('CSV') && (
            <div className={`text-sm font-semibold ${pwMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {pwMsg.text}
            </div>
          )}
        </AccordionSection>
        <AccordionSection title="Delete Account">
          <button
            className="px-4 py-2 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold hover:bg-rose-200 dark:hover:bg-rose-800 transition disabled:opacity-60 w-fit mb-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete My Account'}
          </button>
          <div className="text-xs text-gray-400 dark:text-gray-500">This action is irreversible. All your data, transactions, and files will be permanently deleted.</div>
        </AccordionSection>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Delete Account</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This action cannot be undone. All your data, transactions, and files will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Enter your password to confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Enter your password"
              />
            </div>
            {deleteError && (
              <div className="text-red-500 dark:text-red-400 text-sm mb-4">{deleteError}</div>
            )}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || !deletePassword}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
