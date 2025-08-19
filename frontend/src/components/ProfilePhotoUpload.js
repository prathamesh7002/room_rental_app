import React, { useState, useRef } from 'react';
import {
  CameraIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const ProfilePhotoUpload = ({ currentPhoto, onPhotoChange, isVerified = false }) => {
  const [preview, setPreview] = useState(currentPhoto);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      await onPhotoChange(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <div className="relative group">
        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <UserIcon className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Upload Button Overlay */}
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed"
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <CameraIcon className="h-6 w-6 text-white" />
            )}
          </div>
        </button>

        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <CheckCircleIcon className="h-5 w-5 text-white" />
          </div>
        )}
        
        {/* Unverified Badge */}
        {!isVerified && currentPhoto && (
          <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
            <XCircleIcon className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center mt-3">
        <button
          onClick={triggerFileInput}
          disabled={uploading}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
        </button>
        {!isVerified && preview && (
          <p className="text-xs text-yellow-600 mt-1">
            Photo pending verification
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
