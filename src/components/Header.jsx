import React from 'react';
import { Calendar, LayoutDashboard, BarChart3, Settings, Flame, User, Heart } from 'lucide-react';

export default function Header({
  currentView,
  setCurrentView,
  onOpenSettings,
  selectedDate,
  onGoToToday,
  activeProfile
}) {
  const isTodaySelected = selectedDate === new Date().toISOString().split('T')[0];
  const isPink = activeProfile && (activeProfile.color === 'pink' || activeProfile.id === 'profile_her');

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-3 py-2.5 sm:px-6">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3">

          {/* Flame Icon Logo */}
          <div
            className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0 cursor-pointer"
            onClick={() => setCurrentView('daily')}
            title="NutriCal Tracker"
          >
            <Flame className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>

          {/* Navigation View Switcher Tabs */}
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setCurrentView('daily')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'daily'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Ημέρα</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'calendar'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ημερολόγιο</span>
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'stats'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Στατιστικά</span>
            </button>
          </nav>

          {/* Active Profile Badge & Settings Gear Icon */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {!isTodaySelected && (
              <button
                onClick={onGoToToday}
                className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg hover:bg-emerald-500/20 font-medium transition hidden xs:inline"
                title="Επιστροφή στο Σήμερα"
              >
                Σήμερα
              </button>
            )}

            {/* Profile Badge Button */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                isPink
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
              title="Αλλαγή Προφίλ στις Ρυθμίσεις"
            >
              {isPink ? <Heart className="w-3.5 h-3.5 fill-current text-pink-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="max-w-[70px] sm:max-w-[100px] truncate">{activeProfile ? (activeProfile.shortName || activeProfile.name) : 'Προφίλ'}</span>
            </button>

            {/* Settings Gear Icon */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700/60 transition"
              title="Ρυθμίσεις & Αλλαγή Προφίλ"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
