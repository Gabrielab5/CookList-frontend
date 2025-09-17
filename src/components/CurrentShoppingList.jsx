import React, { useState, useEffect } from 'react';

const CurrentShoppingList = ({ onViewList }) => {
  const [currentList, setCurrentList] = useState(null);

  // Load current shopping list from localStorage
  useEffect(() => {
    const currentListData = localStorage.getItem('currentShoppingList');
    if (currentListData) {
      try {
        const parsedList = JSON.parse(currentListData);
        setCurrentList(parsedList);
      } catch (error) {
        console.error('Error parsing current shopping list:', error);
      }
    }
  }, []);

  // Get statistics for the current list
  const getListStats = (list) => {
    const totalItems = list.items.length;
    const completedItems = list.items.filter(item => item.checked).length;
    const remainingItems = totalItems - completedItems;
    
    return { totalItems, completedItems, remainingItems };
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentList) {
    return null;
  }

  const stats = getListStats(currentList);
  const progressPercentage = stats.totalItems > 0 ? (stats.completedItems / stats.totalItems) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Current Shopping List</h3>
          <p className="text-gray-600 text-sm">
            Created {formatDate(currentList.createdAt)} • From {currentList.recipes.length} recipe{currentList.recipes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onViewList}
          className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200 text-sm"
        >
          Show List
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {stats.completedItems} / {stats.totalItems} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{stats.totalItems}</div>
          <div className="text-xs text-gray-600">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{stats.completedItems}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{stats.remainingItems}</div>
          <div className="text-xs text-gray-600">Remaining</div>
        </div>
      </div>

      {/* Recipes */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Recipes:</h4>
        <div className="flex flex-wrap gap-2">
          {currentList.recipes.slice(0, 3).map((recipe, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
            >
              {recipe}
            </span>
          ))}
          {currentList.recipes.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              +{currentList.recipes.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Quick Preview of Items */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Recent Items:</h4>
        <div className="space-y-1">
          {currentList.items.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                item.checked ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              <span className={`flex-1 ${
                item.checked ? 'text-green-600 line-through' : 'text-gray-700'
              }`}>
                {item.name}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {item.category}
              </span>
            </div>
          ))}
          {currentList.items.length > 3 && (
            <div className="text-xs text-gray-500 mt-2">
              +{currentList.items.length - 3} more items
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentShoppingList;
