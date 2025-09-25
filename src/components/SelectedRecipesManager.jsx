import React from 'react';

const SelectedRecipesManager = ({ selectedRecipes, onRemoveRecipe, onClearAll, onGenerateShoppingList, onClearCart }) => {
  if (selectedRecipes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
          מתכונים נבחרים לרשימת קניות ({selectedRecipes.length})
        </h3>
        <div className="flex gap-3">
          {onClearCart && (
            <button
              onClick={onClearCart}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
              title="מחק עגלת קניות נוכחית"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              מחק עגלה
            </button>
          )}
          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
          >
            נקה הכל
          </button>
          <button
            onClick={onGenerateShoppingList}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm sm:text-base"
          >
            צור רשימת קניות
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {selectedRecipes.map((recipe, index) => (
          <div
            key={recipe._id || recipe.id || `selected-${index}`}
            className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-green-500 text-white rounded-full p-1 flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">
                {recipe.title || recipe.name || 'מתכון ללא שם'}
              </span>
            </div>
            <button
              onClick={() => onRemoveRecipe(recipe)}
              className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors duration-200 p-1"
              title="הסר מהרשימה"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedRecipesManager;
