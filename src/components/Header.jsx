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
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              CookList
            </h1>
          </div>

                 {/* Navigation */}
                 <nav className="flex items-center gap-8">
                   <button
                     onClick={() => navigate('/home')}
                     className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-lg"
                   >
                     מתכונים
                   </button>
                   <button
                     onClick={() => navigate('/favorites')}
                     className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-lg"
                   >
                     מועדפים
                   </button>
                   <button
                     onClick={() => navigate('/shopping-history')}
                     className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-lg"
                   >
                     היסטוריית קניות
                   </button>
                   <button
                     onClick={handleLogout}
                     className="text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200 text-lg"
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
