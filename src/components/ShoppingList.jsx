import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import { buildShoppingList } from '../api';

const ShoppingList = ({ selectedRecipes, onBack, onAddToHistory, onClearCart }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [currentShoppingList, setCurrentShoppingList] = useState(null);
  const [effectiveRecipes, setEffectiveRecipes] = useState([]);


  // Load current shopping list from localStorage if no selectedRecipes
  useEffect(() => {
    if (selectedRecipes.length === 0) {
      // Try to load from localStorage
      const currentListData = localStorage.getItem('currentShoppingList');
      if (currentListData) {
        try {
          const parsedList = JSON.parse(currentListData);
          setCurrentShoppingList(parsedList);
          setEffectiveRecipes([]); // We don't need recipes for display, we have the shopping list data
          return;
        } catch (error) {
          console.error('Error parsing current shopping list:', error);
        }
      }
    } else {
      setEffectiveRecipes(selectedRecipes);
      setCurrentShoppingList(null);
    }
  }, [selectedRecipes]);

  // Create a mapping of ingredient names to departments from available recipe data
  const createIngredientDeptMapping = (recipes) => {
    const mapping = new Map();

    recipes.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ingredient => {
          if (ingredient.ingredientId && ingredient.ingredientId.name && ingredient.ingredientId.dept) {
            mapping.set(ingredient.ingredientId.name.toLowerCase(), ingredient.ingredientId.dept);
          }
        });
      }
    });

    return mapping;
  };

  // Function to get department for an ingredient name
  const getIngredientDepartment = (ingredientName, mapping) => {
    if (!ingredientName) return 'אחר';

    // Try exact match first
    const exactMatch = mapping.get(ingredientName.toLowerCase());
    if (exactMatch) return exactMatch;

    // Try partial matches for compound ingredient names
    const nameLower = ingredientName.toLowerCase();
    for (const [mappedName, dept] of mapping.entries()) {
      if (nameLower.includes(mappedName) || mappedName.includes(nameLower)) {
        return dept;
      }
    }

    return 'אחר';
  };

  // Generate shopping list from selected recipes OR load from localStorage
  useEffect(() => {
    if (currentShoppingList) {
      // Load from localStorage data
      if (currentShoppingList.items) {
        setShoppingListItems(currentShoppingList.items);

        // Initialize checked items state from localStorage data
        const initialChecked = {};
        currentShoppingList.items.forEach(item => {
          initialChecked[item.id || item._id || `${item.name}_${item.category}`] = item.checked || false;
        });
        setCheckedItems(initialChecked);
      }
    } else if (effectiveRecipes.length > 0) {
      (async () => {
        // Try server-side build when all recipes have server IDs
        const isObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id));
        const recipeIds = selectedRecipes.map(r => r._id || r.id).filter(Boolean);

        if (recipeIds.length === selectedRecipes.length && recipeIds.every(isObjectId)) {
          try {
            const list = await buildShoppingList({ userId: 'currentUserId', title: 'רשימת קניות חדשה', recipeIds });
            console.log('Shopping list created by server:', list);

            const serverItems = list.byDept ?
              Object.values(list.byDept).flat().map(item => ({
                id: item.itemId || `${item.canonicalName}_${item.dept}`,
                name: item.qty && item.unit && item.qty !== 1 ?
                  `${item.qty} ${item.unit} ${item.canonicalName}` :
                  item.unit && item.unit !== 'יחידה' ?
                    `${item.unit} ${item.canonicalName}` :
                    item.canonicalName,
                baseName: item.canonicalName,
                qty: item.qty,
                unit: item.unit,
                quantity: 1,
                recipes: selectedRecipes.map(r => r.title || r.name),
                category: item.dept,
                checked: false
              })) : [];

            setShoppingListItems(serverItems);
            const initialChecked = {};
            serverItems.forEach(i => initialChecked[i.id] = false);
            setCheckedItems(initialChecked);

            // Persist current list
            localStorage.setItem('currentShoppingList', JSON.stringify({
              ...list,
              items: serverItems,
              recipes: selectedRecipes.map(r => r.title || r.name),
              createdAt: new Date().toISOString()
            }));

            return; // server list used; skip client aggregation
          } catch (err) {
            console.error('Server buildShoppingList failed, falling back to client aggregation:', err);
            // Continue to client-side aggregation below
          }
        }

        // Client-side aggregation fallback (unchanged)
        const allIngredients = [];

        // Create ingredient name to department mapping from all recipe data
        const ingredientDeptMapping = createIngredientDeptMapping(selectedRecipes);

        selectedRecipes.forEach(recipe => {
          recipe.ingredients.forEach(ingredient => {
            // console.log('ShoppingList - Processing ingredient:', ingredient, 'Type:', typeof ingredient);

            // Handle different ingredient formats
            let ingredientName = '';
            let ingredientDisplay = '';
            let qty = 0;
            let unit = '';
            let ingredientDept = 'אחר'; // Default department

            if (typeof ingredient === 'string') {
              // Try to parse string like "2 כוסות קמח" or just "מלח"
              const parts = ingredient.trim().split(' ');
              if (parts.length >= 3) {
                const possibleQty = parseFloat(parts[0]);
                if (!isNaN(possibleQty)) {
                  qty = possibleQty;
                  unit = parts[1];
                  ingredientName = parts.slice(2).join(' ');
                  ingredientDisplay = ingredient;
                } else {
                  ingredientName = ingredient;
                  ingredientDisplay = ingredient;
                  qty = 1;
                  unit = 'יחידה';
                }
              } else {
                ingredientName = ingredient;
                ingredientDisplay = ingredient;
                qty = 1;
                unit = 'יחידה';
              }

              // Look up department based on ingredient name
              ingredientDept = getIngredientDepartment(ingredientName, ingredientDeptMapping);
            } else if (typeof ingredient === 'object' && ingredient !== null) {
              // Handle different ingredient structures from backend

              if (ingredient.ingredientId && ingredient.ingredientId.name) {
                // Backend populated structure: {ingredientId: {name: "...", dept: "..."}, qty: 1, unit: "יחידה"}
                ingredientName = ingredient.ingredientId.name;
                ingredientDept = ingredient.ingredientId.dept || 'אחר';
                qty = parseFloat(ingredient.qty || 1);
                unit = ingredient.unit || 'יחידה';
              } else if (ingredient.ingredientName) {
                // Alternative structure: {ingredientName: "...", qty: 1, unit: "יחידה"}
                ingredientName = ingredient.ingredientName;
                ingredientDept = ingredient.dept || getIngredientDepartment(ingredientName, ingredientDeptMapping);
                qty = parseFloat(ingredient.qty || ingredient.quantity || 1);
                unit = ingredient.unit || 'יחידה';
              } else if (ingredient.name) {
                // Direct structure: {name: "...", qty: 1, unit: "יחידה"}
                ingredientName = ingredient.name;
                ingredientDept = ingredient.dept || getIngredientDepartment(ingredientName, ingredientDeptMapping);
                qty = parseFloat(ingredient.qty || ingredient.quantity || 1);
                unit = ingredient.unit || 'יחידה';
              }

              // Format display with full string: "qty unit name"
              if (ingredientName) {
                const parts = [];
                if (qty && qty > 0) parts.push(qty);
                if (unit && unit.trim()) parts.push(unit.trim());
                parts.push(ingredientName.trim());

                ingredientDisplay = parts.join(' ').replace(/\s+/g, ' ').trim();
              } else if (ingredient.text) {
                ingredientName = ingredient.text;
                ingredientDisplay = ingredient.text;
                ingredientDept = getIngredientDepartment(ingredientName, ingredientDeptMapping);
                qty = 1;
                unit = 'יחידה';
              } else if (ingredient.description) {
                ingredientName = ingredient.description;
                ingredientDisplay = ingredient.description;
                ingredientDept = getIngredientDepartment(ingredientName, ingredientDeptMapping);
                qty = 1;
                unit = 'יחידה';
              } else {
                // Try to extract meaningful text from object
                const values = Object.values(ingredient).filter(v =>
                  typeof v === 'string' && v.trim().length > 0
                );
                if (values.length > 0) {
                  ingredientName = values[values.length - 1]; // Use last value as name (usually the actual ingredient)
                  ingredientDisplay = values.join(' ');
                  ingredientDept = getIngredientDepartment(ingredientName, ingredientDeptMapping);
                  qty = 1;
                  unit = 'יחידה';
                } else {
                  // Skip invalid ingredients
                  return;
                }
              }
            } else {
              // Skip invalid ingredients
              return;
            }

            // Clean up and validate
            ingredientName = ingredientName.trim();
            ingredientDisplay = ingredientDisplay.trim();

            if (!ingredientName || !ingredientDisplay) {
              return; // Skip empty ingredients
            }

            // Check if ingredient already exists (case-insensitive) with same unit
            const existingIndex = allIngredients.findIndex(
              item => item.baseName.toLowerCase() === ingredientName.toLowerCase() && item.unit === unit
            );

            if (existingIndex >= 0) {
              // Add quantity if ingredient already exists with same unit
              allIngredients[existingIndex].qty += qty;
              allIngredients[existingIndex].recipes.push(recipe.title || recipe.name);

              // Update display with new total quantity
              const totalQty = allIngredients[existingIndex].qty;
              const displayUnit = allIngredients[existingIndex].unit;
              if (totalQty && displayUnit && totalQty !== 1) {
                allIngredients[existingIndex].name = `${totalQty} ${displayUnit} ${ingredientName}`;
              } else if (displayUnit && displayUnit !== 'יחידה') {
                allIngredients[existingIndex].name = `${displayUnit} ${ingredientName}`;
              } else {
                allIngredients[existingIndex].name = ingredientName;
              }
            } else {
              // Add new ingredient
              allIngredients.push({
                id: Date.now() + Math.random(), // Unique ID
                name: ingredientDisplay,
                baseName: ingredientName, // Store base name for comparison
                qty: qty,
                unit: unit,
                quantity: 1, // Keep for backward compatibility
                recipes: [recipe.title || recipe.name],
                category: ingredientDept,
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

        // Save current shopping list to localStorage only if we're generating from selectedRecipes
        if (effectiveRecipes.length > 0) {
          const currentListData = {
            id: Date.now().toString(),
            name: `רשימת קניות - ${new Date().toLocaleDateString('he-IL')}`,
            createdAt: new Date().toISOString(),
            recipes: effectiveRecipes.map(recipe => recipe.name || recipe.title),
            items: allIngredients
          };
          localStorage.setItem('currentShoppingList', JSON.stringify(currentListData));
        }
      })();
    }
  }, [selectedRecipes, effectiveRecipes, currentShoppingList]);


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
    const recipesForHistory = currentShoppingList
      ? (currentShoppingList.recipes || [])
      : selectedRecipes.map(recipe => recipe.name || recipe.title);

    const shoppingListData = {
      id: Date.now().toString(),
      name: currentShoppingList?.name || `רשימת קניות - ${new Date().toLocaleDateString('he-IL')}`,
      createdAt: currentShoppingList?.createdAt || new Date().toISOString(),
      recipes: recipesForHistory,
      items: shoppingListItems.map(item => ({
        ...item,
        checked: checkedItems[item.id || item._id || `${item.name}_${item.category}`] || false
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

  // Only show "no recipes" message if there are no selectedRecipes AND no currentShoppingList
  if (selectedRecipes.length === 0 && !currentShoppingList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <div className="text-center">
          <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">אין רשימת קניות זמינה</h2>
          <p className="text-gray-600 mb-6">אנא בחר כמה מתכונים כדי ליצור רשימת קניות חדשה.</p>
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
  // Génère un texte lisible pour export Notes
  const generateExportText = () => {
    const lines = [];
    lines.push(`🛒 רשימת קניות - ${new Date().toLocaleDateString('he-IL')}`, '');

    Object.entries(groupedItems).forEach(([category, items]) => {
      if (!items.length) return;
      lines.push(`📂 ${category}`);
      items.forEach(item => {
        const checked = checkedItems[item.id] ? "x" : " ";
        lines.push(`- [${checked}] ${item.name}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  };

  const handleExport = async () => {
    const text = generateExportText();

    if (navigator.share) {
      try {
        await navigator.share({ title: "רשימת קניות", text });
        return;
      } catch (e) {
        console.log("Share canceled or failed", e);
      }
    }

    // Fallback: copier + téléchargement
    try { await navigator.clipboard.writeText(text); } catch { }
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: `shopping-list-${new Date().toISOString().slice(0, 10)}.txt`,
    });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    alert("נשמר לקובץ טקסט / הועתק ללוח.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">רשימת קניות</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
                {currentShoppingList ? (
                  <>נוצר מ-{currentShoppingList.recipes?.length || 0} {(currentShoppingList.recipes?.length || 0) !== 1 ? 'מתכונים' : 'מתכון'}</>
                ) : (
                  <>נוצר מ-{selectedRecipes.length} מתכון{selectedRecipes.length !== 1 ? 'ים' : ''}</>
                )}
              </p>
            </div>
            <div className="flex gap-3">
              {onClearCart && (
                <button
                  onClick={() => {
                    if (window.confirm('האם אתה בטוח שברצונך למחוק את עגלת הקניות? פעולה זו לא ניתנת לביטול.')) {
                      onClearCart();
                    }
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-red-600 transition-all duration-200 text-sm sm:text-base"
                  title="מחק עגלת קניות"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  מחק עגלה
                </button>
              )}
              <button
                onClick={onBack}
                className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base"
              >
                חזור למתכונים
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* Statistics */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors duration-200"
          >
            שתף / ייצא רשימה
          </button>
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
                      className={`flex items-start p-4 rounded-lg border-2 transition-all duration-200 ${checkedItems[item.id]
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
                              className={`text-lg font-medium ${checkedItems[item.id] ? 'text-green-700 line-through' : 'text-gray-900'
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
