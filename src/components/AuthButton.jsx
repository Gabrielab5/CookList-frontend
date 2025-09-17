import React from 'react';

const AuthButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  icon: Icon,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'w-full px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ease-in-out flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-500/20 shadow-md hover:shadow-lg',
    google: 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-md hover:shadow-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <span className="font-medium">{children}</span>
    </button>
  );
};

export default AuthButton;
