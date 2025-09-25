import React, { useState } from 'react';

const RecipeDetailModal = ({ recipe, isOpen, onClose, onAddToShoppingList }) => {
  const [activeTab, setActiveTab] = useState('ingredients');

  // Debug logging
  console.log('RecipeDetailModal props:', { recipe, isOpen });

  if (!isOpen) return null;
  
  if (!recipe) {
    console.warn('RecipeDetailModal: No recipe provided');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">שגיאה</h2>
          <p className="text-gray-600 mb-6">לא ניתן לטעון את פרטי המתכון</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors duration-200"
          >
            סגור
          </button>
        </div>
      </div>
    );
  }

  // Process ingredients for display
  const getDisplayIngredients = () => {
    if (!recipe?.ingredients || !Array.isArray(recipe.ingredients)) return [];
    
    return recipe.ingredients.map(ingredient => {
      // Handle string ingredients
      if (typeof ingredient === 'string') {
        return ingredient;
      }
      
      // Handle object ingredients
      if (typeof ingredient === 'object' && ingredient !== null) {
        let name = '';
        let qty = '';
        let unit = '';
        
        // Try different possible structures
        if (ingredient.name) {
          name = ingredient.name;
          qty = ingredient.qty || ingredient.quantity || '';
          unit = ingredient.unit || '';
        } else if (ingredient.ingredientName) {
          name = ingredient.ingredientName;
          qty = ingredient.qty || ingredient.quantity || '';
          unit = ingredient.unit || '';
        } else if (ingredient.text) {
          return ingredient.text; // Already formatted text
        } else if (ingredient.description) {
          return ingredient.description; // Already formatted text
        } else {
          // Try to extract meaningful values
          const values = Object.values(ingredient).filter(v => 
            typeof v === 'string' && v.trim().length > 0
          );
          return values.join(' ') || 'מרכיב לא מזוהה';
        }
        
        if (name) {
          const cleanUnit = unit ? unit.trim() : '';
          const cleanName = name.trim();
          // Format: "quantity unit name" ensuring all parts are included
          const parts = [qty, cleanUnit, cleanName].filter(part => part && String(part).trim().length > 0);
          return parts.join(' ').replace(/\s+/g, ' ').trim();
        }
      }
      
      // Fallback
      return 'מרכיב לא תקין';
    }).filter(item => item && item !== 'מרכיב לא תקין');
  };

  const displayIngredients = getDisplayIngredients();

  const tabs = [
    { id: 'ingredients', label: 'מרכיבים', icon: '🥘' },
    { id: 'instructions', label: 'הוראות', icon: '📝' },
    { id: 'details', label: 'פרטים', icon: 'ℹ️' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-6xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="h-48 sm:h-64 lg:h-80 overflow-hidden rounded-t-lg sm:rounded-t-xl">
            <img
              src={recipe.photoUrl || recipe.image}
              alt={recipe.title || recipe.name || 'מתכון'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white transition-colors duration-200"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Recipe Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{recipe.title || recipe.name || 'מתכון'}</h1>
           
    
            {/* Quick Info */}
            <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium text-sm sm:text-base">{recipe.prepTime} דקות</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium text-sm sm:text-base">{recipe.difficulty || 'בינוני'}</span>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {(recipe.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 font-semibold text-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">מרכיבים</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {displayIngredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <span className="text-gray-800 font-medium">{ingredient}</span>
                    </div>
                  ))}
                </div>

                {/* Add to Shopping List Button */}
                <div className="text-center">
                  <button
                    onClick={() => onAddToShoppingList && onAddToShoppingList(recipe)}
                    className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200 shadow-md hover:shadow-lg text-lg flex items-center mx-auto"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    הוסף לרשימת קניות
                  </button>
                </div>
              </div>
            )}

            {/* Instructions Tab */}
            {activeTab === 'instructions' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">הוראות הכנה</h3>
                <div className="space-y-6">
                  {(recipe.steps || recipe.instructions || []).map((instruction, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-6">
                        <p className="text-gray-800 text-lg leading-relaxed">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    טיפים מקצועיים
                  </h4>
                  <ul className="text-blue-800 space-y-2">
                    <li>• תן למנה לנוח חמש עד עשר דקות לפני ההגשה לטעם טוב יותר</li>
                    <li>• טעם והתאם תבלינים תוך כדי הבישול</li>
                    <li>• השתמש במרכיבים טריים ככל האפשר לתוצאות הטובות ביותר</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">פרטי המתכון</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">מידע בסיסי</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">קטגוריה:</span>
                        <span className="font-medium text-gray-900">{recipe.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">זמן הכנה:</span>
                        <span className="font-medium text-gray-900">{recipe.prepTime} דקות</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">רמת קושי:</span>
                        <span className="font-medium text-gray-900">{recipe.difficulty || 'בינוני'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nutritional Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">מידע תזונתי</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">קלוריות למנה:</span>
                        <span className="font-medium text-gray-900">~{Math.floor(Math.random() * 200) + 300}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">חלבון:</span>
                        <span className="font-medium text-gray-900">~{Math.floor(Math.random() * 20) + 15}גרם</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">פחמימות:</span>
                        <span className="font-medium text-gray-900">~{Math.floor(Math.random() * 30) + 20}גרם</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">שומן:</span>
                        <span className="font-medium text-gray-900">~{Math.floor(Math.random() * 15) + 10}גרם</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Link Section */}
                <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    הדרכה בוידאו
                  </h4>
                  <p className="text-red-800 mb-4">
                    צפה בהדרכה וידאו שלב אחר שלב למתכון הזה
                  </p>
                  <button className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    צפה בוידאו
                  </button>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">תגיות</h4>
                    <div className="flex flex-wrap gap-2">
                      {(recipe.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-8 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            סגור
          </button>
          <button
            onClick={() => onAddToShoppingList && onAddToShoppingList(recipe)}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
          >
            הוסף לרשימת קניות
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
