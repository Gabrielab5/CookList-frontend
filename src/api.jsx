const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchRecipes() {
  const res = await fetch(`${API_URL}/recipes`);
  if (!res.ok) {
    throw new Error("Failed to fetch recipes");
  }
  const json = await res.json();
  console.log("Fetched recipes:", json);
  // L’API renvoie { success, data, total }. On renvoie directement le tableau.
  return Array.isArray(json) ? json : (json.data ?? []);
}

export async function addRecipe(newRecipe) {
  const res = await fetch(`${API_URL}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRecipe),
  });
  if (!res.ok) {
    throw new Error("Failed to add recipe");
  }
  return res.json();
}

export async function generateRecipe(newRecipe) {
  const res = await fetch(`${API_URL}/recipes/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newRecipe),
  });
  if (!res.ok) {
    throw new Error("Failed to add recipe");
  }
  return res.json();
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