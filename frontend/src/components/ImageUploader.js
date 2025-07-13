import { useState } from 'react';

export default function ImageUploader({ label, onImageCropped, previewUrl }) {
  const [file, setFile] = useState(null);

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      onImageCropped(f);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
      />
      {(previewUrl || file) && (
        <img 
          src={previewUrl || (file && URL.createObjectURL(file))} 
          alt="Preview" 
          className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 mt-1" 
        />
      )}
    </div>
  );
}
