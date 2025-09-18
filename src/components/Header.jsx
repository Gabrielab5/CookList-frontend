import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            {/* Logo Icon */}
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                {/* Chef Hat */}
                <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 2.8 1.3 3.8-.8.2-1.3 1-1.3 1.8v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-.8-.5-1.6-1.3-1.8.8-1 1.3-2.3 1.3-3.8 0-3.5-2.5-6-6-6z"/>
                {/* Cooking Pot */}
                <path d="M8 16h8v2H8v-2z" fill="white" opacity="0.8"/>
                {/* Steam */}
                <path d="M10 14c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1zm4 0c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1-.5 1-1 1z" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              CookList
            </h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
            <button
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-sm sm:text-base lg:text-lg px-2 py-1 rounded-md hover:bg-orange-50"
            >
              מתכונים
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-sm sm:text-base lg:text-lg px-2 py-1 rounded-md hover:bg-orange-50"
            >
              מועדפים
            </button>
            <button
              onClick={() => navigate('/shopping-history')}
              className="hidden sm:block text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-sm sm:text-base lg:text-lg px-2 py-1 rounded-md hover:bg-orange-50"
            >
              היסטוריית קניות
            </button>
            <button
              onClick={() => navigate('/shopping-history')}
              className="sm:hidden text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-sm px-2 py-1 rounded-md hover:bg-orange-50"
              title="היסטוריית קניות"
            >
              היסטוריה
            </button>
            
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-gray-700 text-sm font-medium hidden sm:block">
                  {user.displayName || user.email}
                </span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-sm sm:text-base lg:text-lg px-2 py-1 rounded-md hover:bg-orange-50"
            >
              התנתק
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
