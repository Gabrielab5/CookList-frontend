import React from 'react';

const HeroImage = () => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Using Unsplash for food-related hero image */}
      <img
        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        alt="Delicious cooking ingredients"
        className="absolute inset-0 h-full w-full object-cover transform scale-105 transition-transform duration-700 hover:scale-110"
      />
      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60"></div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-center bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent drop-shadow-2xl">
            CookList
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-center max-w-lg opacity-95 font-medium leading-relaxed drop-shadow-lg">
            Organize your recipes, plan your meals, and cook with confidence.
          </p>
          <div className="flex items-center justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-orange-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-orange-200 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImage;
