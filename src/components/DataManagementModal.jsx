import React, { useState } from 'react';
import { X, Target, Download, Upload, Database, CheckCircle2, AlertCircle, Trash2, User, Heart, Settings } from 'lucide-react';
import { exportDataJSON, importDataJSON, clearAllMeals, getProfiles, saveProfiles, getActiveProfileId, setActiveProfileId, getActiveProfile } from '../services/storage';

export default function DataManagementModal({
  isOpen,
  onClose,
  onDataChanged
}) {
  const [profilesList, setProfilesList] = useState(getProfiles());
  const [activeId, setActiveId] = useState(getActiveProfileId());
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSelectProfile = (id) => {
    setActiveProfileId(id);
    setActiveId(id);
    onDataChanged();
    setStatusMsg({ type: 'success', text: `Ενεργό προφίλ: ${profilesList.find(p => p.id === id)?.name}` });
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleFieldChange = (id, field, value) => {
    const updated = profilesList.map(p => {
      if (p.id === id) {
        return {
          ...p,
          [field]: field === 'name' ? value : Math.max(0, parseInt(value, 10) || 0)
        };
      }
      return p;
    });
    setProfilesList(updated);
    saveProfiles(updated);
    onDataChanged();
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `nutrical-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setStatusMsg({ type: 'success', text: 'Το αρχείο backup λήφθηκε επιτυχώς!' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importDataJSON(event.target.result);
      if (res.success) {
        setProfilesList(getProfiles());
        setActiveId(getActiveProfileId());
        setStatusMsg({ type: 'success', text: `Εισήχθησαν επιτυχώς ${res.count} καταχωρήσεις!` });
        onDataChanged();
        setTimeout(() => {
          setStatusMsg(null);
          onClose();
        }, 1500);
      } else {
        setStatusMsg({ type: 'error', text: res.error });
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    const curP = profilesList.find(p => p.id === activeId);
    if (window.confirm(`⚠️ ΠΡΟΣΟΧΗ: Θέλετε να διαγράψετε ΟΛΑ τα καταχωρημένα γεύματα του προφίλ "${curP ? curP.name : ''}";`)) {
      clearAllMeals();
      onDataChanged();
      setStatusMsg({ type: 'success', text: 'Όλα τα γεύματα του προφίλ διαγράφηκαν!' });
      setTimeout(() => setStatusMsg(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-modal animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ρυθμίσεις & Επιλογή Προφίλ</h2>
              <p className="text-xs text-slate-400">Επιλέξτε ενεργό προφίλ & προσαρμόστε τους στόχους</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMsg && (
          <div className={`mt-4 p-3 rounded-xl border flex items-center space-x-2 text-xs font-medium ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="mt-5 space-y-6">
          
          {/* Section 1: Active Profile Switcher */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Επιλογή Ενεργού Προφίλ</span>
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {profilesList.map((p) => {
                const isActive = activeId === p.id;
                const isPink = p.color === 'pink' || p.id === 'profile_her';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProfile(p.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                      isActive
                        ? (isPink ? 'bg-pink-950/30 border-pink-500/60 ring-2 ring-pink-500/30' : 'bg-emerald-950/30 border-emerald-500/60 ring-2 ring-emerald-500/30')
                        : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center space-x-2">
                        {isPink ? <Heart className="w-4 h-4 text-pink-400 fill-current" /> : <User className="w-4 h-4 text-emerald-400" />}
                        <span className="font-bold text-sm text-white">{p.name}</span>
                      </div>
                      
                      {isActive ? (
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                          isPink ? 'bg-pink-500/20 text-pink-300 border-pink-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          ✓ ΕΝΕΡΓΟ
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 hover:text-white">Επιλογή</span>
                      )}
                    </div>

                    {/* Macro Targets Settings Grid for this Profile */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                      
                      {/* Calories */}
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <label className="text-[10px] text-emerald-400 font-semibold block mb-1">Θερμίδες (kcal)</label>
                        <input
                          type="number"
                          min="500"
                          max="10000"
                          value={p.target}
                          onChange={(e) => handleFieldChange(p.id, 'target', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-bold text-emerald-400"
                        />
                      </div>

                      {/* Protein */}
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <label className="text-[10px] text-rose-400 font-semibold block mb-1">Πρωτεΐνη (g)</label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={p.targetProtein || 0}
                          onChange={(e) => handleFieldChange(p.id, 'targetProtein', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-bold text-rose-300"
                        />
                      </div>

                      {/* Carbs */}
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <label className="text-[10px] text-amber-400 font-semibold block mb-1">Υδατάνθρ. (g)</label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={p.targetCarbs || 0}
                          onChange={(e) => handleFieldChange(p.id, 'targetCarbs', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-bold text-amber-300"
                        />
                      </div>

                      {/* Fat */}
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <label className="text-[10px] text-cyan-400 font-semibold block mb-1">Λιπαρά (g)</label>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          value={p.targetFat || 0}
                          onChange={(e) => handleFieldChange(p.id, 'targetFat', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 font-bold text-cyan-300"
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Backup & Export / Import */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white">Αντίγραφο Ασφαλείας (Backup JSON)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Εξάγετε όλα τα προφίλ & τα γεύματα σε αρχείο JSON για μεταφορά ή ασφάλεια.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Εξαγωγή JSON</span>
              </button>

              <label className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 cursor-pointer transition">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Εισαγωγή JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Reset / Clear Meals */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-400">Εκκαθάριση Ενεργού Προφίλ</h4>
              <p className="text-[11px] text-slate-400">Διαγραφή όλων των γευμάτων του επιλεγμένου προφίλ.</p>
            </div>
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Διαγραφή</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:from-emerald-400 hover:to-teal-400 transition"
          >
            Έτοιμο
          </button>
        </div>

      </div>
    </div>
  );
}
