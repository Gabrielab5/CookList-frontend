import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const ShoppingHistory = () => {
  const navigate = useNavigate();
  const [shoppingLists, setShoppingLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);

  // Load shopping lists from localStorage
  useEffect(() => {
    const savedLists = localStorage.getItem('shoppingHistory');
    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);
        setShoppingLists(parsedLists);
      } catch (error) {
        console.error('Error parsing shopping history:', error);
      }
    }
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get statistics for a shopping list
  const getListStats = (list) => {
    const totalItems = list.items.length;
    const completedItems = list.items.filter(item => item.checked).length;
    const categories = [...new Set(list.items.map(item => item.category))].length;
    
    return { totalItems, completedItems, categories };
  };

  // Delete a shopping list
  const handleDeleteList = (listId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את רשימת הקניות הזו?')) {
      const updatedLists = shoppingLists.filter(list => list.id !== listId);
      setShoppingLists(updatedLists);
      localStorage.setItem('shoppingHistory', JSON.stringify(updatedLists));
    }
  };

  // View a shopping list
  const handleViewList = (list) => {
    setSelectedList(list);
  };

  // Close detailed view
  const handleCloseDetail = () => {
    setSelectedList(null);
  };

  // Group items by category for display
  const groupItemsByCategory = (items) => {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  };

  if (shoppingLists.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">היסטוריית קניות</h1>
                <p className="text-gray-600 mt-2">רשימות הקניות שהושלמו שלך</p>
              </div>
              <button
                onClick={() => navigate('/home')}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
              >
                חזור למתכונים
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
          <div className="text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">אין עדיין היסטוריית קניות</h2>
            <p className="text-gray-600 mb-6">השלם רשימת קניות כדי לראות אותה כאן.</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
            >
              צור רשימת קניות
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">היסטוריית קניות</h1>
              <p className="text-gray-600 mt-2">{shoppingLists.length} רשימת קניות שהושלמה{shoppingLists.length !== 1 ? 'ות' : ''}</p>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
            >
              חזור למתכונים
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Shopping Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shoppingLists.map((list) => {
            const stats = getListStats(list);
            return (
              <div key={list.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* List Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{list.name}</h3>
                  <p className="text-orange-100 text-sm">{formatDate(list.createdAt)}</p>
                </div>

                {/* List Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
                      <div className="text-sm text-gray-600">פריטים</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.completedItems}</div>
                      <div className="text-sm text-gray-600">הושלמו</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
                      <div className="text-sm text-gray-600">קטגוריות</div>
                    </div>
                  </div>

                  {/* Recipes */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">נוצר מהמתכונים:</h4>
                    <div className="flex flex-wrap gap-2">
                      {list.recipes.map((recipe, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                        >
                          {recipe}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewList(list)}
                      className="flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm"
                    >
                      צפה בפרטים
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                    >
                      מחק
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedList.name}</h2>
                <p className="text-gray-600 mt-1">{formatDate(selectedList.createdAt)}</p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Recipes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4" >הרשימה נוצרה מהמתכונים:</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedList.recipes.map((recipe, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-base font-medium"
                    >
                      {recipe}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shopping Items by Category */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">פריטי קניות:</h3>
                {Object.entries(groupItemsByCategory(selectedList.items)).map(([category, items]) => (
                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                      {category}
                      <span className="ml-3 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                        {items.length} פריט{items.length !== 1 ? 'ים' : ''}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-3 rounded-lg ${
                            item.checked ? 'bg-green-100' : 'bg-white'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                            item.checked
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                          }`}>
                            {item.checked && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`flex-1 ${
                              item.checked ? 'text-green-700 line-through' : 'text-gray-900'
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {item.quantity} מתכונים
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseDetail}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingHistory;
