import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Award
} from 'lucide-react';
import { getAllMeals } from '../services/storage';

const GREEK_MONTHS = [
  'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
  'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
];

export default function MonthlyStatsView({ dailyTarget }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const allMeals = getAllMeals();

  // Navigation
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

  // Generate monthly data array for chart
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const daysCount = getDaysInMonth(currentYear, currentMonth);

  let totalMonthlyCalories = 0;
  let activeDaysCount = 0;
  let daysMetTarget = 0;
  let daysExceededTarget = 0;
  let maxDayCalories = 0;
  let maxDayDate = '-';

  const chartData = [];

  for (let day = 1; day <= daysCount; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayMeals = allMeals.filter(m => m.date === dateStr);
    const dayTotal = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

    if (dayMeals.length > 0) {
      activeDaysCount++;
      totalMonthlyCalories += dayTotal;

      if (dayTotal <= dailyTarget) {
        daysMetTarget++;
      } else {
        daysExceededTarget++;
      }

      if (dayTotal > maxDayCalories) {
        maxDayCalories = dayTotal;
        maxDayDate = `${day} ${GREEK_MONTHS[currentMonth].substring(0, 3)}`;
      }
    }

    chartData.push({
      day: day.toString(),
      dateStr,
      calories: dayTotal,
      isOver: dayTotal > dailyTarget,
      hasData: dayMeals.length > 0
    });
  }

  const dailyAverage = activeDaysCount > 0 ? Math.round(totalMonthlyCalories / activeDaysCount) : 0;

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-white mb-1">Ημέρα {data.day} ({data.dateStr})</p>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Θερμίδες:</span>
            <span className={`font-bold ${data.isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
              {data.calories.toLocaleString()} kcal
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {data.hasData 
              ? (data.isOver ? '⚠️ Υπέρβαση στόχου' : '✅ Εντός στόχου') 
              : 'Δεν καταχωρήθηκαν γεύματα'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Month Selector Bar */}
      <div className="glass-panel p-4 rounded-3xl flex items-center justify-between shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 rounded-2xl shadow-lg">
            <BarChart3 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Στατιστικά {GREEK_MONTHS[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-slate-400">Μηνιαία ανάλυση και τάσεις θερμίδων</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Calories */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Σύνολο Μήνα</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {totalMonthlyCalories.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">kcal καταναλώθηκαν</p>
        </div>

        {/* Daily Average */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ημερήσιος Μ.Ο.</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {dailyAverage.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">kcal ανά ενεργή ημέρα</p>
        </div>

        {/* Goal Met Days */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Εντός Στόχου</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {daysMetTarget} <span className="text-xs font-normal text-slate-400">/ {activeDaysCount} ημ.</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">
            {activeDaysCount > 0 ? `${Math.round((daysMetTarget / activeDaysCount) * 100)}% επιτυχία` : '0%'}
          </p>
        </div>

        {/* Highest Calorie Day */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Μέγιστη Ημέρα</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {maxDayCalories.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">{maxDayDate}</p>
        </div>

      </div>

      {/* Bar Chart Section */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Τάση Θερμίδων ανά Ημέρα</h3>
            <p className="text-xs text-slate-400">
              Ημερήσια κατανάλωση σε σύγκριση με τον στόχο των <span className="text-emerald-400 font-medium">{dailyTarget} kcal</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">≤ Στόχος</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-300">&gt; Στόχος</span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-64 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                y={dailyTarget} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                label={{ value: `Στόχος (${dailyTarget})`, fill: '#10b981', fontSize: 10, position: 'top' }} 
              />
              <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.calories === 0 ? '#1e293b' : entry.isOver ? '#f43f5e' : '#10b981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
