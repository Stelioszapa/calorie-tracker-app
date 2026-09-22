const STORAGE_KEY_MEALS = 'nutrical_meals_v1';
const STORAGE_KEY_PROFILES = 'nutrical_profiles_v1';
const STORAGE_KEY_ACTIVE_PROFILE = 'nutrical_active_profile_v1';
const STORAGE_KEY_FAVORITES = 'nutrical_user_favorites_v1';

export const DEFAULT_PROFILES = [
  {
    id: 'profile_me',
    name: 'Στέλιος (21 ετών | 172 cm | 75 kg → 68 kg)',
    shortName: 'Στέλιος',
    target: 2000,
    targetProtein: 160,
    targetCarbs: 200,
    targetFat: 60,
    color: 'emerald',
    icon: 'User'
  },
  {
    id: 'profile_her',
    name: 'Δήμητρα (21 ετών | 161 cm | 55 kg → 50 kg)',
    shortName: 'Δήμητρα',
    target: 1400,
    targetProtein: 100,
    targetCarbs: 140,
    targetFat: 42,
    color: 'pink',
    icon: 'Heart'
  }
];

export const MEAL_CATEGORIES = [
  { id: 'breakfast', name: 'Πρωινό', icon: 'SunMedium', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { id: 'lunch', name: 'Μεσημεριανό', icon: 'Utensils', color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  { id: 'dinner', name: 'Βραδινό', icon: 'Moon', color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400' },
  { id: 'snack', name: 'Σνακ', icon: 'Apple', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-500/10', textColor: 'text-pink-400' }
];

// Smart Category Staples
export const CATEGORY_SMART_CHIPS = {
  breakfast: [
    { name: 'Ομελέτα 3 Αυγά & Φέτα', calories: 380, protein: 24, carbs: 4, fat: 30, quantity: '1 πιάτο' },
    { name: 'Γιαούρτι 2% με Βρώμη & Μέλι', calories: 280, protein: 16, carbs: 42, fat: 5, quantity: '1 μπολ' },
    { name: 'Τοστ Γαλοπούλα & Τυρί', calories: 280, protein: 16, carbs: 32, fat: 10, quantity: '1 τεμάχιο' },
    { name: 'Φρέντο Μέτριο', calories: 60, protein: 1, carbs: 14, fat: 0, quantity: '1 ποτήρι' }
  ],
  lunch: [
    { name: 'Στήθος Κοτόπουλο με Ρύζι', calories: 480, protein: 46, carbs: 50, fat: 8, quantity: '200g κοτόπουλο / 150g ρύζι' },
    { name: 'Μπιφτέκια Μοσχαρίσια με Πατάτες', calories: 620, protein: 38, carbs: 45, fat: 30, quantity: '2 μπιφτέκια & πατάτες' },
    { name: 'Χωριάτικη Σαλάτα & Ψωμί', calories: 420, protein: 12, carbs: 28, fat: 28, quantity: '1 μερίδα' },
    { name: 'Σολωμός Ψητός με Λαχανικά', calories: 450, protein: 38, carbs: 10, fat: 28, quantity: '200g σολωμός' }
  ],
  dinner: [
    { name: 'Σουβλάκι Κοτόπουλο Πίτα Απ\' όλα', calories: 550, protein: 32, carbs: 48, fat: 22, quantity: '1 τεμάχιο' },
    { name: 'Σαλάτα Σεφ με Τόνο & Αυγό', calories: 360, protein: 34, carbs: 12, fat: 18, quantity: '1 σαλάτα' },
    { name: 'Ομελέτα Λαχανικών & Σαλάτα', calories: 310, protein: 20, carbs: 14, fat: 20, quantity: '1 πιάτο' }
  ],
  snack: [
    { name: 'Πρωτεϊνικό Shake Whey', calories: 220, protein: 30, carbs: 14, fat: 4, quantity: '1 scoop' },
    { name: 'Μήλο & 10 Αμύγδαλα', calories: 160, protein: 4, carbs: 22, fat: 7, quantity: '1 μερίδα' },
    { name: 'Γιαούρτι 2% με Μέλι & Καρύδια', calories: 240, protein: 14, carbs: 26, fat: 8, quantity: '1 μπολ' }
  ]
};

// --- User Favorites Functions ---
export function getFavorites() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const all = data ? JSON.parse(data) : [];
    const activeId = getActiveProfileId();
    return all.filter(f => !f.profileId || f.profileId === activeId);
  } catch (e) {
    return [];
  }
}

export function saveFavorites(favs) {
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favs));
}

