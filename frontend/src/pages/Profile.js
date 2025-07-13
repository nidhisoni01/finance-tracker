import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function Profile() {
  const { token, user, setUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [photo, setPhoto] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoUrlRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropLoading, setCropLoading] = useState(false);

  // Update preview when a new photo is selected
  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo);
      setPhotoPreview(url);
      photoUrlRef.current = url;
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPhotoPreview(null);
    }
  }, [photo]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      } catch (err) {
        setError(err.message);
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchProfile();
  }, [token, showToast]);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setShowCropModal(true);
    }
  };

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleApplyCrop = async () => {
    if (!photo || !croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(photo, croppedAreaPixels);
      // Convert Blob to File with a name for multer compatibility
      const croppedFile = new File([croppedImage], 'profile.jpg', { type: croppedImage.type });
      setPhoto(croppedFile);
      setShowCropModal(false);
    } catch (err) {
      showToast('Failed to crop image', 'error');
    }
  };

  const handleUpdateProfile = async e => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      if (photo) formData.append('profilePhoto', photo);
      
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      
      if (!res.ok) {
        const errData = await res.json();
        const errorMessage = errData.message || 'Failed to update profile';
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }
      
      const updated = await res.json();
      setProfile(updated);
      setFormSuccess('Profile updated successfully!');
      if (setUser) setUser(updated);
      showToast('Profile updated!', 'success');
      // Clear the photo state after successful upload
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const getProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${API_BASE_URL}/${photoPath.replace(/\\/g, '/')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 drop-shadow">Profile</h2>
      {loading && <Spinner />}
      {error && <div className="text-red-500 dark:text-red-400">{error}</div>}
      {profile && (
        <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100 dark:border-gray-700">
          <div className="w-full flex flex-col items-center -mt-16 mb-10 relative">
            <div className="w-32 h-32 flex items-center justify-center group relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-full object-cover"
                />
              ) : profile.profilePhoto ? (
                <img
                  src={getProfilePhotoUrl(profile.profilePhoto)}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              {!photoPreview && !profile.profilePhoto && (
                <span className="text-5xl text-white font-bold">{profile.name?.[0]?.toUpperCase() || '?'}</span>
              )}
              {/* Edit pill button on the right, slightly lower than center, overlapping the photo */}
              <label htmlFor="profilePhotoInput" className="absolute right-0 top-[65%] -translate-y-1/2 translate-x-1/3 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-lg rounded-full px-2 py-1 flex items-center gap-2 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-400 z-10" title="Change Photo" tabIndex={0}>
                <svg className="w-4 h-4 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414a1 1 0 01-1.263-1.263l1.414-4.243a4 4 0 01.828-1.414z" /></svg>
                <span className="text-gray-700 dark:text-gray-200 font-medium text-xs">Edit</span>
                <input
                  id="profilePhotoInput"
                  type="file"
                  name="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">{profile.name}</div>
          <div className="text-sm text-gray-400 dark:text-gray-500 text-center">{profile.email}</div>
          {/* Crop Modal */}
          {showCropModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center relative">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center text-gray-800 dark:text-white">Crop your photo</h3>
                <div className="relative w-full h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow">
                  <Cropper
                    image={photo ? URL.createObjectURL(photo) : undefined}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                  {cropLoading && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 flex items-center justify-center z-10">
                      <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 mt-4 w-full items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                </div>
                <div className="flex gap-4 mt-6 w-full">
                  <button onClick={() => setShowCropModal(false)} className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition text-base sm:text-lg">Cancel</button>
                  <button onClick={async () => { setCropLoading(true); await handleApplyCrop(); setCropLoading(false); }} className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition text-base sm:text-lg" disabled={cropLoading}>Apply</button>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 w-full mt-2">
            <span className="text-gray-300 font-medium">Name</span>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleFormChange}
              className="mt-1 p-3 border border-gray-800 rounded-xl w-full focus:ring-2 focus:ring-gray-700 focus:outline-none bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
            <label className="block">
              <span className="text-gray-300 font-medium">Email</span>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleFormChange}
                className="mt-1 p-3 border border-gray-800 rounded-xl w-full focus:ring-2 focus:ring-gray-700 focus:outline-none bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                required
              />
            </label>
            <button type="submit" className="bg-gray-200 text-gray-900 hover:bg-gray-300 border border-gray-300 dark:bg-black dark:text-gray-100 dark:hover:bg-gray-900 dark:border-gray-700 font-bold p-3 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 mt-2" disabled={formLoading}>
              {formLoading ? 'Updating...' : 'Update Profile'}
            </button>
            {formError && (
              <div className="text-red-500 dark:text-red-400 text-center font-semibold">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="text-emerald-500 dark:text-emerald-400 text-center font-semibold">
                {formSuccess}
              </div>
            )}
          </form>
          {/* Divider */}
          <div className="w-full flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Account Info</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {/* Account Info Section - single column */}
          <div className="flex flex-col gap-1 mt-6 text-sm text-gray-500 dark:text-gray-400 w-full border-t border-gray-200 dark:border-gray-800 pt-4">
            <div>
              <span className="font-medium">User ID:</span>
              <span className="ml-2">{profile._id || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">Joined:</span>
              <span className="ml-2">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; 