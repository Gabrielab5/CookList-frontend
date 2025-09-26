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
import SelectedRecipesManager from "../components/SelectedRecipesManager";
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
        const ingredientMatches = recipe.ingredients.some(ingredient => {
          // Handle both object and string ingredient formats
          if (typeof ingredient === 'object' && ingredient.name) {
            return ingredient.name.toLowerCase().includes(searchTerm);
          } else if (typeof ingredient === 'string') {
            return ingredient.toLowerCase().includes(searchTerm);
          }
          return false;
        });
        if (!ingredientMatches) return false;
      }
      if (filters.excludeIngredients) {
        const excludeTerm = filters.excludeIngredients.toLowerCase();
        const hasExcludedIngredient = recipe.ingredients.some(ingredient => {
          // Handle both object and string ingredient formats
          if (typeof ingredient === 'object' && ingredient.name) {
            return ingredient.name.toLowerCase().includes(excludeTerm);
          } else if (typeof ingredient === 'string') {
            return ingredient.toLowerCase().includes(excludeTerm);
          }
          return false;
        });
        if (hasExcludedIngredient) return false;
      }
      if (filters.pantryItems?.length) {
        const hasPantryItem = filters.pantryItems.some(item => 
          recipe.ingredients.some(ingredient => {
            // Handle both object and string ingredient formats
            if (typeof ingredient === 'object' && ingredient.name) {
              return ingredient.name.toLowerCase().includes(item.toLowerCase());
            } else if (typeof ingredient === 'string') {
              return ingredient.toLowerCase().includes(item.toLowerCase());
            }
            return false;
          })
        );
        if (!hasPantryItem) return false;
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
      
      // Add the recipe with a new flag for animation
      const recipeWithAnimation = {
        ...savedRecipe,
        isNew: true
      };
      
      setRecipes(prev => [recipeWithAnimation, ...prev]);
      
      // Remove the animation flag after a short delay
      setTimeout(() => {
        setRecipes(prev => prev.map(recipe => 
          recipe._id === savedRecipe._id || recipe.id === savedRecipe.id
            ? { ...recipe, isNew: false }
            : recipe
        ));
      }, 1000);
      
      // Show success message with missing ingredients info if any
      const successMessage = savedRecipe.message || "המתכון נוסף בהצלחה!";
      alert(successMessage);
    } catch (err) {
      console.error("Error adding recipe:", err);

      // Check if it's a validation error or server error
      if (err.message && (err.message.includes('נדרש') || err.message.includes('תקינים'))) {
        alert(`שגיאת ולידציה: ${err.message}`);
        return; // validation error - inform user
      }

      // Do NOT silently save locally. Surface the error so the user can retry.
      alert("שגיאה בחיבור לשרת. המתכון לא נשמר בשרת. אנא נסה שוב.");
    } finally {
      setIsAddingRecipe(false);
    }
  };

  // Handle AI recipe generation
  const handleGenerateAiRecipe = async (prompt) => {
    try {
      setIsGeneratingAiRecipe(true);
      const generatedRecipe = await generateRecipe({ prompt });
      
      console.log('Generated recipe from API:', generatedRecipe);
      console.log('Raw ingredients:', generatedRecipe.ingredients);
      
      // Process ingredients to ensure proper format
      let processedIngredients = [];
      if (Array.isArray(generatedRecipe.ingredients) && generatedRecipe.ingredients.length > 0) {
        processedIngredients = generatedRecipe.ingredients.map(ing => {
          console.log('Processing AI ingredient:', ing, 'Type:', typeof ing);
          
          if (typeof ing === 'string') {
            return ing;
          } else if (typeof ing === 'object' && ing !== null) {
            // Handle populated ingredient from server
            if (ing.ingredientId && ing.ingredientId.name) {
              const qty = ing.qty || ing.quantity || '';
              const unit = ing.unit || '';
              const name = ing.ingredientId.name;
              const parts = [qty, unit, name].filter(part => part && String(part).trim().length > 0);
              return parts.join(' ').replace(/\s+/g, ' ').trim();
            }
            // Handle direct ingredient object
            else if (ing.name) {
              const qty = ing.qty || ing.quantity || '';
              const unit = ing.unit || '';
              const parts = [qty, unit, ing.name].filter(part => part && String(part).trim().length > 0);
              return parts.join(' ').replace(/\s+/g, ' ').trim();
            } else if (ing.ingredientName) {
              const qty = ing.qty || ing.quantity || '';
              const unit = ing.unit || '';
              const parts = [qty, unit, ing.ingredientName].filter(part => part && String(part).trim().length > 0);
              return parts.join(' ').replace(/\s+/g, ' ').trim();
            } else if (ing.text || ing.description) {
              return ing.text || ing.description;
            } else {
              // Extract any string values from the object
              const values = Object.values(ing).filter(v => 
                typeof v === 'string' && v.trim().length > 0
              );
              return values.join(' ') || 'מרכיב לא מזוהה';
            }
          }
          return String(ing);
        }).filter(ing => ing && ing.trim() && ing !== 'מרכיב לא מזוהה');
      } else {
        console.warn('No ingredients found in AI generated recipe');
        processedIngredients = ['לא נמצאו מרכיבים במתכון הזה'];
      }
      
      // Ensure the recipe has proper structure
      const processedRecipe = {
        ...generatedRecipe,
        id: generatedRecipe._id || generatedRecipe.id || Date.now().toString(),
        ingredients: processedIngredients,
        steps: generatedRecipe.steps || generatedRecipe.instructions || [],
        tags: Array.isArray(generatedRecipe.tags) ? generatedRecipe.tags : []
      };
      
      console.log('Processed recipe for preview:', processedRecipe);
      console.log('Processed ingredients:', processedIngredients);
      
      setAiGeneratedRecipe(processedRecipe);
      setIsAiPreviewModalOpen(true);
    } catch (err) {
      console.error('Error generating AI recipe:', err);
      alert(`שגיאה ביצירת המתכון עם AI: ${err.message}`);
    } finally {
      setIsGeneratingAiRecipe(false);
    }
  };

  // Handle adding AI generated recipe to user's recipes
  const handleAddAiRecipe = async (recipe) => {
    try {
      const savedRecipe = await addRecipe(recipe);
      
      // Add the recipe with a new flag for animation
      const recipeWithAnimation = {
        ...savedRecipe,
        isNew: true
      };
      
      setRecipes(prev => [recipeWithAnimation, ...prev]);
      
      // Remove the animation flag after a short delay
      setTimeout(() => {
        setRecipes(prev => prev.map(r => 
          r._id === savedRecipe._id || r.id === savedRecipe.id
            ? { ...r, isNew: false }
            : r
        ));
      }, 1000);
      
      alert('המתכון נוסף בהצלחה למתכונים שלך!');
    } catch (err) {
      console.error('Error adding AI recipe:', err);
      alert('שגיאה בחיבור לשרת. המתכון לא נשמר בשרת. אנא נסה שוב.');
    }
  };

  // Handle removing a recipe from selected list
  const handleRemoveSelectedRecipe = (recipeToRemove) => {
    setSelectedRecipes(prev => 
      prev.filter(recipe => (recipe.id || recipe.title) !== (recipeToRemove.id || recipeToRemove.title))
    );
  };

  // Handle clearing all selected recipes
  const handleClearAllSelectedRecipes = () => {
    setSelectedRecipes([]);
  };

  // Handle clearing current shopping cart
  const handleClearShoppingCart = () => {
    // Clear the current shopping list from localStorage
    localStorage.removeItem('currentShoppingList');
    // Clear selected recipes
    setSelectedRecipes([]);
    // Go back to main view
    setShowShoppingList(false);
    alert('עגלת הקניות נמחקה בהצלחה');
  };

  // Handle building shopping list via API
  const handleGenerateShoppingList = async () => {
    if (!selectedRecipes.length) {
      alert("אנא בחר לפחות מתכון אחד כדי ליצור רשימת קניות.");
      return;
    }
    // Validate that all selected recipes have server-side IDs (Mongo ObjectId)
    const isObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id));
    const invalidRecipes = selectedRecipes.filter(r => !isObjectId(r._id || r.id));
    if (invalidRecipes.length > 0) {
      const names = invalidRecipes.map(r => r.title || r.name || r.id).join(', ');
      alert(`יש מתכונים שלא נשמרו בשרת: ${names}. שמור את המתכונים בשרת לפני יצירת רשימת קניות.`);
      return;
    }

    try {
      const list = await buildShoppingList({
        userId: "currentUserId",
        title: "רשימת קניות חדשה",
        recipeIds: selectedRecipes.map(r => r._id || r.id),
      });
      console.log("Shopping list created:", list);
      
      // Show message about missing ingredients if any
      if (list.serverMessage) {
        alert(list.serverMessage);
      }
      
      // Convert server response to local format and store
      const serverItems = list.byDept ? 
        Object.values(list.byDept).flat().map(item => ({
          id: item.itemId || `${item.canonicalName}_${item.dept}`,
          name: item.qty && item.unit && item.qty !== 1 ? 
            `${item.qty} ${item.unit} ${item.canonicalName}` :
            item.unit && item.unit !== 'יחידה' ?
            `${item.unit} ${item.canonicalName}` :
            item.canonicalName,
          baseName: item.canonicalName,
          qty: item.qty,
          unit: item.unit,
          quantity: 1,
          recipes: selectedRecipes.map(r => r.title || r.name),
          category: item.dept,
          checked: false
        })) : [];
      
      // Store the created list in localStorage for current shopping list
      localStorage.setItem('currentShoppingList', JSON.stringify({
        ...list,
        items: serverItems,
        recipes: selectedRecipes.map(r => r.title || r.name),
        createdAt: new Date().toISOString()
      }));
      
      setShowShoppingList(true);
    } catch (err) {
      console.error(err);
      alert(`שגיאה ביצירת רשימת הקניות: ${err.message}`);
    }
  };

  const handleViewCurrentList = async () => {
    try {
      const currentListData = localStorage.getItem("currentShoppingList");
      if (!currentListData) {
        alert("אין רשימת קניות נוכחית");
        return;
      }

      // Simply show the shopping list - it will load the data from localStorage
      setShowShoppingList(true);
    } catch (err) {
      console.error("Error loading current shopping list:", err);
      alert("שגיאה בטעינת רשימת הקניות");
    }
  };

  // Other handlers remain mostly the same (toggle sidebar, recipe select, favorites, modals)

  // Render
  if (showShoppingList) {
    return (
      <ShoppingList
        selectedRecipes={selectedRecipes}
        onBack={() => setShowShoppingList(false)}
        onClearCart={handleClearShoppingCart}
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
        <CurrentShoppingList 
          onViewList={handleViewCurrentList} 
          onDeleteList={() => {
            // Force refresh the current shopping list display
            setSelectedRecipes([]);
          }}
        />
        
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
                <AiRecipeButton onClick={() => setIsAiPromptModalOpen(true)} />
                <AddRecipeButton onClick={() => setIsAddRecipeModalOpen(true)} />
                    </div>
                </div>

            {/* Selected Recipes Manager */}
            <SelectedRecipesManager
              selectedRecipes={selectedRecipes}
              onRemoveRecipe={handleRemoveSelectedRecipe}
              onClearAll={handleClearAllSelectedRecipes}
              onGenerateShoppingList={handleGenerateShoppingList}
              onClearCart={localStorage.getItem('currentShoppingList') ? handleClearShoppingCart : null}
            />

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
                <div className="recipe-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                  {filteredRecipes.map((recipe, index) => (
                <RecipeCard
                  key={recipe._id || recipe.id || `recipe-${index}`}
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
                  isSelected={selectedRecipes.some(x => (x.id || x.title) === (recipe.id || recipe.title))}
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