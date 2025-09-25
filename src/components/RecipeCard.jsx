import React from 'react';

const RecipeCard = ({ recipe, onSelect, onViewDetails, isFavorite, onToggleFavorite, isSelected }) => {
  const { id, title, photoUrl, tags, category, difficulty, prepTime, prepTimeMinutes, steps, ingredients, isNew } = recipe;
  
  // Use title (new structure) or fallback to name (old structure)
  const recipeTitle = title || recipe.name || 'מתכון ללא שם';
  const recipeImage = photoUrl || recipe.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  const recipePrepTime = prepTimeMinutes || (prepTime ? parseInt(prepTime) : 0);

  const handleCardClick = (e) => {
    // Prevent event bubbling when clicking on buttons
    if (e.target.closest('.view-details-btn') || e.target.closest('.heart-btn')) {
      return;
    }
    onSelect && onSelect(recipe);
  };

  return (
    <div 
      className={`recipe-card bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-500 cursor-pointer transform hover:scale-[1.02] sm:hover:scale-105 flex flex-col h-full ${
        isNew ? 'animate-fadeInSlideDown opacity-0' : 'opacity-100'
      } ${isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
      style={{
        animation: isNew ? 'fadeInSlideDown 0.6s ease-out forwards' : undefined
      }}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-lg sm:rounded-t-xl">
        <img
          src={recipeImage}
          alt={recipeTitle}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
          {/* Selected Indicator */}
          {isSelected && (
            <div className="bg-green-500 text-white rounded-full p-1.5 sm:p-2 shadow-md">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(recipe);
            }}
            className="heart-btn bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg"
            title={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
          >
            <svg 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${
                isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-400'
              }`} 
              fill={isFavorite ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
          
          {/* Prep Time */}
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-700">
            {recipePrepTime} דקות
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Content that can grow */}
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-2 sm:mb-3 line-clamp-2">
            {recipeTitle}
          </h3>
          <div className="flex items-center justify-between text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            <span className="flex items-center">

            </span>
            {category && (
              <span className="text-orange-600 font-semibold text-base sm:text-lg">{category}</span>
            )}
          </div>
        </div>
        
        {/* Button always at the bottom */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails && onViewDetails(recipe);
          }}
          className="view-details-btn w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg mt-auto"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          היכנס למתכון
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
