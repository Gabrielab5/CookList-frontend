import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import FilterSidebar from "../components/FilterSidebar";
import RecipeCard from "../components/RecipeCard";
import AddRecipeButton from "../components/AddRecipeButton";
import AddRecipeModal from "../components/AddRecipeModal";
import AiRecipeButton from "../components/AiRecipeButton";
import AiRecipePromptModal from "../components/AiRecipePromptModal";
import AiRecipePreviewModal from "../components/AiRecipePreviewModal";
import ShoppingList from "../components/ShoppingList";
import CurrentShoppingList from "../components/CurrentShoppingList";
import RecipeDetailModal from "../components/RecipeDetailModal";
import {
  fetchRecipes,
  addRecipe,
  generateRecipe,
  buildShoppingList,
  getShoppingList,
} from "../api";

const Home = () => {
  const location = useLocation();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [isGeneratingAiRecipe, setIsGeneratingAiRecipe] = useState(false);

  const [filters, setFilters] = useState({
    tags: [],
    ingredientSearch: "",
    excludeIngredients: "",
    categories: [],
    pantryItems: [],
    prepTimeRange: "",
    servingsRange: "",
    difficultyLevel: "",
    sortBy: "title",
  });
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [isAddRecipeModalOpen, setIsAddRecipeModalOpen] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [selectedRecipeForDetails, setSelectedRecipeForDetails] = useState(null);
  const [isRecipeDetailModalOpen, setIsRecipeDetailModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // AI Recipe states
  const [isAiPromptModalOpen, setIsAiPromptModalOpen] = useState(false);
  const [isAiPreviewModalOpen, setIsAiPreviewModalOpen] = useState(false);
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favoriteRecipes");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  // Fetch recipes from API
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRecipes();
        console.log("Fetched recipes:", data);
        console.log("First recipe structure:", data[0]);
        setRecipes(data);
      } catch (err) {
        console.error("Error loading recipes:", err);
        setError(err.message || "שגיאה בטעינת המתכונים מהשרת");
        setRecipes([]); // No fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    loadRecipes();
  }, []);

  // Handle navigation from Favorites page to open recipe details
  useEffect(() => {
    if (location.state?.openRecipeDetails) {
      setSelectedRecipeForDetails(location.state.openRecipeDetails);
      setIsRecipeDetailModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes.filter((recipe) => {
      // Filter logic (tags, categories, ingredients, prepTime, servings) stays the same
      if (filters.tags?.length && !filters.tags.some(tag => recipe.tags.includes(tag))) return false;
      if (filters.categories?.length && !filters.categories.includes(recipe.category)) return false;
      if (filters.ingredientSearch) {
        const searchTerm = filters.ingredientSearch.toLowerCase();
        if (!recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm))) return false;
      }
      if (filters.excludeIngredients) {
        const excludeTerm = filters.excludeIngredients.toLowerCase();
        if (recipe.ingredients.some(i => i.toLowerCase().includes(excludeTerm))) return false;
      }
      if (filters.pantryItems?.length) {
        if (!filters.pantryItems.some(item => recipe.ingredients.some(i => i.toLowerCase().includes(item.toLowerCase())))) return false;
      }
      if (filters.prepTimeRange) {
        const prepTime = recipe.prepTimeMinutes;
        switch (filters.prepTimeRange) {
          case "quick": if (prepTime > 15) return false; break;
          case "short": if (prepTime < 16 || prepTime > 30) return false; break;
          case "medium": if (prepTime < 31 || prepTime > 60) return false; break;
          case "long": if (prepTime < 61) return false; break;
        }
      }
      if (filters.servingsRange) {
        const servings = recipe.servings;
        switch (filters.servingsRange) {
          case "1-2": if (servings < 1 || servings > 2) return false; break;
          case "3-4": if (servings < 3 || servings > 4) return false; break;
          case "5-6": if (servings < 5 || servings > 6) return false; break;
          case "7+": if (servings < 7) return false; break;
        }
      }
      return true;
    });

    // Sort recipes
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "title": 
            return (a.name || a.title || '').localeCompare(b.name || b.title || '', 'he-IL');
          case "title-desc": 
            return (b.name || b.title || '').localeCompare(a.name || a.title || '', 'he-IL');
          case "prepTime": 
            return (a.prepTimeMinutes || 0) - (b.prepTimeMinutes || 0);
          case "prepTime-desc": 
            return (b.prepTimeMinutes || 0) - (a.prepTimeMinutes || 0);
          case "category": 
            return (a.category || '').localeCompare(b.category || '', 'he-IL');
          default: 
            return 0;
        }
      });
    }

    return filtered;
  }, [recipes, filters]);

  // Handle adding new recipe via API
  const handleAddNewRecipe = async (newRecipe) => {
    try {
      setIsAddingRecipe(true);
      const savedRecipe = await addRecipe(newRecipe);
      setRecipes(prev => [savedRecipe, ...prev]);
      alert("המתכון נוסף בהצלחה!");
    } catch (err) {
      console.error("Error adding recipe:", err);
      alert(err.message || "שגיאה בשמירת המתכון. המתכון נוסף מקומית בלבד.");
      // Add locally as fallback
      const localRecipe = {
        ...newRecipe,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setRecipes(prev => [localRecipe, ...prev]);
    } finally {
      setIsAddingRecipe(false);
    }
  };

  // Handle AI recipe generation
  const handleGenerateAiRecipe = async (prompt) => {
    try {
      setIsGeneratingAiRecipe(true);
      const generatedRecipe = await generateRecipe({ prompt });
      setAiGeneratedRecipe(generatedRecipe);
      setIsAiPreviewModalOpen(true);
    } catch (err) {
      console.error('Error generating AI recipe:', err);
      throw new Error(err.message || 'שגיאה ביצירת המתכון עם AI');
    } finally {
      setIsGeneratingAiRecipe(false);
    }
  };

  // Handle adding AI generated recipe to user's recipes
  const handleAddAiRecipe = async (recipe) => {
    try {
      const savedRecipe = await addRecipe(recipe);
      setRecipes(prev => [savedRecipe, ...prev]);
      alert('המתכון נוסף בהצלחה למתכונים שלך!');
    } catch (err) {
      console.error('Error adding AI recipe:', err);
      // Fallback: add locally
      const localRecipe = {
        ...recipe,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      setRecipes(prev => [localRecipe, ...prev]);
      alert('המתכון נוסף למתכונים שלך (שמירה מקומית)');
    }
  };

  // Handle building shopping list via API
  const handleGenerateShoppingList = async () => {
    if (!selectedRecipes.length) {
      alert("אנא בחר לפחות מתכון אחד כדי ליצור רשימת קניות.");
      return;
    }
    try {
      const list = await buildShoppingList({
        userId: "currentUserId",
        title: "רשימת קניות חדשה",
        recipeIds: selectedRecipes.map(r => r.id || r.title),
      });
      console.log("Shopping list created:", list);
      setShowShoppingList(true);
    } catch (err) {
      console.error(err);
      alert("Failed to create shopping list");
    }
  };

  const handleViewCurrentList = async () => {
    try {
      const currentListData = localStorage.getItem("currentShoppingList");
      if (!currentListData) return;

      const currentList = JSON.parse(currentListData);
      // Fetch shopping list from API if needed
      // const list = await getShoppingList(currentList.id);

      setSelectedRecipes(
        currentList.recipes
          .map(title => recipes.find(r => r.title === title))
          .filter(Boolean)
      );
      setShowShoppingList(true);
    } catch (err) {
      console.error(err);
      alert("Failed to load current shopping list");
    }
  };

  // Other handlers remain mostly the same (toggle sidebar, recipe select, favorites, modals)

  // Render
  if (showShoppingList) {
    return (
      <ShoppingList
        selectedRecipes={selectedRecipes}
        onBack={() => setShowShoppingList(false)}
        onAddToHistory={(data) => {
          localStorage.removeItem("currentShoppingList");
          alert("רשימת הקניות נוספה להיסטוריה בהצלחה!");
          setShowShoppingList(false);
        }}
      />
    );
  }

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      <span className="ml-3 text-gray-600">טוען מתכונים...</span>
    </div>
  );

  // Error display component
  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-red-800 font-medium">{error}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          נסה שוב
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        <CurrentShoppingList onViewList={handleViewCurrentList} />
        
        {/* Error Display */}
        {error && (
          <ErrorDisplay 
            error={error} 
              onRetry={() => {
                setError(null);
                // Retry loading recipes
                const loadRecipes = async () => {
                  try {
                    setLoading(true);
                    const data = await fetchRecipes();
                    setRecipes(data);
                  } catch (err) {
                    setError(err.message || "שגיאה בטעינת המתכונים מהשרת");
                    setRecipes([]);
                  } finally {
                    setLoading(false);
                  }
                };
                loadRecipes();
              }}
          />
        )}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {isSidebarOpen && (
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 transition-all duration-300 ease-in-out">
              <FilterSidebar
                onFilterChange={setFilters}
                onIngredientSearch={(search) => {}}
              />
                        </div>
          )}
          <div className="flex-1 min-w-0">
            {/* Header & Add Recipe Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  מתכונים
                </h2>
                            <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium relative ${
                    isSidebarOpen
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-orange-100 hover:bg-orange-200 text-orange-700"
                  }`}
                  title={isSidebarOpen ? "הסתר מסננים" : "הצג מסננים"}
                >
                  {/* SVG icon */}
                  <span className="hidden sm:inline">
                    {isSidebarOpen ? "הסתר מסננים" : "הצג מסננים"}
                  </span>
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
                <AiRecipeButton onClick={() => setIsAiPromptModalOpen(true)} />
                <AddRecipeButton onClick={() => setIsAddRecipeModalOpen(true)} />
                    </div>
                </div>

            {/* Recipe Grid */}
            <div className="mt-8">
              {loading ? (
                <LoadingSpinner />
              ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    {error ? "לא ניתן לטעון מתכונים מהשרת" : "אין מתכונים זמינים כרגע"}
                  </div>
                  {error && (
                    <button
                      onClick={() => {
                        setError(null);
                        const loadRecipes = async () => {
                          try {
                            setLoading(true);
                            const data = await fetchRecipes();
                            setRecipes(data);
                          } catch (err) {
                            setError(err.message || "שגיאה בטעינת המתכונים מהשרת");
                            setRecipes([]);
                          } finally {
                            setLoading(false);
                          }
                        };
                        loadRecipes();
                      }}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      נסה שוב
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {filteredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe.id || recipe.title || `recipe-${index}`}
                  recipe={recipe}
                  onSelect={(r) =>
                    setSelectedRecipes(prev =>
                      prev.some(x => (x.id || x.title) === (r.id || r.title))
                        ? prev.filter(x => (x.id || x.title) !== (r.id || r.title))
                        : [...prev, r]
                    )
                  }
                  onViewDetails={(r) => {
                    setSelectedRecipeForDetails(r);
                    setIsRecipeDetailModalOpen(true);
                  }}
                  isFavorite={favorites.some(f => (f.id || f.title) === (recipe.id || recipe.title))}
                  onToggleFavorite={(r) => {
                    setFavorites(prev => {
                      const isFav = prev.some(f => (f.id || f.title) === (r.id || r.title));
                      const newFavs = isFav
                        ? prev.filter(f => (f.id || f.title) !== (r.id || r.title))
                        : [...prev, r];
                      localStorage.setItem("favoriteRecipes", JSON.stringify(newFavs));
                      return newFavs;
                    });
                  }}
                  />
                  ))}
                </div>
              )}
            </div>
                        </div>
                    </div>
                </div>

      <AddRecipeModal
        isOpen={isAddRecipeModalOpen}
        onClose={() => setIsAddRecipeModalOpen(false)}
        onAddRecipe={handleAddNewRecipe}
        isLoading={isAddingRecipe}
      />

      <RecipeDetailModal
        recipe={selectedRecipeForDetails}
        isOpen={isRecipeDetailModalOpen}
        onClose={() => setIsRecipeDetailModalOpen(false)}
        onAddToShoppingList={(r) => {
          if (!selectedRecipes.some(x => (x.id || x.title) === (r.id || r.title)))
            setSelectedRecipes(prev => [...prev, r]);
          setIsRecipeDetailModalOpen(false);
        }}
      />

      {/* AI Recipe Modals */}
      <AiRecipePromptModal
        isOpen={isAiPromptModalOpen}
        onClose={() => setIsAiPromptModalOpen(false)}
        onGenerate={handleGenerateAiRecipe}
      />

      <AiRecipePreviewModal
        isOpen={isAiPreviewModalOpen}
        onClose={() => setIsAiPreviewModalOpen(false)}
        recipe={aiGeneratedRecipe}
        onAddToRecipes={handleAddAiRecipe}
      />
        </div>
    );
};

export default Home;