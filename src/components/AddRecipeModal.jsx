import React, { useState } from 'react';
import { addRecipe } from '../api';
const AddRecipeModal = ({ isOpen, onClose, onAddRecipe }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    prepTime: '',
    difficulty: '',
    image: '',
    ingredients: [''],
    instructions: [''],
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = ['ארוחת בוקר', 'ארוחת צהריים', 'ארוחת ערב', 'קינוח', 'נשנוש', 'מתאבן', 'מרק', 'סלט', 'פסטה', 'בשר', 'דגים'];
  const availableTags = ['כשר', 'טבעוני', 'ללא גלוטן', 'צמחוני', 'ללא חלב', 'דל פחמימות', 'קטו', 'פליאו', 'ים תיכוני', 'אסייתי', 'מקסיקני', 'איטלקי'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        instructions: newInstructions
      }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'שם המתכון נדרש';
    if (!formData.category) newErrors.category = 'קטגוריה נדרשת';
    if (!formData.prepTime) newErrors.prepTime = 'זמן הכנה נדרש';
    if (formData.tags.length === 0) newErrors.tags = 'נדרש לפחות תג אחד';

    // Numeric validation
    if (formData.prepTime && (isNaN(formData.prepTime) || formData.prepTime <= 0)) {
      newErrors.prepTime = 'זמן הכנה חייב להיות מספר חיובי';
    }
    if (formData.servings && (isNaN(formData.servings) || formData.servings <= 0)) {
      newErrors.servings = 'מספר מנות חייב להיות מספר חיובי';
    }

    // Ingredients validation
    const validIngredients = formData.ingredients.filter(ing => ing.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'נדרש לפחות מרכיב אחד';
    }

    // Instructions validation
    const validInstructions = formData.instructions.filter(inst => inst.trim());
    if (validInstructions.length === 0) {
      newErrors.instructions = 'נדרש לפחות הוראה אחת';
    }

    // Image URL validation (optional but if provided, should be valid)
    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'אנא הזן כתובת תמונה תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Tu peux réutiliser ton objet actuel, l'API fera le mapping:
      const newRecipe = {
        name: formData.name.trim(),
        category: formData.category,
        prepTime: `${parseInt(formData.prepTime, 10)} דק`,
        prepTimeMinutes: parseInt(formData.prepTime, 10),
        difficulty: formData.difficulty || 'בינוני',
        image: formData.image || '',
        ingredients: formData.ingredients,        // strings OK, l'API parse en {name,qty,unit}
        instructions: formData.instructions,
        tags: formData.tags
      };

      const saved = await addRecipe(newRecipe);  // 🔗 ENVOI AU BACKEND (sauvegarde DB)
      onAddRecipe?.(saved);                      // optionnel : MAJ de l’état côté front avec la réponse

      // reset + close
      setFormData({ name: '', category: '', prepTime: '', difficulty: '', image: '', ingredients: [''], instructions: [''], tags: [] });
      setErrors({});
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || 'שגיאה בהוספת המתכון' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">הוסף מתכון חדש</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50 p-1"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Recipe Name */}
            <div className="sm:col-span-2">
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                שם המתכון *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="הזן שם מתכון"
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                disabled={loading}
              />
              {errors.name && <p className="text-red-600 text-xs sm:text-sm mt-1 sm:mt-2">{errors.name}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                קטגוריה *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg ${errors.category ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                disabled={loading}
              >
                <option value="">בחר קטגוריה</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-600 text-xs sm:text-sm mt-1 sm:mt-2">{errors.category}</p>}
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                זמן הכנה (דקות) *
              </label>
              <input
                type="number"
                value={formData.prepTime}
                onChange={(e) => handleInputChange('prepTime', e.target.value)}
                placeholder="30"
                min="1"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-lg ${errors.prepTime ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                disabled={loading}
              />
              {errors.prepTime && <p className="text-red-600 text-sm mt-2">{errors.prepTime}</p>}
            </div>


            {/* Difficulty */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                רמת קושי
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
                disabled={loading}
              >
                <option value="">בחר רמת קושי (אופציונלי)</option>
                <option value="קל">קל</option>
                <option value="בינוני">בינוני</option>
                <option value="קשה">קשה</option>
              </select>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-3">
                כתובת תמונה (אופציונלי)
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 text-lg ${errors.image ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
                  }`}
                disabled={loading}
              />
              {errors.image && <p className="text-red-600 text-sm mt-2">{errors.image}</p>}
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              מרכיבים *
            </label>
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`מרכיב ${index + 1}`}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg"
                    disabled={loading}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      disabled={loading}
                      className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
            >
              + הוסף מרכיב
            </button>
            {errors.ingredients && <p className="text-red-600 text-sm mt-2">{errors.ingredients}</p>}
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              הוראות הכנה *
            </label>
            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`שלב ${index + 1}`}
                    rows={2}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg resize-none"
                    disabled={loading}
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      disabled={loading}
                      className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addInstruction}
              disabled={loading}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
            >
              + הוסף שלב
            </button>
            {errors.instructions && <p className="text-red-600 text-sm mt-2">{errors.instructions}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              תגיות *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableTags.map((tag) => (
                <label key={tag} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag)}
                    onChange={() => {
                      handleTagToggle(tag);
                      // Clear error when user selects a tag
                      if (errors.tags) {
                        setErrors(prev => ({
                          ...prev,
                          tags: ''
                        }));
                      }
                    }}
                    className="sr-only"
                    disabled={loading}
                  />
                  <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all duration-200 ${formData.tags.includes(tag)
                      ? 'bg-orange-500 border-orange-500'
                      : errors.tags
                        ? 'border-red-500 group-hover:border-red-400'
                        : 'border-gray-300 group-hover:border-orange-300'
                    }`}>
                    {formData.tags.includes(tag) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-gray-700 transition-colors duration-200 text-sm ${formData.tags.includes(tag) ? 'text-orange-600 font-medium' : ''
                    }`}>
                    {tag}
                  </span>
                </label>
              ))}
            </div>
            {errors.tags && <p className="text-red-600 text-sm mt-2">{errors.tags}</p>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-red-600 text-center bg-red-50 p-4 rounded-lg border border-red-200">
              {errors.submit}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מוסיף מתכון...
                </>
              ) : (
                'הוסף מתכון'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeModal;
