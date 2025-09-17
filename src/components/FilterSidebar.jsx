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
  const [sortBy, setSortBy] = useState('name');

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
    setSortBy('name');
    onFilterChange({
      tags: [],
      ingredientSearch: '',
      excludeIngredients: '',
      categories: [],
      pantryItems: [],
      prepTimeRange: '',
      servingsRange: '',
      difficultyLevel: '',
      sortBy: 'name'
    });
  };

  const availableTags = ['Kosher', 'Vegan', 'Gluten-Free', 'Vegetarian', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo', 'Mediterranean', 'Asian', 'Mexican', 'Italian'];
  const categories = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Soup', 'Salad', 'Pasta', 'Meat', 'Seafood', 'Vegetarian'];
  const pantryItems = ['Rice', 'Pasta', 'Bread', 'Flour', 'Sugar', 'Salt', 'Pepper', 'Olive Oil', 'Butter', 'Eggs', 'Milk', 'Cheese', 'Tomatoes', 'Onions', 'Garlic'];

  const hasActiveFilters = selectedTags.length > 0 || ingredientSearch || excludeIngredients || 
    selectedCategories.length > 0 || selectedPantryItems.length > 0 || prepTimeRange || 
    servingsRange || difficultyLevel || sortBy !== 'name';

  return (
    <div className="bg-white rounded-xl shadow-md p-8 h-fit max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Filter & Sort Recipes</h2>
      
      {/* Sort Options */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Sort by</h3>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
        >
          <option value="name">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="prepTime">Prep Time (Shortest)</option>
          <option value="prepTime-desc">Prep Time (Longest)</option>
          <option value="servings">Servings (Fewest)</option>
          <option value="servings-desc">Servings (Most)</option>
          <option value="category">Category</option>
        </select>
      </div>

      {/* Include Ingredients */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Must include ingredients</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search ingredients to include"
            value={ingredientSearch}
            onChange={(e) => handleIngredientSearch(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
          />
          <svg 
            className="absolute right-4 top-4 w-6 h-6 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Exclude Ingredients */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Exclude ingredients</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search ingredients to exclude"
            value={excludeIngredients}
            onChange={(e) => handleExcludeIngredients(e.target.value)}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-lg"
          />
          <svg 
            className="absolute right-4 top-4 w-6 h-6 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                selectedCategories.includes(category)
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-300'
              }`}>
                {selectedCategories.includes(category) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-gray-700 transition-colors duration-200 text-sm ${
                selectedCategories.includes(category) ? 'text-orange-600 font-medium' : ''
              }`}>
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Tags */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Dietary & Lifestyle</h3>
        <div className="space-y-3">
          {availableTags.map((tag) => (
            <label key={tag} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => handleTagToggle(tag)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-300 group-hover:border-orange-300'
              }`}>
                {selectedTags.includes(tag) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-gray-700 transition-colors duration-200 text-sm ${
                selectedTags.includes(tag) ? 'text-orange-600 font-medium' : ''
              }`}>
                {tag}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pantry Items */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Use pantry items</h3>
        <div className="grid grid-cols-2 gap-2">
          {pantryItems.map((item) => (
            <label key={item} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedPantryItems.includes(item)}
                onChange={() => handlePantryToggle(item)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                selectedPantryItems.includes(item)
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 group-hover:border-green-300'
              }`}>
                {selectedPantryItems.includes(item) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-gray-700 transition-colors duration-200 text-sm ${
                selectedPantryItems.includes(item) ? 'text-green-600 font-medium' : ''
              }`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prep Time */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Prep Time</h3>
        <select
          value={prepTimeRange}
          onChange={(e) => handlePrepTimeChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
        >
          <option value="">Any time</option>
          <option value="quick">Quick (15 min or less)</option>
          <option value="short">Short (16-30 min)</option>
          <option value="medium">Medium (31-60 min)</option>
          <option value="long">Long (1+ hours)</option>
        </select>
      </div>

      {/* Servings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Servings</h3>
        <select
          value={servingsRange}
          onChange={(e) => handleServingsChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
        >
          <option value="">Any servings</option>
          <option value="1-2">1-2 servings</option>
          <option value="3-4">3-4 servings</option>
          <option value="5-6">5-6 servings</option>
          <option value="7+">7+ servings</option>
        </select>
      </div>

      {/* Difficulty */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Difficulty Level</h3>
        <select
          value={difficultyLevel}
          onChange={(e) => handleDifficultyChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
        >
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full mt-8 px-6 py-3 text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default FilterSidebar;
