const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import apiService from './services/api';

// Fetch all recipes with proper error handling
export async function fetchRecipes() {
  try {
    const response = await apiService.get('/recipes');
    console.log("Fetched recipes:", response);
    
    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.success && response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn("Unexpected response format:", response);
      return [];
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw new Error(`שגיאה בטעינת המתכונים: ${error.message}`);
  }
}

// Add new recipe with proper data structure
export async function addRecipe(recipeData) {
  try {
    // Process ingredients - convert strings to objects with name, qty, unit
  const processedIngredients = (recipeData.ingredients || []).map(ingredient => {
      if (typeof ingredient === 'string') {
        // Parse string ingredients like "2 כוסות קמח" or "מלח"
        const parts = ingredient.trim().split(' ');
        if (parts.length >= 3) {
          const qty = parseFloat(parts[0]);
          const unit = parts[1];
          const name = parts.slice(2).join(' ');
          return {
            name: name || ingredient,
            qty: Number.isFinite(qty) ? qty : (isNaN(qty) ? 1 : Number(qty)),
            unit: unit || 'יחידה'
          };
        } else {
          // Default format for simple ingredients
          return {
            name: ingredient,
            qty: 1,
            unit: 'יחידה'
          };
        }
      } else if (ingredient && typeof ingredient === 'object') {
        // Already formatted correctly - coerce qty to number
        const qtyVal = Number(ingredient.qty ?? ingredient.quantity ?? 1);
        return {
          name: ingredient.name || ingredient.ingredientName || '',
          qty: Number.isFinite(qtyVal) && qtyVal > 0 ? qtyVal : 1,
          unit: ingredient.unit || 'יחידה'
        };
      }
      return null;
    }).filter(ing => ing && ing.name);

    // Ensure the data structure matches the backend requirements
    const formattedRecipe = {
      title: recipeData.title || recipeData.name || '',
      photoUrl: recipeData.photoUrl || recipeData.image || '',
      tags: recipeData.tags || [],
      category: recipeData.category || '',
      difficulty: recipeData.difficulty || 'בינוני',
      prepTime: recipeData.prepTime || `${recipeData.prepTimeMinutes || 30} דק`,
      steps: recipeData.steps || recipeData.instructions || [],
      ingredients: processedIngredients
    };

  // Debug: show the exact payload sent to backend
    console.log('Posting recipe to backend:', formattedRecipe);

    // Client-side guard: ensure required fields exist before sending
    if (!formattedRecipe.title || !Array.isArray(formattedRecipe.ingredients) || formattedRecipe.ingredients.length === 0) {
      console.error('addRecipe: Payload missing required fields:', formattedRecipe);
      throw new Error('Title and at least one ingredient are required');
    }

    const response = await apiService.post('/recipes', formattedRecipe);
    console.log("Recipe added successfully:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else if (response._id) {
      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error adding recipe:", error);
    throw new Error(`שגיאה בהוספת המתכון: ${error.message}`);
  }
}

// Get a single recipe by ID
export async function getRecipeById(recipeId) {
  try {
    const response = await apiService.get(`/recipes/${recipeId}`);
    console.log("Recipe fetched:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else if (response._id) {
      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw new Error(`שגיאה בטעינת המתכון: ${error.message}`);
  }
}

// Generate AI recipe
export async function generateRecipe(promptData) {
  try {
    const response = await apiService.post('/recipes/generate', promptData);
    console.log("AI recipe generated:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else if (response._id) {
      return response;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error generating AI recipe:", error);
    throw new Error(`שגיאה ביצירת המתכון עם AI: ${error.message}`);
  }
}

// Shopping Lists

/**
 * Build a new shopping list from selected recipe IDs 
 * @param {string} title 
 * @param {string[]} recipeIds 
 * @returns shopping list object
 */
export async function buildShoppingList({ userId, title, recipeIds }) {
  try {
    const payload = { title, recipeIds, userId };
    const response = await apiService.post('/lists/build', payload);
    console.log('Shopping list created (apiService):', response);

    // Normalize server response
    if (response && response.success && response.data) {
      return { ...response.data, serverMessage: response.message };
    }
    return response;
  } catch (error) {
    console.error("Error building shopping list:", error);
    throw new Error(`שגיאה ביצירת רשימת הקניות: ${error.message}`);
  }
}

/**
 * Fetch a shopping list by ID
 * @param {string} listId 
 * @returns shopping list object
 */
export async function getShoppingList(listId) {
  try {
    const res = await fetch(`${API_URL}/lists/${listId}`);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    const response = await res.json();
    console.log("Shopping list fetched:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error fetching shopping list:", error);
    throw new Error(`שגיאה בטעינת רשימת הקניות: ${error.message}`);
  }
}

/**
 * Get all shopping lists
 * @param {string} status - Optional status filter ('open' or 'done')
 * @returns array of shopping lists
 */
export async function getAllShoppingLists(status = null) {
  try {
    const url = status ? `${API_URL}/lists?status=${status}` : `${API_URL}/lists`;
    const res = await fetch(url);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    const response = await res.json();
    console.log("Shopping lists fetched:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    throw new Error(`שגיאה בטעינת רשימות הקניות: ${error.message}`);
  }
}

/**
 * Update an item in a shopping list
 * @param {string} listId 
 * @param {string} itemId 
 * @param {object} updateData - {checked, qty, unit}
 * @returns updated shopping list
 */
export async function updateShoppingListItem(listId, itemId, updateData) {
  try {
    const res = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    const response = await res.json();
    console.log("Shopping list item updated:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    throw new Error(`שגיאה בעדכון פריט ברשימת הקניות: ${error.message}`);
  }
}

/**
 * Update shopping list status
 * @param {string} listId 
 * @param {string} status - 'open' or 'done'
 * @returns updated shopping list
 */
export async function updateShoppingListStatus(listId, status) {
  try {
    const res = await fetch(`${API_URL}/lists/${listId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    const response = await res.json();
    console.log("Shopping list status updated:", response);
    
    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error updating shopping list status:", error);
    throw new Error(`שגיאה בעדכון סטטוס רשימת הקניות: ${error.message}`);
  }
}

/**
 * Delete a shopping list
 * @param {string} listId 
 * @returns success message
 */
export async function deleteShoppingList(listId) {
  try {
    const res = await fetch(`${API_URL}/lists/${listId}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }
    
    const response = await res.json();
    console.log("Shopping list deleted:", response);
    
    // Handle different response formats
    if (response.success) {
      return response.message || "רשימת הקניות נמחקה בהצלחה";
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    throw new Error(`שגיאה במחיקת רשימת הקניות: ${error.message}`);
  }
}