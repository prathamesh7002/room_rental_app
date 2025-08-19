import React, { useState } from 'react';
import axios from 'axios';
import { config } from '../utils/config';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

const ReportModal = ({ isOpen, onClose, roomId, roomTitle }) => {
  const [reportData, setReportData] = useState({
    reason: '',
    description: '',
    anonymous: false
  });
  const [loading, setLoading] = useState(false);

  const reportReasons = [
    { value: 'fake_listing', label: 'Fake or Misleading Listing' },
    { value: 'inappropriate_content', label: 'Inappropriate Content' },
    { value: 'overpriced', label: 'Significantly Overpriced' },
    { value: 'spam', label: 'Spam or Duplicate Listing' },
    { value: 'safety_concerns', label: 'Safety Concerns' },
    { value: 'discrimination', label: 'Discriminatory Content' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportData.reason) {
      alert('Please select a reason for reporting');
      return;
    }

    setLoading(true);
    
    try {
      await axios.post(`${config.apiBaseUrl}/rooms/${roomId}/report/`, reportData);
      alert('Report submitted successfully. We\'ll review it within 24 hours.');
      onClose();
      setReportData({ reason: '', description: '', anonymous: false });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FlagIcon className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Report Listing</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Reporting:</p>
            <p className="font-medium text-gray-900">{roomTitle}</p>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for reporting <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {reportReasons.map((reason) => (
                <label key={reason.value} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={reportData.reason === reason.value}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details
            </label>
            <textarea
              name="description"
              value={reportData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Please provide more details about the issue..."
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="anonymous"
              checked={reportData.anonymous}
              onChange={handleInputChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label className="ml-3 text-sm text-gray-700">
              Submit report anonymously
            </label>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium mb-1">Important:</p>
                <p className="text-yellow-700">
                  False reports may result in account restrictions. Please only report genuine issues.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reportData.reason}
              className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
