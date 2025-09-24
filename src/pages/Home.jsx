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
import { mockRecipes } from "../data/mockRecipes";
import {
  fetchRecipes,
  addRecipe,
  buildShoppingList,
  getShoppingList,
} from "../api";
import { aiRecipeService } from "../services/api";

const Home = () => {
  const location = useLocation();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    tags: [],
    ingredientSearch: "",
    excludeIngredients: "",
    categories: [],
    pantryItems: [],
    prepTimeRange: "",
    // servingsRange: "",
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
        const data = await fetchRecipes();
        console.log("Fetched recipes:", data);
        setRecipes(data);
      } catch (err) {
        console.error(err);
        setError("Could not load recipes from server. Using mock data.");
        setRecipes(mockRecipes); // fallback
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
    //   if (filters.servingsRange) {
    //     const servings = recipe.servings;
    //     switch (filters.servingsRange) {
    //       case "1-2": if (servings < 1 || servings > 2) return false; break;
    //       case "3-4": if (servings < 3 || servings > 4) return false; break;
    //       case "5-6": if (servings < 5 || servings > 6) return false; break;
    //       case "7+": if (servings < 7) return false; break;
    //     }
    //   }
      return true;
    });

    // Sort recipes
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "title": return a.title.localeCompare(b.title);
          case "title-desc": return b.title.localeCompare(a.title);
          case "prepTime": return a.prepTimeMinutes - b.prepTimeMinutes;
          case "prepTime-desc": return b.prepTimeMinutes - a.prepTimeMinutes;
        //   case "servings": return a.servings - b.servings;
        //   case "servings-desc": return b.servings - a.servings;
          case "category": return a.category.localeCompare(b.category);
          default: return 0;
        }
      });
    }

    return filtered;
  }, [recipes, filters]);

  // Handle adding new recipe via API
  const handleAddNewRecipe = async (newRecipe) => {
    try {
      const savedRecipe = await addRecipe(newRecipe);
      setRecipes(prev => [savedRecipe, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to save recipe to server. Added locally only.");
      setRecipes(prev => [newRecipe, ...prev]);
    }
  };

  // Handle AI recipe generation
  const handleGenerateAiRecipe = async (prompt) => {
    try {
      const generatedRecipe = await aiRecipeService.generateRecipe(prompt);
      setAiGeneratedRecipe(generatedRecipe);
      setIsAiPreviewModalOpen(true);
    } catch (err) {
      console.error('Error generating AI recipe:', err);
      throw new Error('שגיאה ביצירת המתכון עם AI');
    }
  };

  // Handle adding AI generated recipe to user's recipes
  const handleAddAiRecipe = async (recipe) => {
    try {
      const savedRecipe = await aiRecipeService.addAiRecipe(recipe);
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
        recipeIds: selectedRecipes.map(r => r.id),
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

    return (
        <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        <CurrentShoppingList onViewList={handleViewCurrentList} />
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
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={(r) =>
                    setSelectedRecipes(prev =>
                      prev.some(x => x.id === r.id)
                        ? prev.filter(x => x.id !== r.id)
                        : [...prev, r]
                    )
                  }
                  onViewDetails={(r) => {
                    setSelectedRecipeForDetails(r);
                    setIsRecipeDetailModalOpen(true);
                  }}
                  isFavorite={favorites.some(f => f.id === recipe.id)}
                  onToggleFavorite={(r) => {
                    setFavorites(prev => {
                      const isFav = prev.some(f => f.id === r.id);
                      const newFavs = isFav
                        ? prev.filter(f => f.id !== r.id)
                        : [...prev, r];
                      localStorage.setItem("favoriteRecipes", JSON.stringify(newFavs));
                      return newFavs;
                    });
                  }}
                />
              ))}
            </div>
                        </div>
                    </div>
                </div>

      <AddRecipeModal
        isOpen={isAddRecipeModalOpen}
        onClose={() => setIsAddRecipeModalOpen(false)}
        onAddRecipe={handleAddNewRecipe}
      />

      <RecipeDetailModal
        recipe={selectedRecipeForDetails}
        isOpen={isRecipeDetailModalOpen}
        onClose={() => setIsRecipeDetailModalOpen(false)}
        onAddToShoppingList={(r) => {
          if (!selectedRecipes.some(x => x.id === r.id))
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