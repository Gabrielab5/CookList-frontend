// Utility functions for handling dynamic categories from backend

/**
 * Extract unique categories from recipes array
 * @param {Array} recipes - Array of recipe objects from backend
 * @returns {Array} - Sorted array of unique categories
 */
export const extractCategoriesFromRecipes = (recipes) => {
  if (!Array.isArray(recipes)) {
    return [];
  }

  const categories = recipes
    .map(recipe => recipe.category)
    .filter(category => category && category.trim()) // Remove null, undefined, empty strings
    .map(category => category.trim()) // Clean whitespace
    .filter((category, index, array) => array.indexOf(category) === index) // Remove duplicates
    .sort((a, b) => a.localeCompare(b, 'he-IL')); // Sort alphabetically in Hebrew

  return categories;
};

/**
 * Extract unique tags from recipes array
 * @param {Array} recipes - Array of recipe objects from backend
 * @returns {Array} - Sorted array of unique tags
 */
export const extractTagsFromRecipes = (recipes) => {
  if (!Array.isArray(recipes)) {
    return [];
  }

  const tags = recipes
    .flatMap(recipe => recipe.tags || []) // Flatten all tags arrays
    .filter(tag => tag && tag.trim()) // Remove null, undefined, empty strings
    .map(tag => tag.trim()) // Clean whitespace
    .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
    .sort((a, b) => a.localeCompare(b, 'he-IL')); // Sort alphabetically in Hebrew

  return tags;
};

/**
 * Get default categories fallback if no recipes are available
 * @returns {Array} - Array of default categories
 */
export const getDefaultCategories = () => {
  return [
    'ארוחת בוקר',
    'ארוחת צהריים', 
    'ארוחת ערב',
    'קינוח',
    'נשנוש',
    'מתאבן',
    'מרק',
    'סלט',
    'פסטה',
    'בשר',
    'דגים',
    'צמחוני'
  ].sort((a, b) => a.localeCompare(b, 'he-IL'));
};

/**
 * Get default tags fallback if no recipes are available
 * @returns {Array} - Array of default tags
 */
export const getDefaultTags = () => {
  return [
    'כשר',
    'טבעוני',
    'ללא גלוטן',
    'צמחוני',
    'ללא חלב',
    'דל פחמימות',
    'קטו',
    'פליאו',
    'ים תיכוני',
    'אסייתי',
    'מקסיקני',
    'איטלקי'
  ].sort((a, b) => a.localeCompare(b, 'he-IL'));
};
