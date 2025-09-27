import React, { useState } from 'react';

const AiRecipePreviewModal = ({ isOpen, onClose, recipe, onAddToRecipes }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToRecipes = async () => {
    setIsAdding(true);
    try {
      await onAddToRecipes(recipe);
      onClose();
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('שגיאה בהוספת המתכון. אנא נסה שוב.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      onClose();
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              מתכון שנוצר עם AI
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Recipe Header */}
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {recipe.title}
              </h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm sm:text-base text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {recipe.prepTimeMinutes} דקות
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {recipe.category}
                </span>
                {recipe.difficulty && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {recipe.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">תגיות:</h4>
                <div className="flex flex-wrap gap-2">
                  {(recipe.tags || []).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">מרכיבים:</h4>
              <ul className="space-y-2">
                {(recipe.ingredients || []).map((ingredient, index) => {
                  // console.log('Processing ingredient:', ingredient, 'Type:', typeof ingredient);
                  
                  // Handle different ingredient formats
                  let ingredientDisplay = '';
                  
                  if (typeof ingredient === 'string') {
                    ingredientDisplay = ingredient;
                  } else if (typeof ingredient === 'object' && ingredient !== null) {
                    // Handle different ingredient structures - display full string from backend
                    let name = '';
                    let qty = '';
                    let unit = '';
                    
                    if (ingredient.ingredientId && ingredient.ingredientId.name) {
                      // Backend populated structure: {ingredientId: {name: "..."}, qty: 1, unit: "יחידה"}
                      name = ingredient.ingredientId.name;
                      qty = ingredient.qty || '';
                      unit = ingredient.unit || '';
                    } else if (ingredient.ingredientName) {
                      // Alternative structure: {ingredientName: "...", qty: 1, unit: "יחידה"}
                      name = ingredient.ingredientName;
                      qty = ingredient.qty || '';
                      unit = ingredient.unit || '';
                    } else if (ingredient.name) {
                      // Direct structure: {name: "...", qty: 1, unit: "יחידה"}
                      name = ingredient.name;
                      qty = ingredient.qty || '';
                      unit = ingredient.unit || '';
                    } else if (ingredient.text || ingredient.description) {
                      // Already formatted text
                      ingredientDisplay = ingredient.text || ingredient.description;
                    }
                    
                    // Build the complete ingredient string: "qty unit name"
                    if (name && !ingredientDisplay) {
                      const parts = [];
                      if (qty && qty > 0) parts.push(qty);
                      if (unit && unit.trim()) parts.push(unit.trim());
                      parts.push(name.trim());
                      
                      ingredientDisplay = parts.join(' ').replace(/\s+/g, ' ').trim();
                    }
                  } else {
                    // Fallback for null, undefined, or other types
                    ingredientDisplay = 'מרכיב לא תקין';
                  }
                  
                  // Clean up the display text
                  ingredientDisplay = ingredientDisplay.replace(/\s+/g, ' ').trim();
                  
                  // Skip empty ingredients
                  if (!ingredientDisplay || ingredientDisplay === 'מרכיב לא תקין') {
                    return null;
                  }
                  
                  return (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{ingredientDisplay}</span>
                    </li>
                  );
                }).filter(Boolean)}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">הוראות הכנה:</h4>
              <ol className="space-y-3">
                {(recipe.instructions || recipe.steps || []).map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-sm font-semibold rounded-full flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{String(instruction)}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Nutritional Info */}
            {recipe.nutrition && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">מידע תזונתי (למנה):</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutrition).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">{key}</div>
                      <div className="font-semibold text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base lg:text-lg"
          >
            סגור
          </button>
          <button
            onClick={handleAddToRecipes}
            disabled={isAdding}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base lg:text-lg flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מוסיף למתכונים...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                הוסף למתכונים שלי
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiRecipePreviewModal;
