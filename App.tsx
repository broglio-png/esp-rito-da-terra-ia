import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Leaf, Moon, Sun, Download } from 'lucide-react';
import { UserProfileCard } from './components/UserProfileCard';
import { WeightChart } from './components/WeightChart';
import { AnalysisResult } from './components/AnalysisResult';
import { analyzeMeal } from './services/geminiService';
import { UserProfile, AIResponse } from './types';
import { CARB_LIMITS } from './constants';

const INITIAL_PROFILE: UserProfile = {
  phase: 1,
  startWeight: 95,
  currentWeight: 92,
  goalWeight: 80,
  dailyCarbLimit: CARB_LIMITS[1],
  context: "Perdi 3kg na primeira semana, me sinto motivado."
};

const App: React.FC = () => {
  // --- State ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  
  const [dailyCarbs, setDailyCarbs] = useState<number>(() => {
      const savedDate = localStorage.getItem('carb_date');
      const savedCarbs = localStorage.getItem('daily_carbs');
      const today = new Date().toDateString();
      
      // Reset if it's a new day
      if (savedDate !== today) {
          return 0;
      }
      return savedCarbs ? Number(savedCarbs) : 0;
  });

  const [analysis, setAnalysis] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLateNight, setIsLateNight] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // --- Effects ---
  
  // Persist Profile
  useEffect(() => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
  }, [profile]);

  // Persist Daily Carbs
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem('daily_carbs', String(dailyCarbs));
    localStorage.setItem('carb_date', today);
  }, [dailyCarbs]);

  // Check Time of Day
  useEffect(() => {
      const hour = new Date().getHours();
      setIsLateNight(hour >= 20 || hour < 5); // Late night is after 8 PM or before 5 AM
  }, []);

  // PWA Install Prompt Listener
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBtn(true);
      console.log("Install prompt captured");
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBtn(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // --- Handlers ---

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const handleLogMeal = (carbs: number) => {
    setDailyCarbs(prev => prev + carbs);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      setIsLoading(true);
      setError(null);
      setAnalysis(null);

      try {
        const result = await analyzeMeal(file, profile);
        setAnalysis(result);
      } catch (err) {
        setError("Não foi possível analisar a imagem. Tente novamente.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
                <Leaf className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Espírito da Terra</h1>
              <p className="text-xs text-emerald-600 font-medium">IA Diet Coach</p>
            </div>
          </div>
          
          {showInstallBtn && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-emerald-200 transition-colors"
            >
              <Download size={14} />
              Instalar
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        
        {/* Late Night Warning */}
        {isLateNight && (
            <div className="bg-indigo-900 rounded-xl p-4 mb-6 flex items-start gap-4 text-indigo-100 shadow-lg">
                <Moon className="w-8 h-8 text-yellow-300 shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-white mb-1">Horário de Descanso</h3>
                    <p className="text-sm leading-relaxed opacity-90">
                        Comer tarde pode atrapalhar a produção de hormônios do emagrecimento. Que tal um chá de camomila ou apenas água? 
                    </p>
                </div>
            </div>
        )}

        {/* User Stats & Daily Progress */}
        <UserProfileCard 
            profile={profile} 
            dailyCarbs={dailyCarbs}
            onUpdate={setProfile} 
        />

        {/* Action Area */}
        {!analysis && !isLoading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center mb-6">
            <WeightChart profile={profile} />
            <div className="mt-6">
              <label 
                htmlFor="camera-input" 
                className="bg-emerald-600 active:bg-emerald-700 text-white rounded-xl py-4 px-6 w-full flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-emerald-200 cursor-pointer transition-transform active:scale-95"
              >
                <Camera size={24} />
                Analisar Refeição
              </label>
              <input 
                id="camera-input" 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden"
                onChange={handleImageSelect}
              />
              <p className="text-xs text-gray-400 mt-3">Tire uma foto clara do seu prato</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center animate-pulse">
            <div className="w-24 h-24 bg-gray-200 rounded-xl mx-auto mb-4 overflow-hidden relative">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />}
                <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-emerald-600 w-8 h-8" />
                </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Analisando Ingredientes...</h3>
            <p className="text-sm text-gray-500">Consultando tabela nutricional e regras da Fase {profile.phase}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 flex items-center gap-3">
             <div className="bg-red-100 p-2 rounded-full"><RefreshCw size={16} /></div>
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            <div className="relative">
               <img src={previewUrl!} alt="Analyzed Meal" className="w-full h-48 object-cover rounded-2xl shadow-md" />
               <button 
                onClick={() => {
                    setAnalysis(null);
                    setPreviewUrl(null);
                }}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
               >
                 <RefreshCw size={18} />
               </button>
            </div>
            
            <AnalysisResult data={analysis} onLogMeal={handleLogMeal} />
            
            <button 
                onClick={() => {
                    setAnalysis(null);
                    setPreviewUrl(null);
                }}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold mt-4 shadow-lg active:scale-95 transition-transform"
            >
                Nova Análise
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;