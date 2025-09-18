import React from 'react';

const AddRecipeButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 transition-all duration-200 hover:shadow-md text-lg"
    >
      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      הוסף מתכון
    </button>
  );
};

export default AddRecipeButton;
