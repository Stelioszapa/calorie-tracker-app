import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit3, 
  Flame, 
  Target, 
  SunMedium, 
  Utensils, 
  Moon, 
  Apple,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon
} from 'lucide-react';
import { MEAL_CATEGORIES, getMacroTargets, getActiveProfile } from '../services/storage';

export default function DailyTrackerView({
  selectedDate,
  setSelectedDate,
  meals,
  dailyTarget,
  onOpenAddMeal,
  onEditMeal,
  onDeleteMeal
}) {
  const activeProfile = getActiveProfile();
  const macroTargets = getMacroTargets();

  // Calculate total consumed calories & macros for selectedDate
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);

  const remainingCalories = dailyTarget - totalCalories;
  const percentage = Math.min(100, Math.round((totalCalories / dailyTarget) * 100));
  const isOverTarget = totalCalories > dailyTarget;

  // Macro Pct
  const pPct = Math.min(100, Math.round((totalProtein / macroTargets.protein) * 100));
  const cPct = Math.min(100, Math.round((totalCarbs / macroTargets.carbs) * 100));
  const fPct = Math.min(100, Math.round((totalFat / macroTargets.fat) * 100));

  // Format display date in Greek
  const formatDateGreek = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('el-GR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Date Navigation Helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'breakfast': return <SunMedium className="w-4 h-4 text-amber-400" />;
      case 'lunch': return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'dinner': return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'snack': return <Apple className="w-4 h-4 text-pink-400" />;
      default: return <Utensils className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Date Selection Control Bar */}
      <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between shadow-lg">
        <button
          onClick={handlePrevDay}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
          title="Προηγούμενη Ημέρα"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-emerald-400 hidden xs:inline" />
          <div className="text-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              className="bg-transparent text-sm sm:text-base font-bold text-white text-center cursor-pointer focus:outline-none hover:text-emerald-400 transition"
            />
            <p className="text-[11px] text-slate-400 capitalize">
              {formatDateGreek(selectedDate)}
            </p>
          </div>
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
          title="Επόμενη Ημέρα"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Calorie & Macronutrients Progress Card */}
      <div className={`relative overflow-hidden p-6 rounded-3xl border shadow-2xl transition-all duration-300 ${
        isOverTarget 
          ? 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/30 shadow-rose-950/20' 
          : 'bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 border-emerald-500/20 shadow-emerald-950/20'
      }`}>
        
        {/* Background Subtle Pattern */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6">
          
          {/* Top Row: Active Profile Name & Calories */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Προφίλ:</span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {activeProfile ? activeProfile.name : 'Ενεργό'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                  isOverTarget 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isOverTarget ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  <span>{isOverTarget ? 'Υπέρβαση' : 'Εντός Στόχου'}</span>
                </span>
              </div>
              
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  {totalCalories.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ {dailyTarget.toLocaleString()} kcal</span>
              </div>
            </div>

            {/* Main Calorie Progress Bar */}
            <div className="flex-1 md:max-w-xs space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Θερμίδες ({percentage}%)</span>
                <span>
                  {remainingCalories >= 0 
                    ? `${remainingCalories.toLocaleString()} kcal υπολείπονται` 
                    : `${Math.abs(remainingCalories).toLocaleString()} kcal επιπλέον`}
                </span>
              </div>

              <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isOverTarget 
                      ? 'bg-gradient-to-r from-amber-500 to-rose-600' 
                      : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onOpenAddMeal()}
              className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Προσθήκη Γεύματος</span>
            </button>

          </div>

          {/* Bottom Row: Macronutrient Targets & Progress Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
            
            {/* Protein */}
            <div className="bg-slate-950/70 border border-rose-500/20 p-3 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-rose-400">🥩 Πρωτεΐνη</span>
                <span className="font-extrabold text-white">{totalProtein} / {macroTargets.protein}g</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${pPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {macroTargets.protein - totalProtein > 0 
                  ? `${macroTargets.protein - totalProtein}g ακόμα` 
                  : '✓ Στόχος επιτεύχθηκε!'}
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-slate-950/70 border border-amber-500/20 p-3 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-400">🍞 Υδατάνθρακες</span>
                <span className="font-extrabold text-white">{totalCarbs} / {macroTargets.carbs}g</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${cPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {macroTargets.carbs - totalCarbs > 0 
                  ? `${macroTargets.carbs - totalCarbs}g ακόμα` 
                  : '✓ Στόχος επιτεύχθηκε!'}
              </div>
            </div>

            {/* Fat */}
            <div className="bg-slate-950/70 border border-cyan-500/20 p-3 rounded-2xl space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-400">🥑 Λιπαρά</span>
                <span className="font-extrabold text-white">{totalFat} / {macroTargets.fat}g</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${fPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">
                {macroTargets.fat - totalFat > 0 
                  ? `${macroTargets.fat - totalFat}g ακόμα` 
                  : '✓ Στόχος επιτεύχθηκε!'}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Meals by Category Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center justify-between">
          <span>Καταχωρημένα Γεύματα</span>
          <span className="text-xs text-slate-400 font-normal">
            {meals.length} {meals.length === 1 ? 'γεύμα' : 'γεύματα'} συνολικά
          </span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {MEAL_CATEGORIES.map((cat) => {
            const catMeals = meals.filter(m => m.category === cat.id);
            const catCalories = catMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

            return (
              <div
                key={cat.id}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 transition hover:border-slate-700/80"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-xl ${cat.bgColor}`}>
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {catMeals.length} {catMeals.length === 1 ? 'καταχώρηση' : 'καταχωρήσεις'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      {catCalories} kcal
                    </span>
                    <button
                      onClick={() => onOpenAddMeal(undefined, cat.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                      title={`Προσθήκη στο ${cat.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Category Meals List */}
                {catMeals.length === 0 ? (
                  <div className="py-3 text-center text-xs text-slate-500 italic">
                    Δεν καταχωρήθηκε {cat.name.toLowerCase()} ακόμα.
                  </div>
                ) : (
                  <div className="mt-3 divide-y divide-slate-800/40">
                    {catMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-900/40 px-2 rounded-xl transition group"
                      >
                        <div className="flex-1 pr-4">
                          <h4 className="text-sm font-semibold text-slate-100 group-hover:text-emerald-300 transition">
                            {meal.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 pt-0.5">
                            <span>{meal.quantity}</span>
                            {(meal.protein > 0 || meal.carbs > 0 || meal.fat > 0) && (
                              <span className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
                                P:<strong className="text-rose-300">{meal.protein || 0}g</strong> • C:<strong className="text-amber-300">{meal.carbs || 0}g</strong> • F:<strong className="text-cyan-300">{meal.fat || 0}g</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-white">
                            {meal.calories} <span className="text-[10px] text-slate-400 font-normal">kcal</span>
                          </span>

                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditMeal(meal)}
                              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              title="Επεξεργασία"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteMeal(meal.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              title="Διαγραφή"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
