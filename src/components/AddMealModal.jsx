import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Edit2, Sparkles, Search, Scale } from 'lucide-react';
import { MEAL_CATEGORIES, FOOD_PRESETS } from '../services/storage';
import { searchFoodDatabase } from '../services/foodApi';

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
  const [selectedBase, setSelectedBase] = useState(null); // { calories, protein, carbs, fat } per 100g
  const [showPresets, setShowPresets] = useState(false);

  const dropdownRef = useRef(null);

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

    // Apply scaling based on current grams (default 100g)
    const currentGrams = grams > 0 ? grams : 100;
    setQuantityText(`${currentGrams}g`);
    calculateMacrosForGrams(item, currentGrams);
  };

  // Calculate Macros dynamically based on Grams
  const calculateMacrosForGrams = (base, gVal) => {
    if (!base || gVal <= 0) return;
    const factor = gVal / 100;
    setCalories(Math.round(base.calories * factor).toString());
    setProtein(Math.round(base.protein * factor).toString());
    setCarbs(Math.round(base.carbs * factor).toString());
    setFat(Math.round(base.fat * factor).toString());
  };

  // Grams Change Handler
  const handleGramsChange = (newGramsVal) => {
    const numGrams = parseInt(newGramsVal, 10) || 0;
    setGrams(numGrams);
    setQuantityText(numGrams > 0 ? `${numGrams}g` : '1 μερίδα');

    if (selectedBase && numGrams > 0) {
      calculateMacrosForGrams(selectedBase, numGrams);
    }
  };

  const handleSelectPreset = (preset) => {
    setName(preset.name);
    const pGrams = parseInt((preset.quantity || '').replace(/\D/g, ''), 10) || 100;
    setGrams(pGrams);
    setQuantityText(preset.quantity);
    setCalories(preset.calories.toString());
    setProtein((preset.protein || 0).toString());
    setCarbs((preset.carbs || 0).toString());
    setFat((preset.fat || 0).toString());
    setCategory(preset.category);
    setSelectedBase(null);
    setShowPresets(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    onSave({
      id: editingMeal ? editingMeal.id : undefined,
      date: selectedDate,
      name,
      quantity: quantityText || `${grams}g`,
      calories: parseInt(calories, 10) || 0,
      protein: parseInt(protein, 10) || 0,
      carbs: parseInt(carbs, 10) || 0,
      fat: parseInt(fat, 10) || 0,
      category
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-visible relative">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              {editingMeal ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {editingMeal ? 'Επεξεργασία Γεύματος' : 'Προσθήκη Νέου Γεύματος'}
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

        {/* Quick Presets Toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl text-xs font-medium text-emerald-400 border border-emerald-500/20 transition"
          >
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{showPresets ? 'Απόκρυψη Έτοιμων Επιλογών' : 'Γρήγορες Επιλογές / Presets'}</span>
            </span>
            <span className="text-slate-400 text-[10px]">({FOOD_PRESETS.length} έτοιμα)</span>
          </button>

          {showPresets && (
            <div className="mt-2 max-h-40 overflow-y-auto p-2 bg-slate-950/90 border border-slate-800 rounded-xl grid grid-cols-1 gap-1.5">
              {FOOD_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition text-xs group"
                >
                  <div>
                    <div className="font-medium text-slate-200 group-hover:text-emerald-400">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {preset.quantity} • P:{preset.protein}g C:{preset.carbs}g F:{preset.fat}g
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                    {preset.calories} kcal
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <span>Όνομα Τροφίμου (Αναζήτηση στην Τράπεζα Τροφίμων) *</span>
              <span className="text-[10px] text-emerald-400 font-normal">Προαιρετική επιλογή από τη λίστα</span>
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
              <p className="text-[10px] text-slate-400 mt-1">Υπολογίζει αυτόματα τις θερμίδες!</p>
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

          {/* Calories & Macronutrients Grid (Can be manually overridden) */}
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
              {editingMeal ? 'Ενημέρωση' : 'Προσθήκη'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
