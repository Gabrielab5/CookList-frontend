import React, { useState } from 'react';

const RecipeDetailModal = ({ recipe, isOpen, onClose, onAddToShoppingList }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [servings, setServings] = useState(recipe?.servings || 4);

  if (!isOpen || !recipe) return null;

  // Calculate adjusted ingredients based on servings
  const getAdjustedIngredients = () => {
    if (!recipe?.ingredients) return [];
    const multiplier = servings / (recipe.servings || 4);
    return recipe.ingredients.map(ingredient => {
      // Try to extract quantity and unit from ingredient string
      const match = ingredient.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]*)\s*(.*)$/);
      if (match) {
        const [, quantity, unit, name] = match;
        const adjustedQuantity = parseFloat(quantity) * multiplier;
        return `${adjustedQuantity.toFixed(adjustedQuantity % 1 === 0 ? 0 : 1)} ${unit} ${name}`.trim();
      }
      return ingredient;
    });
  };

  const adjustedIngredients = getAdjustedIngredients();

  const tabs = [
    { id: 'ingredients', label: 'מרכיבים', icon: '🥘' },
    { id: 'instructions', label: 'הוראות', icon: '📝' },
    { id: 'details', label: 'פרטים', icon: 'ℹ️' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative">
          <div className="h-80 overflow-hidden rounded-t-xl">
            <img
              src={recipe.image}
              alt={recipe.name}
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
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Recipe Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">{recipe.name}</h1>
           
    
            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium">{recipe.prepTime}</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-white font-medium">{servings} מנות</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-medium">{recipe.difficulty || 'בינוני'}</span>
              </div>
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(recipe.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium"
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">מרכיבים</h3>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">מנות:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setServings(Math.max(1, servings - 1))}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-2 font-semibold">{servings}</span>
                      <button
                        onClick={() => setServings(servings + 1)}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {adjustedIngredients.map((ingredient, index) => (
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
                  {(recipe.instructions || []).map((instruction, index) => (
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
                        <span className="font-medium text-gray-900">{recipe.prepTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">מנות:</span>
                        <span className="font-medium text-gray-900">{recipe.servings}</span>
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
