import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailModal from '../components/RecipeDetailModal';

const Favorites = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // טען מועדפים מ-localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favoriteRecipes');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    }, []);

    const handleToggleFavorite = (recipe) => {
        setFavorites(prevFavorites => {
            const isFavorite = prevFavorites.some(fav => fav.id === recipe.id);
            let newFavorites;
            
            if (isFavorite) {
                // הסר מהמועדפים
                newFavorites = prevFavorites.filter(fav => fav.id !== recipe.id);
            } else {
                // הוסף למועדפים
                newFavorites = [...prevFavorites, recipe];
            }
            
            // שמור ב-localStorage
            localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const handleViewRecipeDetails = (recipe) => {
        setSelectedRecipe(recipe);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecipe(null);
    };

    const handleRecipeSelect = (recipe) => {
        // טיפול בבחירת מתכון לרשימת קניות (זהה לעמוד הבית)
    };

    const handleAddToShoppingList = (recipe) => {
        // הוסף מתכון לרשימת קניות
        // כאן ניתן להוסיף לוגיקה להוספת המתכון לרשימת קניות
        alert(`המתכון "${recipe.name}" נוסף לרשימת הקניות!`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onLogout={() => navigate('/login')} />
            
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
                {/* כותרת העמוד */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">המועדפים שלי</h1>
                    <p className="text-lg text-gray-600">
                        {favorites.length === 0 
                            ? "אין עדיין מתכונים מועדפים. התחל להוסיף מתכונים למועדפים שלך!"
                            : `יש לך ${favorites.length} ${favorites.length === 1 ? 'מתכון' : 'מתכונים'} ${favorites.length === 1 ? 'מועדף' : 'מועדפים'}`
                        }
                    </p>
                </div>

                {/* רשת המועדפים */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {favorites.map(recipe => (
                            <div key={recipe.id} className="relative">
                                <RecipeCard 
                                    recipe={recipe} 
                                    onSelect={handleRecipeSelect}
                                    onViewDetails={handleViewRecipeDetails}
                                    isFavorite={true} // תמיד true מכיוון שאנחנו בעמוד המועדפים
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3">אין עדיין מועדפים</h3>
                                <p className="text-gray-600 mb-6 text-lg">התחל לחקור מתכונים והוסף אותם למועדפים שלך!</p>
                                <button
                                    onClick={() => navigate('/home')}
                                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200 text-lg"
                                >
                                    עיין במתכונים
                                </button>
                    </div>
                )}
            </div>

            {/* Recipe Detail Modal */}
            <RecipeDetailModal
                recipe={selectedRecipe}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onAddToShoppingList={handleAddToShoppingList}
            />
        </div>
    );
};

export default Favorites;