export function addFavorite(meal) {
  const activeId = getActiveProfileId();
  try {
    const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const all = data ? JSON.parse(data) : [];

    const cleanName = (meal.name || '').trim().toLowerCase();
    const existingIndex = all.findIndex(f =>
      (!f.profileId || f.profileId === activeId) &&
      (f.name || '').trim().toLowerCase() === cleanName
    );

    if (existingIndex !== -1) {
      // Overwrite/Update existing favorite with corrected macro values
      all[existingIndex] = {
        ...all[existingIndex],
        quantity: meal.quantity || '1 μερίδα',
        calories: Math.max(0, parseInt(meal.calories, 10) || 0),
        protein: Math.max(0, parseInt(meal.protein, 10) || 0),
        carbs: Math.max(0, parseInt(meal.carbs, 10) || 0),
        fat: Math.max(0, parseInt(meal.fat, 10) || 0),
        category: meal.category || 'lunch'
      };
    } else {
      const newFav = {
        id: 'fav_' + Date.now(),
        profileId: activeId,
        name: meal.name.trim(),
        quantity: meal.quantity || '1 μερίδα',
        calories: Math.max(0, parseInt(meal.calories, 10) || 0),
        protein: Math.max(0, parseInt(meal.protein, 10) || 0),
        carbs: Math.max(0, parseInt(meal.carbs, 10) || 0),
        fat: Math.max(0, parseInt(meal.fat, 10) || 0),
        category: meal.category || 'lunch'
      };
      all.push(newFav);
    }

    saveFavorites(all);
    return getFavorites();
  } catch (e) {
    return [];
  }
}

export function autoUpdateMatchingFavorite(meal) {
  const activeId = getActiveProfileId();
  try {
    const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const all = data ? JSON.parse(data) : [];
    const cleanName = (meal.name || '').trim().toLowerCase();
    const existingIndex = all.findIndex(f =>
      (!f.profileId || f.profileId === activeId) &&
      (f.name || '').trim().toLowerCase() === cleanName
    );

    if (existingIndex !== -1) {
      all[existingIndex] = {
        ...all[existingIndex],
        quantity: meal.quantity || all[existingIndex].quantity,
        calories: Math.max(0, parseInt(meal.calories, 10) || 0),
        protein: Math.max(0, parseInt(meal.protein, 10) || 0),
        carbs: Math.max(0, parseInt(meal.carbs, 10) || 0),
        fat: Math.max(0, parseInt(meal.fat, 10) || 0),
        category: meal.category || all[existingIndex].category
      };
      saveFavorites(all);
    }
  } catch (e) {}
}

export function deleteFavorite(id) {
  try {
    const data = localStorage.getItem(STORAGE_KEY_FAVORITES);
    const all = data ? JSON.parse(data) : [];
    const filtered = all.filter(f => f.id !== id);
    saveFavorites(filtered);
    return getFavorites();
  } catch (e) {
    return [];
  }
}

// --- Profile Functions ---
export function getProfiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Update profile names to Stelios & Dimitra if using generic names
        const updated = parsed.map(p => {
          if (p.id === 'profile_me' && (p.name.includes('Άντρας') || p.shortName === 'Άντρας')) {
            return { ...p, name: 'Στέλιος (21 ετών | 172 cm | 75 kg → 68 kg)', shortName: 'Στέλιος', target: 2000, targetProtein: 160, targetCarbs: 200, targetFat: 60 };
          }
          if (p.id === 'profile_her' && (p.name.includes('Κοπέλα') || p.shortName === 'Κοπέλα')) {
            return { ...p, name: 'Δήμητρα (21 ετών | 161 cm | 55 kg → 50 kg)', shortName: 'Δήμητρα', target: 1400, targetProtein: 100, targetCarbs: 140, targetFat: 42 };
          }
          return p;
        });
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(updated));
        return updated;
      }
    }
  } catch (e) {
    console.error('Failed to parse profiles', e);
  }
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(DEFAULT_PROFILES));
  return DEFAULT_PROFILES;
}

export function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
}

export function getActiveProfileId() {
  const active = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE);
  if (active) return active;
  const profiles = getProfiles();
  const defaultId = profiles[0] ? profiles[0].id : 'profile_me';
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, defaultId);
  return defaultId;
}

export function setActiveProfileId(id) {
  localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE, id);
  return id;
}

export function getActiveProfile() {
  const profiles = getProfiles();
  const activeId = getActiveProfileId();
  return profiles.find(p => p.id === activeId) || profiles[0] || DEFAULT_PROFILES[0];
}

export function updateProfile(id, updatedFields) {
  const profiles = getProfiles();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx !== -1) {
    profiles[idx] = { ...profiles[idx], ...updatedFields };
    saveProfiles(profiles);
    return profiles[idx];
  }
  return null;
}

