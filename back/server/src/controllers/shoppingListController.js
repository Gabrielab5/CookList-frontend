import mongoose from 'mongoose';
import ShoppingList from '../models/shoppingListSchema.js';
import Recipe from '../models/recipeSchema.js';
import Ingredient, { DEPTS } from '../models/ingredientSchema.js';

const { isValidObjectId } = mongoose;

function groupItemsByDeptHybrid(items /* peut être peuplé ou non */) {
  const byDept = Object.fromEntries(DEPTS.map(d => [d, []]));
  for (const it of items) {
    // si populate a marché, on a un doc dans it.ingredientId
    const ingDoc = it.ingredientId && typeof it.ingredientId === 'object' && it.ingredientId._id
      ? it.ingredientId
      : null;

    let dept = ingDoc?.dept || it.dept || 'מצרכים יבשים';
    
    // Ensure dept is valid - if not found in DEPTS, use 'אחר'
    if (!DEPTS.includes(dept)) {
      dept = 'אחר';
    }
    
    // Ensure the dept exists in byDept object
    if (!byDept[dept]) {
      byDept[dept] = [];
    }
    
    const name = ingDoc?.canonicalName || it.ingredientName || '—';
    byDept[dept].push({
      itemId: it._id,
      ingredientId: ingDoc?._id ?? it.ingredientId ?? null,
      canonicalName: name,
      dept,
      qty: it.qty,
      unit: it.unit
    });
  }
  for (const d of Object.keys(byDept)) {
    byDept[d].sort((a, b) => (a.canonicalName || '').localeCompare(b.canonicalName || '', 'he'));
  }
  return byDept;
}

