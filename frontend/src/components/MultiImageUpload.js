import React, { useState, useRef } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const MultiImageUpload = ({ images = [], onImagesChange, maxImages = 10 }) => {
  const [previews, setPreviews] = useState(images);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // Check if adding these files would exceed the limit
    if (previews.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    const newPreviews = [...previews];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = {
          id: Date.now() + Math.random(),
          file,
          url: e.target.result,
          isNew: true
        };
        newPreviews.push(preview);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
    
    // Call the parent callback with the updated images
    if (onImagesChange) {
      onImagesChange(newPreviews);
    }

    // Clear the input
    event.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedPreviews);
    
    if (onImagesChange) {
      onImagesChange(updatedPreviews);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const reorderImages = (dragIndex, hoverIndex) => {
    const draggedImage = previews[dragIndex];
    const newPreviews = [...previews];
    newPreviews.splice(dragIndex, 1);
    newPreviews.splice(hoverIndex, 0, draggedImage);
    
    setPreviews(newPreviews);
    if (onImagesChange) {
      onImagesChange(newPreviews);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Room Images</h3>
        <span className="text-sm text-gray-500">
          {previews.length}/{maxImages} images
        </span>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div
            key={preview.id || index}
            className="relative group aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
          >
            <img
              src={preview.url || preview.image}
              alt={`Room ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Remove Button */}
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>

            {/* Primary Badge */}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
                Primary
              </div>
            )}

            {/* Image Index */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Add More Button */}
        {previews.length < maxImages && (
          <button
            onClick={triggerFileInput}
            disabled={uploading}
            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <>
                <PlusIcon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <ArrowUpTrayIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-blue-800 font-medium mb-1">Image Upload Tips:</p>
            <ul className="text-blue-700 space-y-1">
              <li>• Upload up to {maxImages} high-quality images</li>
              <li>• First image will be used as the primary photo</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Maximum file size: 5MB per image</li>
              <li>• Show different angles and key features</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Drag and Drop Area */}
      {previews.length === 0 && (
        <div
          onClick={triggerFileInput}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload Room Images
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your images here, or click to browse
          </p>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Choose Images
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default MultiImageUpload;
