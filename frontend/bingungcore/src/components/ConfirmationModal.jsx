// src/components/ConfirmationModal.jsx

import React from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title = "Are you sure?", children, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    // We use z-[60] to ensure it appears on top of the other modal (which is z-50)
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 text-center w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-red-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>

        {/* Message/Children */}
        <div className="text-gray-500 mb-8 px-4">{children}</div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={onConfirm} className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
            {confirmText}
          </button>
          <button onClick={onClose} className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition-colors">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
