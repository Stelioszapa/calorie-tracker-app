import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, Search, Scale, Star, Trash2, Check } from 'lucide-react';
import { MEAL_CATEGORIES, getFavorites, addFavorite, deleteFavorite, autoUpdateMatchingFavorite } from '../services/storage';
import { searchFoodDatabase, saveFoodOverride } from '../services/foodApi';

export default function AddMealModal({
  isOpen,
  onClose,
  onSave,
  editingMeal,
  selectedDate
}) {
  const [name, setName] = useState('');
  const [grams, setGrams] = useState(100);
  const [quantityText, setQuantityText] = useState('100g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [category, setCategory] = useState('lunch');

  // Search & Base Macro State
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);

  // Favorites State
  const [userFavorites, setUserFavorites] = useState([]);
  const [isSavedToFavs, setIsSavedToFavs] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setUserFavorites(getFavorites());
      setIsSavedToFavs(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (editingMeal) {
      setName(editingMeal.name || '');
      const parsedGrams = parseInt((editingMeal.quantity || '').replace(/\D/g, ''), 10) || 100;
      setGrams(parsedGrams);
      setQuantityText(editingMeal.quantity || `${parsedGrams}g`);
      setCalories(editingMeal.calories ? editingMeal.calories.toString() : '');
      setProtein(editingMeal.protein !== undefined ? editingMeal.protein.toString() : '0');
      setCarbs(editingMeal.carbs !== undefined ? editingMeal.carbs.toString() : '0');
      setFat(editingMeal.fat !== undefined ? editingMeal.fat.toString() : '0');
      setCategory(editingMeal.category || 'lunch');
      setSelectedBase(null);
    } else {
      setName('');
      setGrams(100);
      setQuantityText('100g');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setCategory('lunch');
      setSelectedBase(null);
    }
  }, [editingMeal, isOpen]);

  // Handle outside click to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Live Food Search Handler
  const handleNameChange = (val) => {
    setName(val);
    if (val.trim().length >= 2) {
      const results = searchFoodDatabase(val);
      setSearchResults(results);
      setShowDropdown(results.length > 0);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Select item from Search Autocomplete
  const handleSelectFoodItem = (item) => {
    setName(item.name);
    setSelectedBase(item);
    setShowDropdown(false);

    const currentGrams = grams > 0 ? grams : 100;
    setQuantityText(`${currentGrams}g`);
    calculateMacrosForGrams(item, currentGrams);
  };

  const calculateMacrosForGrams = (base, gVal) => {
    if (!base || gVal <= 0) return;
    const factor = gVal / 100;
    setCalories(Math.round(base.calories * factor).toString());
    setProtein(Math.round(base.protein * factor).toString());
    setCarbs(Math.round(base.carbs * factor).toString());
    setFat(Math.round(base.fat * factor).toString());
  };

  const handleGramsChange = (newGramsVal) => {
    const numGrams = parseInt(newGramsVal, 10) || 0;
    setGrams(numGrams);
    setQuantityText(numGrams > 0 ? `${numGrams}g` : '1 μερίδα');

    if (selectedBase && numGrams > 0) {
      calculateMacrosForGrams(selectedBase, numGrams);
    }
  };

  const handleSelectChipOrFavorite = (item) => {
    setName(item.name);
    const pGrams = parseInt((item.quantity || '').replace(/\D/g, ''), 10) || 100;
    setGrams(pGrams);
    setQuantityText(item.quantity || `${pGrams}g`);
    setCalories(item.calories.toString());
    setProtein((item.protein || 0).toString());
    setCarbs((item.carbs || 0).toString());
    setFat((item.fat || 0).toString());
    if (item.category) setCategory(item.category);
    setSelectedBase(null);
  };

  const handleSaveToFavorites = () => {
    if (!name.trim() || !calories) return;
    const updatedFavs = addFavorite({
      name: name.trim(),
      quantity: quantityText || `${grams}g`,
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fat: parseInt(fat, 10) || 0,
      category
    });
    setUserFavorites(updatedFavs);
    setIsSavedToFavs(true);
    setTimeout(() => setIsSavedToFavs(false), 2500);
  };

  const handleDeleteFavorite = (e, id) => {
    e.stopPropagation();
    const updated = deleteFavorite(id);
    setUserFavorites(updated);
  };

  const isEditMode = Boolean(editingMeal && editingMeal.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    const mealGrams = grams > 0 ? grams : 100;
    const factor = 100 / mealGrams;
    const pKcal = Math.round((parseInt(calories, 10) || 0) * factor);
    const pProtein = Math.round((parseInt(protein, 10) || 0) * factor);
    const pCarbs = Math.round((parseInt(carbs, 10) || 0) * factor);
    const pFat = Math.round((parseInt(fat, 10) || 0) * factor);

    saveFoodOverride(name.trim(), {
      calories: pKcal,
      protein: pProtein,
      carbs: pCarbs,
      fat: pFat
    });

    const mealData = {
      id: isEditMode ? editingMeal.id : undefined,
      date: editingMeal && editingMeal.date ? editingMeal.date : selectedDate,
      name: name.trim(),
      quantity: quantityText || `${grams}g`,
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fat: parseInt(fat, 10) || 0,
      category
    };

    autoUpdateMatchingFavorite(mealData);
    onSave(mealData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-visible relative">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              {isEditMode ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditMode ? 'Επεξεργασία Γεύματος' : 'Προσθήκη Νέου Γεύματος'}
              </h2>
              <p className="text-xs text-slate-400">
                Ημερομηνία: <span className="text-emerald-400 font-medium">{selectedDate}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personal Favorites Section */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Τα Αγαπημένα μου ({userFavorites.length})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">1-κλικ συμπλήρωση</span>
          </div>

          <div className="min-h-[50px] max-h-36 overflow-y-auto p-2 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
            {userFavorites.length === 0 ? (
              <div className="text-center py-2 text-[11px] text-slate-500 italic">
                Δεν έχετε αποθηκεύσει ακόμα αγαπημένα γεύματα. Συμπληρώστε ένα γεύμα και πατήστε "⭐ Αποθήκευση στα Αγαπημένα"!
              </div>
            ) : (
              userFavorites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => handleSelectChipOrFavorite(fav)}
                  className="p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg cursor-pointer transition flex items-center justify-between text-xs group border border-slate-800"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-amber-300 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-400 fill-current" />
                      <span>{fav.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {fav.quantity} • P:{fav.protein}g C:{fav.carbs}g F:{fav.fat}g
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2 py-0.5 rounded">
                      {fav.calories} kcal
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteFavorite(e, fav.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Διαγραφή από τα αγαπημένα"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Κατηγορία Γεύματος
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'bg-slate-800 border-emerald-500 text-emerald-400 shadow-lg'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="mb-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Food Name Search Input with Autocomplete Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Όνομα Τροφίμου (Αναζήτηση στην Τράπεζα) *</span>
              <span className="text-[10px] text-emerald-400 font-normal">Προαιρετική αναζήτηση</span>
            </label>

            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => name.trim().length >= 2 && setShowDropdown(true)}
                placeholder="Πληκτρολογήστε π.χ. Κοτόπουλο, Ρύζι, Αυγό, Μήλο..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Autocomplete Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-800 animate-fade-in">
                <div className="px-3 py-1.5 bg-slate-900 text-[10px] text-slate-400 font-semibold uppercase">
                  Αποτελέσματα Αναζήτησης (ανά 100g)
                </div>
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectFoodItem(item)}
                    className="p-2.5 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        P: <span className="text-rose-300 font-semibold">{item.protein}g</span> • C: <span className="text-amber-300 font-semibold">{item.carbs}g</span> • F: <span className="text-cyan-300 font-semibold">{item.fat}g</span>
                      </div>
                    </div>
                    <div className="text-emerald-400 text-xs font-black bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      {item.calories} kcal /100g
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weight / Grams Scaler & Quantity Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                <span>Βάρος σε Γραμμάρια (g)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={grams}
                  onChange={(e) => handleGramsChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-teal-500/40 rounded-xl text-sm font-extrabold text-teal-300 focus:outline-none focus:border-teal-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">g</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Περιγραφή Ποσότητας
              </label>
              <input
                type="text"
                value={quantityText}
                onChange={(e) => setQuantityText(e.target.value)}
                placeholder="π.χ. 150g"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700/70 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Calories & Macronutrients Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                Θερμίδες (kcal)*
              </label>
              <input
                type="number"
                required
                min="0"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-2 bg-slate-950/60 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-rose-400 mb-1">
                Πρωτεΐνη (g)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-2 bg-slate-950/60 border border-rose-500/40 rounded-xl text-xs font-bold text-rose-300 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                Υδατάνθρ. (g)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-2 bg-slate-950/60 border border-amber-500/40 rounded-xl text-xs font-bold text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-cyan-400 mb-1">
                Λιπαρά (g)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-2 bg-slate-950/60 border border-cyan-500/40 rounded-xl text-xs font-bold text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Quick Save to Personal Favorites Bar */}
          {name.trim() && calories && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSaveToFavorites}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition"
              >
                {isSavedToFavs ? <Check className="w-4 h-4 text-emerald-400" /> : <Star className="w-4 h-4 fill-current text-amber-400" />}
                <span>{isSavedToFavs ? 'Αποθηκεύτηκε στα Αγαπημένα!' : '⭐ Αποθήκευση στα Αγαπημένα μου'}</span>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-sm hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition"
            >
              {isEditMode ? 'Ενημέρωση' : 'Προσθήκη'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
