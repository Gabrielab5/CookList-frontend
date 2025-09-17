import React from 'react';

const AuthInput = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  icon: Icon,
  error,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400 transition-colors duration-200" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full px-4 py-4 ${Icon ? 'pl-12' : 'pl-4'} 
            border-2 rounded-xl shadow-sm transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500
            hover:border-gray-400 hover:shadow-md
            ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'}
            placeholder-gray-500 text-gray-900 text-base font-medium
            bg-white backdrop-blur-sm
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
