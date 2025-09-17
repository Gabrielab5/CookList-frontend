import React from 'react';

const RecipeCard = ({ recipe, onSelect }) => {
  const { id, name, image, category, tags, prepTime, servings } = recipe;

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={() => onSelect && onSelect(recipe)}
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={image}
          alt={name}
          className="w-full h-64 object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
          }}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-medium text-gray-700">
          {prepTime}
        </div>
        {tags && tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 text-xl mb-3 line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center justify-between text-base text-gray-600">
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {servings} servings
          </span>
          <span className="text-orange-600 font-semibold text-lg">{category}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
