import React, { useState, useMemo } from 'react';
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
                const prepTime = parseInt(recipe.prepTime);
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
                        return parseInt(a.prepTime) - parseInt(b.prepTime);
                    case 'prepTime-desc':
                        return parseInt(b.prepTime) - parseInt(a.prepTime);
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
            alert('Please select at least one recipe to generate a shopping list.');
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
        alert('Shopping list added to history successfully!');
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

    const handleAddRecipeToShoppingList = (recipe) => {
        // Add recipe to selected recipes if not already selected
        if (!selectedRecipes.some(r => r.id === recipe.id)) {
            setSelectedRecipes(prev => [...prev, recipe]);
        }
        // Close the modal
        handleCloseRecipeDetails();
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
            <Header onLogout={() => console.log('Logout')} />
            
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
                {/* Current Shopping List */}
                <CurrentShoppingList onViewList={handleViewCurrentList} />
                
                <div className="flex gap-10">
                    {/* Left Sidebar - Filters */}
                    <div className="w-96 flex-shrink-0">
                        <FilterSidebar 
                            onFilterChange={handleFilterChange}
                            onIngredientSearch={(search) => console.log('Search:', search)}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Recipes Header */}
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-4xl font-bold text-gray-900">Recipes</h2>
                            <div className="flex items-center gap-6">
                                {selectedRecipes.length > 0 && (
                                    <button
                                        onClick={handleGenerateShoppingList}
                                        className="px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg text-lg"
                                    >
                                        Generate Shopping List ({selectedRecipes.length})
                                    </button>
                                )}
                                <AddRecipeButton onClick={handleAddRecipe} />
                            </div>
                        </div>

                        {/* Recipe Grid */}
                        {filteredRecipes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                {filteredRecipes.map(recipe => (
                                    <div key={recipe.id} className="relative">
                                        <RecipeCard 
                                            recipe={recipe} 
                                            onSelect={handleRecipeSelect}
                                            onViewDetails={handleViewRecipeDetails}
                                        />
                                        {selectedRecipes.some(r => r.id === recipe.id) && (
                                            <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-2">
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
                                <h3 className="text-2xl font-semibold text-gray-900 mb-3">No recipes found</h3>
                                <p className="text-gray-600 mb-6 text-lg">Try adjusting your filters or search terms.</p>
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
                                    Clear filters
                                </button>
                            </div>
                        )}

                        {/* Selected Recipes Summary */}
                        {selectedRecipes.length > 0 && (
                            <div className="mt-10 bg-white rounded-xl shadow-md p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    Selected Recipes ({selectedRecipes.length})
                                </h3>
                                <div className="flex flex-wrap gap-3">
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