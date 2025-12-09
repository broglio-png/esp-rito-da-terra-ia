import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, Save, X, Battery } from 'lucide-react';
import { CARB_LIMITS } from '../constants';

interface Props {
  profile: UserProfile;
  dailyCarbs: number;
  onUpdate: (profile: UserProfile) => void;
}

export const UserProfileCard: React.FC<Props> = ({ profile, dailyCarbs, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  const handleSave = () => {
    onUpdate(tempProfile);
    setIsEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: string | number) => {
    setTempProfile(prev => ({ ...prev, [field]: value }));
    
    // Auto-update carb limit if phase changes
    if (field === 'phase') {
      const newPhase = Number(value);
      setTempProfile(prev => ({ 
        ...prev, 
        phase: newPhase,
        dailyCarbLimit: CARB_LIMITS[newPhase as 1|2|3] || 100
      }));
    }
  };

  const remainingCarbs = Math.max(0, profile.dailyCarbLimit - dailyCarbs);
  const percentUsed = Math.min(100, (dailyCarbs / profile.dailyCarbLimit) * 100);
  
  const getProgressBarColor = () => {
    if (percentUsed < 75) return 'bg-emerald-500';
    if (percentUsed < 100) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-emerald-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-emerald-800">Editar Perfil</h3>
          <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fase da Dieta</label>
            <select 
              value={tempProfile.phase}
              onChange={(e) => handleChange('phase', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value={1}>Fase 1 - Indução (Detox)</option>
              <option value={2}>Fase 2 - Perda Contínua</option>
              <option value={3}>Fase 3 - Manutenção</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso Atual (kg)</label>
            <input 
              type="number" 
              value={tempProfile.currentWeight}
              onChange={(e) => handleChange('currentWeight', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Meta (kg)</label>
             <input 
              type="number" 
              value={tempProfile.goalWeight}
              onChange={(e) => handleChange('goalWeight', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="col-span-2">
             <label className="block text-sm font-medium text-gray-700 mb-1">Meta de Carbs Líquidos (g/dia)</label>
             <input 
              type="number" 
              value={tempProfile.dailyCarbLimit}
              onChange={(e) => handleChange('dailyCarbLimit', Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          
           <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contexto Recente</label>
            <textarea
              value={tempProfile.context}
              onChange={(e) => handleChange('context', e.target.value)}
              placeholder="Ex: Perdi 2kg semana passada, me sinto inchado..."
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              rows={2}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
        >
          <Save size={18} /> Salvar Alterações
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-sm p-4 mb-6 border border-emerald-100 flex justify-between items-start">
      <div className="w-full mr-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
            FASE {profile.phase}
          </span>
          <span className="text-gray-400 text-xs">|</span>
          <span className="text-sm font-medium text-gray-600">
            {profile.currentWeight}kg <span className="text-xs">➜</span> {profile.goalWeight}kg
          </span>
        </div>

        {/* Daily Carb Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
             <span className="font-semibold text-gray-700 flex items-center gap-1">
               <Battery size={14} className={percentUsed > 100 ? "text-red-500" : "text-emerald-500"}/>
               Carbs Hoje
             </span>
             <span className="font-bold text-gray-900">
               {dailyCarbs}g <span className="text-gray-400 font-normal">/ {profile.dailyCarbLimit}g</span>
             </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor()}`} 
              style={{ width: `${percentUsed}%` }}
            ></div>
          </div>
          <div className="mt-1 text-right">
             <span className={`text-xs font-medium ${remainingCarbs === 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                Saldo: {remainingCarbs}g restantes
             </span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsEditing(true)}
        className="p-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-600 hover:text-emerald-600 transition-colors shrink-0"
      >
        <Settings size={20} />
      </button>
    </div>
  );
};
