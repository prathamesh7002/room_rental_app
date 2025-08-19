import React from 'react';
import {
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const ContactButtons = ({ owner, room }) => {
  const handleCall = () => {
    if (owner.phone) {
      window.open(`tel:${owner.phone}`, '_self');
    } else {
      alert('Phone number not available');
    }
  };

  const handleWhatsApp = () => {
    if (owner.phone) {
      const message = encodeURIComponent(
        `Hi! I'm interested in your room listing: ${room.title} (₹${room.rent}/month) at ${room.location}. Can we discuss more details?`
      );
      window.open(`https://wa.me/${owner.phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    } else {
      alert('WhatsApp contact not available');
    }
  };

  const handleEmail = () => {
    if (owner.email) {
      const subject = encodeURIComponent(`Inquiry about: ${room.title}`);
      const body = encodeURIComponent(
        `Hi ${owner.first_name},\n\nI'm interested in your room listing:\n\nTitle: ${room.title}\nRent: ₹${room.rent}/month\nLocation: ${room.location}\n\nCould you please provide more details?\n\nThank you!`
      );
      window.open(`mailto:${owner.email}?subject=${subject}&body=${body}`, '_self');
    } else {
      alert('Email not available');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: room.title,
      text: `Check out this room: ${room.title} - ₹${room.rent}/month at ${room.location}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Room link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Room link copied to clipboard!');
      } catch (clipboardError) {
        alert('Unable to share or copy link');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Contact Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleCall}
          className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium shadow-lg"
        >
          <PhoneIcon className="h-5 w-5 mr-2" />
          Call Now
        </button>
        
        <button
          onClick={handleWhatsApp}
          className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium shadow-lg"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
          WhatsApp
        </button>
      </div>

      {/* Secondary Contact Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleEmail}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <EnvelopeIcon className="h-5 w-5 mr-2" />
          Send Email
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
        >
          <ShareIcon className="h-5 w-5 mr-2" />
          Share Room
        </button>
      </div>

      {/* Owner Contact Info */}
      <div className="bg-gray-50 rounded-xl p-4 border">
        <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-2" />
            <span>{owner.phone || 'Phone not provided'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            <span>{owner.email || 'Email not provided'}</span>
          </div>
        </div>
        
        {/* Response Time */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Usually responds within 2 hours
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h5 className="font-medium text-yellow-800 mb-2">Safety Tips</h5>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Always visit the property before making any payment</li>
          <li>• Verify the owner's identity and documents</li>
          <li>• Never share personal financial information</li>
          <li>• Use our in-app chat for initial communication</li>
        </ul>
      </div>
    </div>
  );
};

export default ContactButtons;
