import React, { useState } from 'react';

const FilterSidebar = ({ onFilterChange, onIngredientSearch }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [excludeIngredients, setExcludeIngredients] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPantryItems, setSelectedPantryItems] = useState([]);
  const [prepTimeRange, setPrepTimeRange] = useState('');
  const [servingsRange, setServingsRange] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('');
  const [sortBy, setSortBy] = useState('title');

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateFilters({ tags: newTags });
  };

  const handleCategoryToggle = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    updateFilters({ categories: newCategories });
  };

  const handlePantryToggle = (item) => {
    const newPantryItems = selectedPantryItems.includes(item)
      ? selectedPantryItems.filter(p => p !== item)
      : [...selectedPantryItems, item];
    
    setSelectedPantryItems(newPantryItems);
    updateFilters({ pantryItems: newPantryItems });
  };

  const handleIngredientSearch = (value) => {
    setIngredientSearch(value);
    updateFilters({ ingredientSearch: value });
    onIngredientSearch && onIngredientSearch(value);
  };

  const handleExcludeIngredients = (value) => {
    setExcludeIngredients(value);
    updateFilters({ excludeIngredients: value });
  };

  const handlePrepTimeChange = (value) => {
    setPrepTimeRange(value);
    updateFilters({ prepTimeRange: value });
  };

  const handleServingsChange = (value) => {
    setServingsRange(value);
    updateFilters({ servingsRange: value });
  };

  const handleDifficultyChange = (value) => {
    setDifficultyLevel(value);
    updateFilters({ difficultyLevel: value });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    updateFilters({ sortBy: value });
  };

  const updateFilters = (newFilters) => {
    const allFilters = {
      tags: selectedTags,
      ingredientSearch,
      excludeIngredients,
      categories: selectedCategories,
      pantryItems: selectedPantryItems,
      prepTimeRange,
      servingsRange,
      difficultyLevel,
      sortBy,
      ...newFilters
    };
    onFilterChange(allFilters);
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setIngredientSearch('');
    setExcludeIngredients('');
    setSelectedCategories([]);
    setSelectedPantryItems([]);
    setPrepTimeRange('');
    setServingsRange('');
    setDifficultyLevel('');
    setSortBy('title');
    onFilterChange({
      tags: [],
      ingredientSearch: '',
      excludeIngredients: '',
      categories: [],
      pantryItems: [],
      prepTimeRange: '',
      servingsRange: '',
      difficultyLevel: '',
      sortBy: 'title'
    });
  };

  const availableTags = ['כשר', 'טבעוני', 'ללא גלוטן', 'צמחוני', 'ללא חלב', 'דל פחמימות', 'קטו', 'פליאו', 'ים תיכוני', 'אסייתי', 'מקסיקני', 'איטלקי'].sort((a, b) => a.localeCompare(b, 'he-IL'));
  const categories = ['ארוחת בוקר', 'ארוחת צהריים', 'ארוחת ערב', 'קינוח', 'נשנוש', 'מתאבן', 'מרק', 'סלט', 'פסטה', 'בשר', 'דגים', 'צמחוני'].sort((a, b) => a.localeCompare(b, 'he-IL'));
  const pantryItems = ['אורז', 'פסטה', 'לחם', 'קמח', 'סוכר', 'מלח', 'פלפל', 'שמן זית', 'חמאה', 'ביצים', 'חלב', 'גבינה', 'עגבניות', 'בצלים', 'שום'].sort((a, b) => a.localeCompare(b, 'he-IL'));

  const hasActiveFilters = selectedTags.length > 0 || ingredientSearch || excludeIngredients || 
    selectedCategories.length > 0 || selectedPantryItems.length > 0 || prepTimeRange || 
    servingsRange || difficultyLevel || sortBy !== 'title';

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 lg:p-8 h-fit max-h-screen overflow-y-auto">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">סנן ומיין מתכונים</h2>
      
      {/* Sort Options */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">מיין לפי</h3>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg"
        >
          <option value="title">שם (א-ת)</option>
          <option value="title-desc">שם (ת-א)</option>
          <option value="prepTime">זמן הכנה (הקצר ביותר)</option>
          <option value="prepTime-desc">זמן הכנה (הארוך ביותר)</option>
          <option value="category">קטגוריה</option>
        </select>
      </div>

      {/* Include Ingredients */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">חייב להכיל מרכיבים</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="חפש מרכיבים לכלול"
            value={ingredientSearch}
            onChange={(e) => handleIngredientSearch(e.target.value)}
            className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg"
          />
          <svg 
            className="absolute right-3 sm:right-4 top-2.5 sm:top-3 lg:top-4 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Exclude Ingredients */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">לא להכיל מרכיבים</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="חפש מרכיבים לא לכלול"
            value={excludeIngredients}
            onChange={(e) => handleExcludeIngredients(e.target.value)}
            className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm sm:text-base lg:text-lg"
          />
          <svg 
            className="absolute right-3 sm:right-4 top-2.5 sm:top-3 lg:top-4 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">קטגוריות</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="sr-only"
              />
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 mr-3 sm:mr-4 flex items-center justify-center transition-all duration-200 ${
                selectedCategories.includes(category)
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-300'
              }`}>
                {selectedCategories.includes(category) && (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-gray-700 transition-colors duration-200 text-sm sm:text-base lg:text-lg ${
                selectedCategories.includes(category) ? 'text-orange-600 font-medium' : ''
              }`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">תזונה ואורח חיים</h3>
        <div className="space-y-2 sm:space-y-3">
          {availableTags.map((tag) => (
            <label key={tag} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
                className="sr-only"
              />
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 mr-3 sm:mr-4 flex items-center justify-center transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-300'
              }`}>
                {selectedTags.includes(tag) && (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-gray-700 transition-colors duration-200 text-sm sm:text-base lg:text-lg ${
                selectedTags.includes(tag) ? 'text-orange-600 font-medium' : ''
              }`}>
                {tag}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pantry Items */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">השתמש במוצרי המזווה</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {pantryItems.map((item) => (
            <label key={item} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPantryItems.includes(item)}
                onChange={() => handlePantryToggle(item)}
                className="sr-only"
              />
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 mr-3 sm:mr-4 flex items-center justify-center transition-all duration-200 ${
                selectedPantryItems.includes(item)
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 group-hover:border-green-300'
              }`}>
                {selectedPantryItems.includes(item) && (
                  <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-gray-700 transition-colors duration-200 text-sm sm:text-base lg:text-lg ${
                selectedPantryItems.includes(item) ? 'text-green-600 font-medium' : ''
              }`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prep Time */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">זמן הכנה</h3>
        <select
          value={prepTimeRange}
          onChange={(e) => handlePrepTimeChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg"
        >
          <option value="">כל זמן הכנה</option>
          <option value="quick">מהיר (15 דקות או פחות)</option>
          <option value="short">קצר (16-30 דקות)</option>
          <option value="medium">בינוני (31-60 דקות)</option>
          <option value="long">ארוך (שעה ומעלה)</option>
        </select>
      </div>

      {/* Servings */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">מספר מנות</h3>
        <select
          value={servingsRange}
          onChange={(e) => handleServingsChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg"
        >
          <option value="">כל מספר מנות</option>
          <option value="1-2">1-2 מנות</option>
          <option value="3-4">3-4 מנות</option>
          <option value="5-6">5-6 מנות</option>
          <option value="7+">7+ מנות</option>
        </select>
      </div>

      {/* Difficulty */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">רמת קושי</h3>
        <select
          value={difficultyLevel}
          onChange={(e) => handleDifficultyChange(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg"
        >
          <option value="">כל רמת קושי</option>
          <option value="easy">קל</option>
          <option value="medium">בינוני</option>
          <option value="hard">קשה</option>
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full mt-8 px-6 py-3 text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          נקה את כל המסננים
        </button>
      )}
    </div>
  );
};

export default FilterSidebar;
