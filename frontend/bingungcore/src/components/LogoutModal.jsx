// src/components/LogoutModal.jsx
import React from "react";
import ReactDOM from "react-dom";
import { LogOut } from "lucide-react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const modalContent = (
    // Modal Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[9999]"
      onClick={onClose} // Close modal if overlay is clicked
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
          <LogOut className="h-8 w-8 text-blue-600" />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Logout</h2>
        <p className="text-gray-500 mb-6">Are you sure you want to logout?</p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Render outside sidebar using portal
  return ReactDOM.createPortal(modalContent, document.body);
};

export default LogoutModal;
