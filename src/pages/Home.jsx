import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import FilterSidebar from '../components/FilterSidebar';
import RecipeCard from '../components/RecipeCard';
import AddRecipeButton from '../components/AddRecipeButton';
import AddRecipeModal from '../components/AddRecipeModal';
import ShoppingList from '../components/ShoppingList';
import CurrentShoppingList from '../components/CurrentShoppingList';
import RecipeDetailModal from '../components/RecipeDetailModal';
import { mockRecipes } from '../data/mockRecipes';

const Home = () => {
    const location = useLocation();
    const [recipes, setRecipes] = useState(mockRecipes);
    const [filters, setFilters] = useState({ 
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
    const [selectedRecipes, setSelectedRecipes] = useState([]);
    const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
    const [showShoppingList, setShowShoppingList] = useState(false);
    const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState(null);
    const [isRecipeDetailModalOpen, setIsRecipeDetailModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [favorites, setFavorites] = useState(() => {
        // Load favorites from localStorage on component mount
        const savedFavorites = localStorage.getItem('favoriteRecipes');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    // Handle navigation from Favorites page to open recipe details
    useEffect(() => {
        if (location.state?.openRecipeDetails) {
            setSelectedRecipeForDetails(location.state.openRecipeDetails);
            setIsRecipeDetailModalOpen(true);
            // Clear the state to prevent reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Filter and sort recipes based on selected filters
    const filteredRecipes = useMemo(() => {
        let filtered = recipes.filter(recipe => {
            // Filter by tags
            if (filters.tags && filters.tags.length > 0) {
                const hasMatchingTag = filters.tags.some(tag => 
                    recipe.tags.includes(tag)
                );
                if (!hasMatchingTag) return false;
            }

            // Filter by categories
            if (filters.categories && filters.categories.length > 0) {
                if (!filters.categories.includes(recipe.category)) return false;
            }

            // Filter by ingredient search (must include)
            if (filters.ingredientSearch) {
                const searchTerm = filters.ingredientSearch.toLowerCase();
                const hasMatchingIngredient = recipe.ingredients.some(ingredient =>
                    ingredient.toLowerCase().includes(searchTerm)
                );
                if (!hasMatchingIngredient) return false;
            }

            // Filter by exclude ingredients
            if (filters.excludeIngredients) {
                const excludeTerm = filters.excludeIngredients.toLowerCase();
                const hasExcludedIngredient = recipe.ingredients.some(ingredient =>
                    ingredient.toLowerCase().includes(excludeTerm)
                );
                if (hasExcludedIngredient) return false;
            }

            // Filter by pantry items
            if (filters.pantryItems && filters.pantryItems.length > 0) {
                const hasPantryItem = filters.pantryItems.some(item =>
                    recipe.ingredients.some(ingredient =>
                        ingredient.toLowerCase().includes(item.toLowerCase())
                    )
                );
                if (!hasPantryItem) return false;
            }

            // Filter by prep time
            if (filters.prepTimeRange) {
                const prepTime = recipe.prepTimeMinutes;
                switch (filters.prepTimeRange) {
                    case 'quick':
                        if (prepTime > 15) return false;
                        break;
                    case 'short':
                        if (prepTime < 16 || prepTime > 30) return false;
                        break;
                    case 'medium':
                        if (prepTime < 31 || prepTime > 60) return false;
                        break;
                    case 'long':
                        if (prepTime < 61) return false;
                        break;
                }
            }

            // Filter by servings
            if (filters.servingsRange) {
                const servings = recipe.servings;
                switch (filters.servingsRange) {
                    case '1-2':
                        if (servings < 1 || servings > 2) return false;
                        break;
                    case '3-4':
                        if (servings < 3 || servings > 4) return false;
                        break;
                    case '5-6':
                        if (servings < 5 || servings > 6) return false;
                        break;
                    case '7+':
                        if (servings < 7) return false;
                        break;
                }
            }

            return true;
        });

        // Sort recipes
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'name':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'prepTime':
                        return a.prepTimeMinutes - b.prepTimeMinutes;
                    case 'prepTime-desc':
                        return b.prepTimeMinutes - a.prepTimeMinutes;
                    case 'servings':
                        return a.servings - b.servings;
                    case 'servings-desc':
                        return b.servings - a.servings;
                    case 'category':
                        return a.category.localeCompare(b.category);
                    default:
                        return 0;
                }
            });
        }

        return filtered;
    }, [recipes, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleRecipeSelect = (recipe) => {
        setSelectedRecipes(prev => {
            const isSelected = prev.some(r => r.id === recipe.id);
            if (isSelected) {
                return prev.filter(r => r.id !== recipe.id);
            } else {
                return [...prev, recipe];
            }
        });
    };

    const handleAddRecipe = () => {
        setIsAddRecipeModalOpen(true);
    };

    const handleCloseAddRecipeModal = () => {
        setIsAddRecipeModalOpen(false);
    };

    const handleAddNewRecipe = (newRecipe) => {
        setRecipes(prevRecipes => [newRecipe, ...prevRecipes]);
    };

    const handleGenerateShoppingList = () => {
        if (selectedRecipes.length === 0) {
            alert('אנא בחר לפחות מתכון אחד כדי ליצור רשימת קניות.');
            return;
        }
        setShowShoppingList(true);
    };

    const handleBackToRecipes = () => {
        setShowShoppingList(false);
    };

    const handleAddToHistory = (shoppingListData) => {
        // Clear current shopping list from localStorage
        localStorage.removeItem('currentShoppingList');
        
        // Show success message or redirect
        alert('רשימת הקניות נוספה להיסטוריה בהצלחה!');
        setShowShoppingList(false);
    };

    const handleViewCurrentList = () => {
        // Load current shopping list and show it
        const currentListData = localStorage.getItem('currentShoppingList');
        if (currentListData) {
            const currentList = JSON.parse(currentListData);
            setSelectedRecipes(currentList.recipes.map(recipeName => 
                recipes.find(recipe => recipe.name === recipeName)
            ).filter(Boolean));
            setShowShoppingList(true);
        }
    };

    const handleViewRecipeDetails = (recipe) => {
        setSelectedRecipeForDetails(recipe);
        setIsRecipeDetailModalOpen(true);
    };

    const handleCloseRecipeDetails = () => {
        setIsRecipeDetailModalOpen(false);
        setSelectedRecipeForDetails(null);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleAddRecipeToShoppingList = (recipe) => {
        // Add recipe to selected recipes if not already selected
        if (!selectedRecipes.some(r => r.id === recipe.id)) {
            setSelectedRecipes(prev => [...prev, recipe]);
        }
        // Close the modal
        handleCloseRecipeDetails();
    };

    const handleToggleFavorite = (recipe) => {
        setFavorites(prevFavorites => {
            const isFavorite = prevFavorites.some(fav => fav.id === recipe.id);
            let newFavorites;
            
            if (isFavorite) {
                // Remove from favorites
                newFavorites = prevFavorites.filter(fav => fav.id !== recipe.id);
            } else {
                // Add to favorites
                newFavorites = [...prevFavorites, recipe];
            }
            
            // Save to localStorage
            localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    // Show shopping list if active
    if (showShoppingList) {
        return (
            <ShoppingList 
                selectedRecipes={selectedRecipes}
                onBack={handleBackToRecipes}
                onAddToHistory={handleAddToHistory}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
                {/* Current Shopping List */}
                <CurrentShoppingList onViewList={handleViewCurrentList} />
                
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
                    {/* Left Sidebar - Filters */}
                    {isSidebarOpen && (
                        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 transition-all duration-300 ease-in-out">
                            <FilterSidebar 
                                onFilterChange={handleFilterChange}
                                onIngredientSearch={(search) => {
                                    // Handle ingredient search if needed
                                }}
                            />
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Recipes Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">מתכונים</h2>
                                {/* Sidebar Toggle Button */}
                                <button
                                    onClick={toggleSidebar}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium relative ${
                                        isSidebarOpen 
                                            ? "bg-gray-100 hover:bg-gray-200 text-gray-700" 
                                            : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                                    }`}
                                    title={isSidebarOpen ? "הסתר מסננים" : "הצג מסננים"}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span className="hidden sm:inline">
                                        {isSidebarOpen ? "הסתר מסננים" : "הצג מסננים"}
                                    </span>
                                    {/* Active filters indicator */}
                                    {!isSidebarOpen && Object.values(filters).some(value => 
                                        Array.isArray(value) ? value.length > 0 : value !== '' && value !== 'name'
                                    ) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 lg:gap-6">
                                {selectedRecipes.length > 0 && (
                                    <button
                                        onClick={handleGenerateShoppingList}
                                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg text-sm sm:text-base lg:text-lg whitespace-nowrap"
                                    >
                                        צור רשימת קניות ({selectedRecipes.length})
                                    </button>
                                )}
                                <AddRecipeButton onClick={handleAddRecipe} />
                            </div>
                        </div>

                         {/* Selected Recipes Summary */}
                         {selectedRecipes.length > 0 && (
                            <div className="mt-10 bg-white rounded-xl shadow-md p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    מתכונים נבחרים ({selectedRecipes.length})
                        </h3>
                                <div className="flex flex-wrap gap-3 pb-5">
                                    {selectedRecipes.map(recipe => (
                                        <span
                                            key={recipe.id}
                                            className="inline-flex items-center px-4 py-2 rounded-full text-base font-medium bg-orange-100 text-orange-800"
                                        >
                                            {recipe.name}
                                            <button
                                                onClick={() => handleRecipeSelect(recipe)}
                                                className="ml-3 text-orange-600 hover:text-orange-800"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                        </div>
                        )}

                        {/* Recipe Grid */}
                        {filteredRecipes.length > 0 ? (
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                                {filteredRecipes.map(recipe => (
                                    <div key={recipe.id} className="relative">
                                        <RecipeCard 
                                            recipe={recipe} 
                                            onSelect={handleRecipeSelect}
                                            onViewDetails={handleViewRecipeDetails}
                                            isFavorite={favorites.some(fav => fav.id === recipe.id)}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                        {selectedRecipes.some(r => r.id === recipe.id) && (
                                            <div className="absolute top-3 left-3 bg-orange-500 text-white rounded-full p-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                    </div>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.576" />
                                </svg>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3">לא נמצאו מתכונים</h3>
                                <p className="text-gray-600 mb-6 text-lg">נסה להתאים את המסננים או מונחי החיפוש שלך.</p>
                                <button
                                    onClick={() => setFilters({ 
                                        tags: [], 
                                        ingredientSearch: '', 
                                        excludeIngredients: '',
                                        categories: [],
                                        pantryItems: [],
                                        prepTimeRange: '',
                                        servingsRange: '',
                                        difficultyLevel: '',
                                        sortBy: 'name'
                                    })}
                                    className="px-6 py-3 text-orange-600 hover:text-orange-700 font-medium text-lg"
                                >
                                    נקה מסננים
                                </button>
                </div>
                        )}

                       
                        </div>
                    </div>
                </div>

            {/* Add Recipe Modal */}
            <AddRecipeModal
                isOpen={isAddRecipeModalOpen}
                onClose={handleCloseAddRecipeModal}
                onAddRecipe={handleAddNewRecipe}
            />

            {/* Recipe Detail Modal */}
            <RecipeDetailModal
                recipe={selectedRecipeForDetails}
                isOpen={isRecipeDetailModalOpen}
                onClose={handleCloseRecipeDetails}
                onAddToShoppingList={handleAddRecipeToShoppingList}
            />
        </div>
    );
};

export default Home;
