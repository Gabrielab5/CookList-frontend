import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getAllShoppingLists, getShoppingList, deleteShoppingList } from '../api';

const ShoppingHistory = () => {
  const navigate = useNavigate();
  const [shoppingLists, setShoppingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedListDetail, setSelectedListDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Load completed shopping lists from the server
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const lists = await getAllShoppingLists('done');
        if (!cancelled) setShoppingLists(lists);
      } catch (err) {
        console.error('Error loading shopping history:', err);
        if (!cancelled) setError('שגיאה בטעינת היסטוריית הקניות');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
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

  // Delete a shopping list
  const handleDeleteList = async (listId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את רשימת הקניות הזו?')) return;

    try {
      await deleteShoppingList(listId);
      setShoppingLists(prev => prev.filter(list => list.listId !== listId));
      if (selectedListId === listId) handleCloseDetail();
    } catch (err) {
      console.error('Error deleting shopping list:', err);
      alert('שגיאה במחיקת רשימת הקניות');
    }
  };

  // View a shopping list's full details
  const handleViewList = async (listId) => {
    setSelectedListId(listId);
    setSelectedListDetail(null);
    setDetailLoading(true);
    try {
      const detail = await getShoppingList(listId);
      setSelectedListDetail(detail);
    } catch (err) {
      console.error('Error loading shopping list detail:', err);
      alert('שגיאה בטעינת פרטי רשימת הקניות');
      setSelectedListId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Close detailed view
  const handleCloseDetail = () => {
    setSelectedListId(null);
    setSelectedListDetail(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="mr-3 text-gray-600">טוען היסטוריית קניות...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

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
          {shoppingLists.map((list) => (
            <div key={list.listId} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* List Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{list.title}</h3>
                <p className="text-orange-100 text-sm">{formatDate(list.createdAt)}</p>
              </div>

              {/* List Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{list.totalItems}</div>
                    <div className="text-sm text-gray-600">פריטים</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{list.completedItems}</div>
                    <div className="text-sm text-gray-600">הושלמו</div>
                  </div>
                </div>

                {/* Recipes */}
                {list.recipeTitles?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">נוצר מהמתכונים:</h4>
                    <div className="flex flex-wrap gap-2">
                      {list.recipeTitles.map((title, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                        >
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewList(list.listId)}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm"
                  >
                    צפה בפרטים
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.listId)}
                    className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
                  >
                    מחק
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedListId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {detailLoading || !selectedListDetail ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="mr-3 text-gray-600">טוען פרטים...</span>
              </div>
            ) : (
              <>
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedListDetail.title}</h2>
                    <p className="text-gray-600 mt-1">{formatDate(selectedListDetail.createdAt)}</p>
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
                  {selectedListDetail.recipeTitles?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">הרשימה נוצרה מהמתכונים:</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedListDetail.recipeTitles.map((title, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-base font-medium"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shopping Items by Department */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">פריטי קניות:</h3>
                    {Object.entries(selectedListDetail.byDept || {})
                      .filter(([, items]) => items.length > 0)
                      .map(([dept, items]) => (
                        <div key={dept} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-3 h-3 bg-orange-500 rounded-full ml-3"></span>
                            {dept}
                            <span className="mr-3 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                              {items.length} פריט{items.length !== 1 ? 'ים' : ''}
                            </span>
                          </h4>
                          <div className="space-y-2">
                            {items.map((item) => (
                              <div
                                key={item.itemId}
                                className={`flex items-center p-3 rounded-lg ${item.checked ? 'bg-green-100' : 'bg-white'
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 ml-3 flex items-center justify-center ${item.checked
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
                                  className={`flex-1 ${item.checked ? 'text-green-700 line-through' : 'text-gray-900'
                                    }`}
                                >
                                  {item.canonicalName}
                                </span>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {item.qty} {item.unit}
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingHistory;