export const buildList = async (req, res) => {
  try {
    const { title = 'רשימת קניות', recipeIds = [] } = req.body;

    if (!Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'recipeIds required' });
    }
    for (const id of recipeIds) {
      if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: `Invalid recipe id: ${id}` });
      }
    }

    // 1) Récupérer les recettes (ingredients: { name, qty, unit } OU ingredientName)
    const recipes = await Recipe.find({ _id: { $in: recipeIds } })
      .select('ingredients')
      .lean();
    if (!recipes.length) {
      return res.status(404).json({ success: false, message: 'No recipes found' });
    }


    // 2) Collecte des noms à résoudre -> Ingredient docs
    const namesSet = new Set();
    for (const r of recipes) {
      for (const ri of (r.ingredients || [])) {
        const n = (ri.ingredientName || ri.name || '').trim();
        if (n) namesSet.add(n);
      }
    }
    const names = [...namesSet];

    const byCanonical = await Ingredient.find({ canonicalName: { $in: names } })
      .select('_id canonicalName name dept')
      .lean();
    const byName = await Ingredient.find({ name: { $in: names } })
      .select('_id canonicalName name dept')
      .lean();

    const mapByCanonical = new Map(byCanonical.map(d => [d.canonicalName, d]));
    const mapByName = new Map(byName.map(d => [d.name, d]));

    // 3) Agrégat par (ingredientId|unit) en gardant aussi ingredientName + dept
    const agg = new Map();
    const missing = [];
    const missingItems = new Map(); // For missing ingredients

    for (const r of recipes) {
      for (const ri of (r.ingredients || [])) {
        const rawName = (ri.ingredientName || ri.name || '').trim();
        if (!rawName) continue;

        const doc = mapByCanonical.get(rawName) || mapByName.get(rawName);
        const unit = String(ri.unit || '').trim();
        const qtyNum = Number(ri.qty);
        
        if (!doc) { 
          // Add to missing ingredients list
          missing.push(rawName);
          
          // Also add to shopping list as a missing item if it has valid qty/unit
          if (unit && Number.isFinite(qtyNum)) {
            const missingKey = `missing_${rawName}|${unit}`;
            const prevMissing = missingItems.get(missingKey);
            missingItems.set(missingKey, {
              ingredientId: null,                    // null for missing ingredients
              ingredientName: rawName,               // raw name from recipe
              dept: 'אחר',                          // default department
              qty: (prevMissing?.qty || 0) + qtyNum,
              unit,
              isMissing: true                        // flag to identify missing items
            });
          }
          continue; 
        }

        if (!unit || !Number.isFinite(qtyNum)) continue;

        const key = `${String(doc._id)}|${unit}`;
        const prev = agg.get(key);
        agg.set(key, {
          ingredientId: doc._id,                 // pour schéma avec ref
          ingredientName: doc.canonicalName,     // pour schéma qui l'exige
          dept: doc.dept,                        // fallback si pas de populate
          qty: (prev?.qty || 0) + qtyNum,
          unit
        });
      }
    }

    // Combine found and missing items
    const foundItems = Array.from(agg.values());
    const missingItemsArray = Array.from(missingItems.values());
    const items = [...foundItems, ...missingItemsArray];
    

    // Only return error if no items at all (including missing ones)
    if (!items.length) {
      return res.status(400).json({
        success: false,
        message: 'No valid ingredients found in recipes',
        missingIngredients: [...new Set(missing)]
      });
    }

    // 4) Création de la liste — on donne TOUTES les clés (id + name + dept)
    const list = await ShoppingList.create({
      title,
      status: 'open',
      items,                         // contient ingredientId, ingredientName, dept, qty, unit
      source: { recipeIds }
    });

    // 5) Relecture + populate si le schéma contient bien items.ingredientId
    const populated = await ShoppingList.findById(list._id)
      .populate('items.ingredientId', 'canonicalName dept')
      .lean();

    const byDept = groupItemsByDeptHybrid(populated?.items || items);

    // Prepare response with useful information
    const uniqueMissing = [...new Set(missing)];
    const foundCount = foundItems.length;
    const missingCount = missingItemsArray.length;
    
    return res.status(201).json({
      success: true,
      data: {
        listId: (populated?._id ?? list._id),
        title: (populated?.title ?? list.title),
        status: (populated?.status ?? list.status),
        summary: {
          recipeCount: recipes.length,
          uniqueLines: items.length,
          totalItems: (populated?.items?.length ?? items.length),
          foundIngredients: foundCount,
          missingIngredients: missingCount
        },
        byDept,
        missingIngredients: uniqueMissing
      },
      message: uniqueMissing.length > 0 
        ? `רשימת קניות נוצרה בהצלחה. ${missingCount} מרכיבים לא נמצאו במאגר ונוספו כ"אחר": ${uniqueMissing.join(', ')}`
        : 'רשימת קניות נוצרה בהצלחה'
    });
  } catch (err) {
    console.error('buildList error:', err);
    return res.status(500).json({ success: false, message: 'Server Error', error: String(err?.message || err) });
  }
}; //works

export const getListById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid list id' });
    }

    const doc = await ShoppingList.findById(id)
      .populate('items.ingredientId', 'canonicalName dept')
      .lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }

    const byDept = groupItemsByDeptHybrid(doc.items || []);

    const flatItems = (doc.items || []).map(it => {
      const ingDoc =
        it.ingredientId && typeof it.ingredientId === 'object' && it.ingredientId._id
          ? it.ingredientId
          : null;
      return {
        itemId: it._id,
        ingredientId: ingDoc?._id ?? (typeof it.ingredientId === 'string' ? it.ingredientId : null),
        canonicalName: ingDoc?.canonicalName || it.ingredientName || '—',
        dept: ingDoc?.dept || it.dept || 'מצרכים יבשים',
        qty: it.qty,
        unit: it.unit,
        checked: Boolean(it.checked)
      };
    }).sort((a, b) => (a.canonicalName || '').localeCompare(b.canonicalName || '', 'he'));

    return res.status(200).json({
      success: true,
      data: {
        listId: doc._id,
        title: doc.title,
        status: doc.status,
        summary: {
          uniqueLines: flatItems.length,
          totalItems: flatItems.length
        },
        byDept,
        flatItems,
        source: doc.source ?? null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }
    });
  } catch (err) {
    console.error('getListById error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}; //works
