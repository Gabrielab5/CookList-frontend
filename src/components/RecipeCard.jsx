import React from 'react';

const RecipeCard = ({ recipe, onSelect, onViewDetails, isFavorite, onToggleFavorite }) => {
  const { id, title, photoUrl, tags, category, difficulty, prepTime, steps, ingredients } = recipe;

  const handleCardClick = (e) => {
    // Prevent event bubbling when clicking on buttons
    if (e.target.closest('.view-details-btn') || e.target.closest('.heart-btn')) {
      return;
    }
    onSelect && onSelect(recipe);
  };

  return (
    <div 
      className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] sm:hover:scale-105"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-t-lg sm:rounded-t-xl">
        <img
          src={photoUrl}
          alt={title}
          className="w-full h-48 sm:h-56 md:h-64 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
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
            {prepTime} דקות
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-2 sm:mb-3 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {/* {servings} מנות */}
          </span>
          <span className="text-orange-600 font-semibold text-base sm:text-lg">{category}</span>
        </div>
        
        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails && onViewDetails(recipe);
          }}
          className="view-details-btn w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg"
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
