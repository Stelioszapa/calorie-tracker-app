import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import DailyTrackerView from './components/DailyTrackerView';
import CalendarView from './components/CalendarView';
import MonthlyStatsView from './components/MonthlyStatsView';
import AddMealModal from './components/AddMealModal';
import DataManagementModal from './components/DataManagementModal';
import { 
  getDailyTarget, 
  setDailyTarget, 
  getMealsByDate, 
  addMeal, 
  updateMeal, 
  deleteMeal,
  getProfiles,
  getActiveProfile,
  setActiveProfileId
} from './services/storage';

export default function App() {
  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const [currentView, setCurrentView] = useState('daily'); // 'daily' | 'calendar' | 'stats'
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfileState] = useState(null);
  const [dailyTarget, setDailyTargetState] = useState(2000);
  const [meals, setMeals] = useState([]);
  
  // Modals state
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize data & target
  useEffect(() => {
    loadProfileState();
  }, []);

  // Update meals whenever selectedDate or activeProfile changes
  useEffect(() => {
    refreshMeals(selectedDate);
  }, [selectedDate, activeProfile]);

  const loadProfileState = () => {
    const allProfiles = getProfiles();
    const currentActive = getActiveProfile();
    setProfiles(allProfiles);
    setActiveProfileState(currentActive);
    setDailyTargetState(currentActive ? currentActive.target : 2000);
    refreshMeals(selectedDate);
  };

  const refreshMeals = (dateStr) => {
    const dayMeals = getMealsByDate(dateStr || selectedDate);
    setMeals(dayMeals);
  };

  const handleUpdateTarget = (newTarget) => {
    const val = setDailyTarget(newTarget);
    setDailyTargetState(val);
    loadProfileState();
  };

  const handleOpenAddMeal = (mealToEdit, defaultCategory) => {
    if (mealToEdit) {
      setEditingMeal(mealToEdit);
    } else {
      setEditingMeal(defaultCategory ? { category: defaultCategory } : null);
    }
    setIsAddMealOpen(true);
  };

  const handleSaveMeal = (mealData) => {
    if (mealData.id) {
      updateMeal(mealData.id, mealData);
    } else {
      addMeal(mealData);
      
      // Trigger subtle confetti if added to today and total reaches target range
      const newTotal = meals.reduce((sum, m) => sum + m.calories, 0) + mealData.calories;
      if (selectedDate === getTodayStr() && newTotal >= dailyTarget * 0.9 && newTotal <= dailyTarget * 1.05) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    refreshMeals(selectedDate);
  };

  const handleDeleteMeal = (id) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το γεύμα;')) {
      deleteMeal(id);
      refreshMeals(selectedDate);
    }
  };

  const handleGoToToday = () => {
    const todayStr = getTodayStr();
    setSelectedDate(todayStr);
    setCurrentView('daily');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-12">
      
      {/* Primary Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        selectedDate={selectedDate}
        onGoToToday={handleGoToToday}
        activeProfile={activeProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6">
        {currentView === 'daily' && (
          <DailyTrackerView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            meals={meals}
            dailyTarget={dailyTarget}
            onOpenAddMeal={handleOpenAddMeal}
            onEditMeal={(meal) => handleOpenAddMeal(meal)}
            onDeleteMeal={handleDeleteMeal}
          />
        )}

        {currentView === 'calendar' && (
          <CalendarView
            selectedDate={selectedDate}
            onSelectDate={(dateStr) => setSelectedDate(dateStr)}
            dailyTarget={dailyTarget}
            onSwitchToDaily={() => setCurrentView('daily')}
          />
        )}

        {currentView === 'stats' && (
          <MonthlyStatsView
            dailyTarget={dailyTarget}
          />
        )}
      </main>

      {/* Modals */}
      <AddMealModal
        isOpen={isAddMealOpen}
        onClose={() => {
          setIsAddMealOpen(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        editingMeal={editingMeal}
        selectedDate={selectedDate}
      />

      <DataManagementModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataChanged={loadProfileState}
      />

    </div>
  );
}
