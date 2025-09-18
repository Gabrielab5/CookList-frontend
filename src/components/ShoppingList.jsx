import React, { useState, useEffect, useMemo } from 'react';

const ShoppingList = ({ selectedRecipes, onBack, onAddToHistory }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [shoppingListItems, setShoppingListItems] = useState([]);

  // Ingredient categories for organization
  const ingredientCategories = {
    'ירקות ופירות': ['עגבניה', 'בצל', 'שום', 'גזר', 'סלרי', 'חסה', 'תרד', 'פלפל מתוק', 'מלפפון', 'תפוח אדמה', 'תפוח', 'בננה', 'לימון', 'ליים', 'עשבי תיבול', 'בזיליקום', 'פטרוזיליה', 'כוסברה', 'נענע', 'טימין', 'רוזמרין'],
    'חלב ומוצריו': ['חלב', 'גבינה', 'חמאה', 'שמנת', 'יוגורט', 'שמנת חמוצה', 'מוצרלה', 'צ\'דר', 'פרמזן', 'ריקוטה', 'פטה'],
    'בשר ודגים': ['עוף', 'בקר', 'חזיר', 'דג', 'סלמון', 'שרימפ', 'הודו', 'בייקון', 'חזה הודו', 'נקניק', 'בשר טחון', 'סטייק'],
    'מזווה': ['אורז', 'פסטה', 'לחם', 'קמח', 'סוכר', 'מלח', 'פלפל', 'שמן זית', 'שמן צמחי', 'חומץ', 'רוטב סויה', 'דבש', 'סירופ מייפל'],
    'קפוא': ['ירקות קפואים', 'פירות קפואים', 'גלידה', 'ארוחות קפואות'],
    'מאפייה': ['לחם', 'בייגל', 'קרואסון', 'מאפין', 'קרקרים', 'טורטיות'],
    'משקאות': ['מים', 'מיץ', 'סודה', 'קפה', 'תה', 'יין', 'בירה'],
    'תבלינים': ['מלח', 'פלפל', 'אבקת שום', 'אבקת בצל', 'פפריקה', 'כמון', 'אורגנו', 'עלי דפנה', 'קינמון', 'אגוז מוסקט'],
    'שימורים': ['רוטב עגבניות', 'רסק עגבניות', 'עגבניות משומרות', 'שעועית', 'ציר', 'מרק', 'חמוצים', 'זיתים'],
    'אחר': []
  };

  // Generate shopping list from selected recipes
  useEffect(() => {
    if (selectedRecipes.length > 0) {
      const allIngredients = [];
      
      selectedRecipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
          // Check if ingredient already exists (case-insensitive)
          const existingIndex = allIngredients.findIndex(
            item => item.name.toLowerCase() === ingredient.toLowerCase()
          );
          
          if (existingIndex >= 0) {
            // Increment quantity if ingredient already exists
            allIngredients[existingIndex].quantity += 1;
            allIngredients[existingIndex].recipes.push(recipe.name);
          } else {
            // Add new ingredient
            allIngredients.push({
              id: Date.now() + Math.random(), // Unique ID
              name: ingredient,
              quantity: 1,
              recipes: [recipe.name],
              category: categorizeIngredient(ingredient),
              checked: false
            });
          }
        });
      });

      // Sort ingredients by category and name
      allIngredients.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });

      setShoppingListItems(allIngredients);
      
      // Initialize checked items state
      const initialChecked = {};
      allIngredients.forEach(item => {
        initialChecked[item.id] = false;
      });
      setCheckedItems(initialChecked);

      // Save current shopping list to localStorage
      const currentListData = {
        id: Date.now().toString(),
        name: `רשימת קניות - ${new Date().toLocaleDateString('he-IL')}`,
        createdAt: new Date().toISOString(),
        recipes: selectedRecipes.map(recipe => recipe.name),
        items: allIngredients
      };
      localStorage.setItem('currentShoppingList', JSON.stringify(currentListData));
    }
  }, [selectedRecipes]);

  // Categorize ingredient based on keywords
  const categorizeIngredient = (ingredient) => {
    const ingredientLower = ingredient.toLowerCase();
    
    for (const [category, keywords] of Object.entries(ingredientCategories)) {
      if (keywords.some(keyword => ingredientLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'אחר';
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups = {};
    shoppingListItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [shoppingListItems]);

  // Handle checkbox change
  const handleItemCheck = (itemId) => {
    const newCheckedItems = {
      ...checkedItems,
      [itemId]: !checkedItems[itemId]
    };
    setCheckedItems(newCheckedItems);

    // Update localStorage
    const currentListData = localStorage.getItem('currentShoppingList');
    if (currentListData) {
      const currentList = JSON.parse(currentListData);
      currentList.items = currentList.items.map(item => ({
        ...item,
        checked: newCheckedItems[item.id] || false
      }));
      localStorage.setItem('currentShoppingList', JSON.stringify(currentList));
    }
  };

  // Handle check all items in a category
  const handleCategoryCheck = (category) => {
    const categoryItems = groupedItems[category] || [];
    const allChecked = categoryItems.every(item => checkedItems[item.id]);
    
    const newCheckedItems = { ...checkedItems };
    categoryItems.forEach(item => {
      newCheckedItems[item.id] = !allChecked;
    });
    
    setCheckedItems(newCheckedItems);
  };

  // Handle check all items
  const handleCheckAll = () => {
    const allChecked = shoppingListItems.every(item => checkedItems[item.id]);
    const newCheckedItems = {};
    
    shoppingListItems.forEach(item => {
      newCheckedItems[item.id] = !allChecked;
    });
    
    setCheckedItems(newCheckedItems);
  };

  // Get statistics
  const totalItems = shoppingListItems.length;
  const checkedItemsCount = Object.values(checkedItems).filter(Boolean).length;
  const remainingItems = totalItems - checkedItemsCount;

  // Clear completed items
  const clearCompleted = () => {
    const remainingItems = shoppingListItems.filter(item => !checkedItems[item.id]);
    setShoppingListItems(remainingItems);
    
    const newCheckedItems = {};
    remainingItems.forEach(item => {
      newCheckedItems[item.id] = false;
    });
    setCheckedItems(newCheckedItems);
  };

  // Add to history
  const handleAddToHistory = () => {
    const shoppingListData = {
      id: Date.now().toString(),
      name: `רשימת קניות - ${new Date().toLocaleDateString('he-IL')}`,
      createdAt: new Date().toISOString(),
      recipes: selectedRecipes.map(recipe => recipe.name),
      items: shoppingListItems.map(item => ({
        ...item,
        checked: checkedItems[item.id] || false
      }))
    };

    // Save to localStorage
    const existingHistory = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');
    existingHistory.unshift(shoppingListData); // Add to beginning
    localStorage.setItem('shoppingHistory', JSON.stringify(existingHistory));

    // Call parent callback
    if (onAddToHistory) {
      onAddToHistory(shoppingListData);
    }

    // Clear current shopping list
    setShoppingListItems([]);
    setCheckedItems({});
  };

  if (selectedRecipes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">לא נבחרו מתכונים</h2>
          <p className="text-gray-600 mb-6">אנא בחר כמה מתכונים כדי ליצור רשימת קניות.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
          >
            חזור למתכונים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">רשימת קניות</h1>
              <p className="text-gray-600 mt-2">
                נוצר מ-{selectedRecipes.length} מתכון{selectedRecipes.length !== 1 ? 'ים' : ''}
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              חזור למתכונים
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
              <div className="text-sm text-gray-600">סה"כ מוצרים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{checkedItemsCount}</div>
              <div className="text-sm text-gray-600">נקנו</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{remainingItems}</div>
              <div className="text-sm text-gray-600">נותרו</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(groupedItems).length}</div>
              <div className="text-sm text-gray-600">קטגוריות</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleCheckAll}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            {checkedItemsCount === totalItems ? 'בטל הכל' : 'סמן הכל'}
          </button>
          {checkedItemsCount > 0 && (
            <button
              onClick={clearCompleted}
              className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors duration-200"
            >
              נקה הושלמו ({checkedItemsCount})
            </button>
          )}
          {checkedItemsCount === totalItems && totalItems > 0 && (
            <button
              onClick={handleAddToHistory}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              הוסף להיסטוריה
            </button>
          )}
        </div>

        {/* Shopping List by Categories */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={items.every(item => checkedItems[item.id])}
                      onChange={() => handleCategoryCheck(category)}
                      className="ml-5 w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mr-3"
                    />
                    <h3 className="ml-5 text-xl font-semibold text-gray-900">{category}</h3>
                    <span className="ml-5 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                      {items.length} פריט{items.length !== 1 ? 'ים' : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {items.filter(item => checkedItems[item.id]).length} / {items.length} הושלמו
                  </div>
                </div>
              </div>

              {/* Category Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-start p-4 rounded-lg border-2 transition-all duration-200 ${
                        checkedItems[item.id]
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={checkedItems[item.id] || false}
                          onChange={() => handleItemCheck(item.id)}
                          className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 mt-0.5 flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-lg font-medium ${
                                checkedItems[item.id] ? 'text-green-700 line-through' : 'text-gray-900'
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex-shrink-0 mr-2">
                              {item.quantity} {item.quantity === 1 ? 'מתכון' : 'מתכונים'}
                            </span>
                          </div>
                          
                          {item.recipes.length > 0 && (
                            <div className="mt-1">
                              <span className="text-sm text-gray-600">מהמתכונים: </span>
                              <span className="text-sm text-orange-600 font-medium">
                                {item.recipes.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {shoppingListItems.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">רשימת הקניות הושלמה!</h3>
            <p className="text-gray-600 mb-6">כל הפריטים סומנו. עבודה מצוינת!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200"
            >
              חזור למתכונים
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