export function getDailyTarget() {
  const activeProfile = getActiveProfile();
  return activeProfile ? activeProfile.target : 2000;
}

export function getMacroTargets() {
  const activeProfile = getActiveProfile();
  return {
    protein: activeProfile ? (activeProfile.targetProtein || 150) : 150,
    carbs: activeProfile ? (activeProfile.targetCarbs || 200) : 200,
    fat: activeProfile ? (activeProfile.targetFat || 60) : 60
  };
}

export function setDailyTarget(target) {
  const activeProfile = getActiveProfile();
  const val = Math.max(500, Math.min(10000, parseInt(target, 10) || 2000));
  if (activeProfile) {
    updateProfile(activeProfile.id, { target: val });
  }
  return val;
}

// --- Meals Functions (Isolated by Profile) ---
export function getAllMeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEALS);
    const all = data ? JSON.parse(data) : [];
    const activeId = getActiveProfileId();
    return all.filter(m => !m.profileId || m.profileId === activeId);
  } catch (e) {
    console.error('Failed to parse stored meals', e);
    return [];
  }
}

export function getRawAllMeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEALS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveRawMeals(meals) {
  localStorage.setItem(STORAGE_KEY_MEALS, JSON.stringify(meals));
}

export function getMealsByDate(dateStr) {
  const all = getAllMeals();
  return all.filter(m => m.date === dateStr);
}

export function getMealsByMonth(year, month) {
  const all = getAllMeals();
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  return all.filter(m => m.date && m.date.startsWith(prefix));
}

export function addMeal(meal) {
  const rawMeals = getRawAllMeals();
  const activeId = getActiveProfileId();
  const newMeal = {
    id: 'meal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    profileId: activeId,
    date: meal.date, // Format YYYY-MM-DD
    name: meal.name.trim(),
    quantity: meal.quantity || '1 μερίδα',
    calories: Math.max(0, parseInt(meal.calories, 10) || 0),
    protein: Math.max(0, parseInt(meal.protein, 10) || 0),
    carbs: Math.max(0, parseInt(meal.carbs, 10) || 0),
    fat: Math.max(0, parseInt(meal.fat, 10) || 0),
    category: meal.category || 'lunch',
    createdAt: new Date().toISOString()
  };
  rawMeals.push(newMeal);
  saveRawMeals(rawMeals);
  autoUpdateMatchingFavorite(newMeal);
  return newMeal;
}

export function updateMeal(id, updatedData) {
  const rawMeals = getRawAllMeals();
  const index = rawMeals.findIndex(m => m.id === id);
  if (index !== -1) {
    rawMeals[index] = {
      ...rawMeals[index],
      name: updatedData.name.trim(),
      quantity: updatedData.quantity || '1 μερίδα',
      calories: Math.max(0, parseInt(updatedData.calories, 10) || 0),
      protein: Math.max(0, parseInt(updatedData.protein, 10) || 0),
      carbs: Math.max(0, parseInt(updatedData.carbs, 10) || 0),
      fat: Math.max(0, parseInt(updatedData.fat, 10) || 0),
      category: updatedData.category,
      date: updatedData.date
    };
    saveRawMeals(rawMeals);
    autoUpdateMatchingFavorite(rawMeals[index]);
    return rawMeals[index];
  }
  return null;
}

export function deleteMeal(id) {
  const rawMeals = getRawAllMeals();
  const filtered = rawMeals.filter(m => m.id !== id);
  saveRawMeals(filtered);
  return getAllMeals();
}

export function clearAllMeals() {
  const activeId = getActiveProfileId();
  const rawMeals = getRawAllMeals();
  const filtered = rawMeals.filter(m => m.profileId && m.profileId !== activeId);
  saveRawMeals(filtered);
  return [];
}

export function exportDataJSON() {
  const data = {
    profiles: getProfiles(),
    activeProfileId: getActiveProfileId(),
    meals: getRawAllMeals(),
    exportedAt: new Date().toISOString(),
    app: 'NutriCal PWA Multi-Profile'
  };
  return JSON.stringify(data, null, 2);
}

export function importDataJSON(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !Array.isArray(parsed.meals)) {
      throw new Error('Μη έγκυρη δομή αρχείου backup JSON.');
    }
    if (parsed.profiles) {
      saveProfiles(parsed.profiles);
    }
    if (parsed.activeProfileId) {
      setActiveProfileId(parsed.activeProfileId);
    }
    saveRawMeals(parsed.meals);
    return { success: true, count: parsed.meals.length };
  } catch (err) {
    return { success: false, error: err.message || 'Αποτυχία ανάγνωσης αρχείου.' };
  }
}
