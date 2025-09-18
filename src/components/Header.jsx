import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout && onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              CookList
            </h1>
          </div>

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
