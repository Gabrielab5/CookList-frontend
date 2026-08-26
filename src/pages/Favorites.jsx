import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import RecipeCard from '../components/RecipeCard';
import RecipeDetailModal from '../components/RecipeDetailModal';
import { fetchFavorites, removeFavorite } from '../api';

const Favorites = () => {
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // טען מועדפים מהשרת
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchFavorites();
                if (!cancelled) setFavorites(data);
            } catch (err) {
                console.error('Error loading favorites:', err);
                if (!cancelled) setError('שגיאה בטעינת המועדפים');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    // בעמוד הזה כל מתכון הוא כבר מועדף, אז הסרה בלבד
    const handleToggleFavorite = async (recipe) => {
        const recipeId = recipe._id || recipe.id;
        const previous = favorites;
        setFavorites(prev => prev.filter(fav => (fav._id || fav.id) !== recipeId));

        try {
            await removeFavorite(recipeId);
        } catch (err) {
            console.error('Error removing favorite:', err);
            alert('שגיאה בהסרת המתכון מהמועדפים');
            setFavorites(previous); // rollback on failure
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header onLogout={() => navigate('/login')} />
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="mr-3 text-gray-600">טוען מועדפים...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header onLogout={() => navigate('/login')} />
                <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16 text-center">
                    <p className="text-red-600 text-lg">{error}</p>
                </div>
            </div>
        );
    }

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
                            <div key={recipe._id} className="relative">
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
