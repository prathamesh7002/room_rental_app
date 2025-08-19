import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../utils/config';
import {
  DocumentTextIcon,
  CameraIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const IDVerification = ({ user, onVerificationUpdate }) => {
  const [documents, setDocuments] = useState({
    id_front: null,
    id_back: null,
    address_proof: null
  });
  const [previews, setPreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(user?.verification_status || 'not_submitted');

  const documentTypes = [
    {
      key: 'id_front',
      label: 'ID Card Front',
      description: 'Front side of Aadhaar, PAN, or Driving License',
      required: true
    },
    {
      key: 'id_back',
      label: 'ID Card Back',
      description: 'Back side of your ID document',
      required: true
    },
    {
      key: 'address_proof',
      label: 'Address Proof',
      description: 'Utility bill, bank statement, or rental agreement',
      required: false
    }
  ];

  const handleFileSelect = (documentType, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please select an image or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB');
      return;
    }

    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [documentType]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({
        ...prev,
        [documentType]: 'PDF file selected'
      }));
    }
  };

  const submitVerification = async () => {
    if (!documents.id_front || !documents.id_back) {
      alert('Please upload both front and back of your ID');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await axios.post(`${config.apiBaseUrl}/auth/verify-identity/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setVerificationStatus('pending');
      if (onVerificationUpdate) {
        onVerificationUpdate('pending');
      }
      
      alert('Documents submitted successfully! Verification typically takes 24-48 hours.');
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case 'verified':
        return {
          icon: CheckCircleIcon,
          text: 'Verified',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'pending':
        return {
          icon: ClockIcon,
          text: 'Under Review',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'rejected':
        return {
          icon: XCircleIcon,
          text: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          icon: DocumentTextIcon,
          text: 'Not Submitted',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center mb-6">
        <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ID Verification</h2>
          <p className="text-gray-600">Verify your identity to build trust with renters</p>
        </div>
      </div>

      {/* Current Status */}
      <div className={`flex items-center p-4 rounded-xl mb-6 ${statusDisplay.bgColor}`}>
        <StatusIcon className={`h-6 w-6 mr-3 ${statusDisplay.color}`} />
        <div>
          <p className={`font-semibold ${statusDisplay.color}`}>
            Verification Status: {statusDisplay.text}
          </p>
          {verificationStatus === 'pending' && (
            <p className="text-sm text-gray-600">
              Your documents are being reviewed. You'll be notified once verification is complete.
            </p>
          )}
          {verificationStatus === 'rejected' && (
            <p className="text-sm text-red-600">
              Your documents were rejected. Please upload clear, valid documents and try again.
            </p>
          )}
          {verificationStatus === 'verified' && (
            <p className="text-sm text-green-600">
              Your identity has been verified! You now have a verified badge on your profile.
            </p>
          )}
        </div>
      </div>

      {/* Document Upload Section */}
      {(verificationStatus === 'not_submitted' || verificationStatus === 'rejected') && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Why verify your identity?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Get a verified badge on your profile</li>
              <li>• Build trust with potential renters</li>
              <li>• Higher visibility in search results</li>
              <li>• Access to premium features</li>
            </ul>
          </div>

          <div className="space-y-4">
            {documentTypes.map((docType) => (
              <div key={docType.key} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {docType.label}
                      {docType.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileSelect(docType.key, e.target.files[0])}
                    className="hidden"
                    id={`file-${docType.key}`}
                  />
                  <label
                    htmlFor={`file-${docType.key}`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <CameraIcon className="h-5 w-5 mr-2" />
                    Choose File
                  </label>
                  
                  {previews[docType.key] && (
                    <div className="flex items-center text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      File selected
                    </div>
                  )}
                </div>

                {previews[docType.key] && typeof previews[docType.key] === 'string' && previews[docType.key] !== 'PDF file selected' && (
                  <div className="mt-3">
                    <img
                      src={previews[docType.key]}
                      alt={`${docType.label} preview`}
                      className="max-w-xs h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">Important Guidelines:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ensure documents are clear and readable</li>
              <li>• All corners of the document should be visible</li>
              <li>• Documents should be valid and not expired</li>
              <li>• File formats: JPG, PNG, PDF (max 10MB each)</li>
            </ul>
          </div>

          <button
            onClick={submitVerification}
            disabled={uploading || !documents.id_front || !documents.id_back}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting Documents...
              </div>
            ) : (
              'Submit for Verification'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default IDVerification;
