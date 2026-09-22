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
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('daily')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                NutriCal
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:block">
                Calorie & Macro Tracker
              </p>
            </div>
          </div>

          {/* Navigation View Switcher Tabs */}
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setCurrentView('daily')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'daily'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden xs:inline">Ημέρα</span>
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'calendar'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden xs:inline">Ημερολόγιο</span>
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'stats'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-semibold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden xs:inline">Στατιστικά</span>
            </button>
          </nav>

          {/* Active Profile Indicator & Settings Button */}
          <div className="flex items-center space-x-2">
            {!isTodaySelected && (
              <button
                onClick={onGoToToday}
                className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 font-medium transition"
                title="Επιστροφή στο Σήμερα"
              >
                Σήμερα
              </button>
            )}

            {/* Profile Badge (Click opens Settings to switch) */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                isPink 
                  ? 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
              title="Αλλαγή Προφίλ στις Ρυθμίσεις"
            >
              {isPink ? <Heart className="w-3.5 h-3.5 fill-current text-pink-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{activeProfile ? (activeProfile.shortName || activeProfile.name) : 'Προφίλ'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700/60 transition"
              title="Ρυθμίσεις & Αλλαγή Προφίλ"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
