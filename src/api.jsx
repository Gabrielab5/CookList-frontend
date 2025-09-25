const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Enhanced API service with proper error handling and loading states
class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const apiService = new ApiService();

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
    // Ensure the data structure matches the backend requirements
    const formattedRecipe = {
      title: recipeData.title || recipeData.name || '',
      photoUrl: recipeData.photoUrl || recipeData.image || '',
      tags: recipeData.tags || [],
      category: recipeData.category || '',
      difficulty: recipeData.difficulty || 'בינוני',
      prepTime: recipeData.prepTime || `${recipeData.prepTimeMinutes || 30} דק`,
      steps: recipeData.steps || recipeData.instructions || [],
      ingredients: recipeData.ingredients || []
    };

    const response = await apiService.post('/recipes', formattedRecipe);
    console.log("Recipe added successfully:", response);
    return response;
  } catch (error) {
    console.error("Error adding recipe:", error);
    throw new Error(`שגיאה בהוספת המתכון: ${error.message}`);
  }
}

// Generate AI recipe
export async function generateRecipe(promptData) {
  try {
    const response = await apiService.post('/recipes/generate', promptData);
    console.log("AI recipe generated:", response);
    return response;
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
  const res = await fetch(`${API_URL}/api/lists/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, recipeIds }),
  });
  if (!res.ok) throw new Error("Failed to build shopping list");
  return res.json();
}

/**
 * Fetch a shopping list by ID
 * @param {string} listId 
 * @returns shopping list object
 */
export async function getShoppingList(listId) {
  const res = await fetch(`${API_URL}/api/lists/${listId}`);
  if (!res.ok) throw new Error("Failed to fetch shopping list");
  return res.json();
}