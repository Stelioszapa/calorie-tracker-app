import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { getAllMeals } from '../services/storage';

const GREEK_MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
];

const GREEK_WEEKDAYS = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'];

export default function CalendarView({
  selectedDate,
  onSelectDate,
  dailyTarget,
  onSwitchToDaily
}) {
  // Parse initial year and month from selectedDate or current date
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-11

  // Fetch all meals to aggregate daily totals
  const allMeals = getAllMeals();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const todayStr = today.toISOString().split('T')[0];
    onSelectDate(todayStr);
  };

  // Helper to map daily total calories
  const getDayMetrics = (year, month, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayMeals = allMeals.filter(m => m.date === dateStr);
    const total = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    return { dateStr, total, count: dayMeals.length };
  };

  // Generate Calendar Grid Days
  const getCalendarDays = () => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // ISO weekday: Monday = 0, Sunday = 6
    let startingDay = firstDayOfMonth.getDay() - 1;
    if (startingDay === -1) startingDay = 6; // Sunday

    const totalDays = lastDayOfMonth.getDate();

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        month: currentMonth === 0 ? 11 : currentMonth - 1
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        year: currentYear,
        month: currentMonth
      });
    }

    // Next month padding to complete 35 or 42 cells grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        month: currentMonth === 11 ? 0 : currentMonth + 1
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Calendar Control Header */}
      <div className="glass-panel p-4 rounded-3xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {GREEK_MONTHS[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-slate-400">Μηνιαία προβολή ημερολογίου & θερμίδων</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleGoToToday}
            className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold hover:bg-emerald-500/30 transition"
          >
            Σήμερα
          </button>
          
          <button
            onClick={handlePrevMonth}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition border border-slate-800"
            title="Προηγούμενος Μήνας"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleNextMonth}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition border border-slate-800"
            title="Επόμενος Μήνας"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Legend Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <span className="text-slate-400 font-medium">Υπόμνημα Κατάστασης:</span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400" />
            <span className="text-slate-300">Εντός Στόχου (≤{dailyTarget} kcal)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-400" />
            <span className="text-slate-300">Υπέρβαση (&gt;{dailyTarget} kcal)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <span className="text-slate-400">Χωρίς εγγραφές</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
        
        {/* Weekday Labels Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center mb-3">
          {GREEK_WEEKDAYS.map((dayName, idx) => (
            <div
              key={idx}
              className={`py-2 text-xs font-bold uppercase tracking-wider ${
                idx >= 5 ? 'text-amber-400/80' : 'text-slate-400'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((cell, idx) => {
            const { dateStr, total, count } = getDayMetrics(cell.year, cell.month, cell.day);
            const isSelected = selectedDate === dateStr;
            const isToday = todayStr === dateStr;
            const hasData = count > 0;
            const isOver = total > dailyTarget;

            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectDate(dateStr);
                }}
                className={`min-h-[75px] sm:min-h-[95px] p-2 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between group ${
                  !cell.isCurrentMonth
                    ? 'opacity-30 border-slate-900 bg-slate-950/20'
                    : isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40'
                    : isToday
                    ? 'bg-slate-900/90 border-teal-500/60'
                    : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/70 hover:border-slate-700'
                }`}
              >
                {/* Top Row: Day Number & Today indicator */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    isToday
                      ? 'bg-teal-500 text-slate-950 font-black'
                      : cell.isCurrentMonth
                      ? 'text-slate-200'
                      : 'text-slate-600'
                  }`}>
                    {cell.day}
                  </span>

                  {hasData && (
                    <div className={`w-2 h-2 rounded-full ${isOver ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
                  )}
                </div>

                {/* Center / Bottom Row: Calories Badge */}
                {cell.isCurrentMonth && (
                  <div className="mt-1">
                    {hasData ? (
                      <div className={`p-1 sm:p-1.5 rounded-xl border text-[10px] sm:text-xs font-bold text-center transition ${
                        isOver
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300 group-hover:bg-rose-500/25'
                          : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 group-hover:bg-emerald-500/25'
                      }`}>
                        <span>{total.toLocaleString()}</span>
                        <span className="block text-[8px] sm:text-[9px] font-normal opacity-80">kcal</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-600 text-center py-1 opacity-0 group-hover:opacity-100 transition">
                        + προσθήκη
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer Selected Date Banner */}
      {selectedDate && (
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-emerald-500/30 shadow-lg">
          <div>
            <span className="text-xs text-slate-400">Επιλεγμένη Ημερομηνία:</span>
            <h4 className="text-sm sm:text-base font-bold text-emerald-400">
              {selectedDate}
            </h4>
          </div>

          <button
            onClick={onSwitchToDaily}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-md hover:from-emerald-400 hover:to-teal-400 transition"
          >
            <span>Προβολή Ημέρας</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
