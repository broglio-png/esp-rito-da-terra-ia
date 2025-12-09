import React, { useState } from 'react';
import { AIResponse, Verdict } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Dumbbell, Utensils, PlusCircle, Check } from 'lucide-react';

interface Props {
  data: AIResponse;
  onLogMeal: (carbs: number) => void;
}

export const AnalysisResult: React.FC<Props> = ({ data, onLogMeal }) => {
  const { analise_visual, resumo_prato, sugestao_movimento } = data;
  
  // Initialize state with all indices selected by default
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(analise_visual.map((_, i) => i))
  );
  const [isLogged, setIsLogged] = useState(false);

  const toggleItem = (index: number) => {
    if (isLogged) return; // Prevent changing after logging
    const newSelected = new Set(selectedIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedIndices(newSelected);
  };

  const calculateSelectedCarbs = () => {
    let total = 0;
    analise_visual.forEach((item, index) => {
      if (selectedIndices.has(index)) {
        total += item.carbs_liquidos_g;
      }
    });
    return total;
  };

  const handleLog = () => {
    const total = calculateSelectedCarbs();
    onLogMeal(total);
    setIsLogged(true);
  };

  const getVerdictColor = (v: string) => {
    switch (v) {
      case Verdict.APROVADO: return 'bg-green-100 text-green-800 border-green-200';
      case Verdict.COM_MODERACAO: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Verdict.REPROVADO: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerdictIcon = (v: string) => {
    switch (v) {
      case Verdict.APROVADO: return <CheckCircle className="w-6 h-6 text-green-600" />;
      case Verdict.COM_MODERACAO: return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case Verdict.REPROVADO: return <XCircle className="w-6 h-6 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Verdict Card */}
      <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 ${getVerdictColor(resumo_prato.veredito_final as string)}`}>
        <div className="shrink-0 mt-1">
          {getVerdictIcon(resumo_prato.veredito_final as string)}
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-1">{resumo_prato.veredito_final}</h2>
          <p className="font-medium text-lg leading-snug mb-2">{resumo_prato.mensagem_coach}</p>
          <p className="text-sm opacity-90 italic">"{resumo_prato.feedback_progresso}"</p>
          
          {resumo_prato.sugestao_correcao && (
            <div className="mt-3 bg-white/50 p-3 rounded-lg text-sm">
              <span className="font-bold">💡 Correção: </span>
              {resumo_prato.sugestao_correcao}
            </div>
          )}
        </div>
      </div>

      {/* Food List with Checkboxes */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="flex items-center justify-between text-lg font-bold text-gray-800 mb-4">
          <div className="flex items-center gap-2">
            <Utensils size={20} className="text-emerald-600" />
            <span>O que você comeu?</span>
          </div>
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Marque os itens
          </span>
        </h3>
        
        <div className="space-y-3">
          {analise_visual.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleItem(idx)}
              className={`flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0 cursor-pointer transition-opacity ${!selectedIndices.has(idx) ? 'opacity-50' : ''}`}
            >
              <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  selectedIndices.has(idx) ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 bg-white'
              }`}>
                  {selectedIndices.has(idx) && <Check size={12} className="text-white" />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-900">{item.alimento}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase ml-2 ${
                        item.status_na_fase === 'PERMITIDO' ? 'bg-green-100 text-green-700' :
                        item.status_na_fase === 'ATENÇÃO' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {item.status_na_fase}
                    </span>
                </div>
                <div className="text-xs text-gray-500">{item.peso_estimado_g}g • <span className="font-bold text-gray-700">{item.carbs_liquidos_g}g Carbs</span></div>
                {item.motivo_status && (
                    <div className="text-xs text-gray-400 mt-0.5 leading-tight">{item.motivo_status}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total Selection Calculation */}
        <div className="mt-4 pt-4 border-t border-gray-100">
             <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-500">Total Selecionado</span>
                <span className="text-xl font-bold text-gray-900">{calculateSelectedCarbs()}g <span className="text-xs text-gray-400 font-normal">Carbs</span></span>
            </div>
            
            <button
                onClick={handleLog}
                disabled={isLogged}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isLogged 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-95'
                }`}
            >
                {isLogged ? (
                    <>
                        <CheckCircle size={20} /> Registrado no Diário
                    </>
                ) : (
                    <>
                        <PlusCircle size={20} /> Registrar Consumo
                    </>
                )}
            </button>
        </div>
      </div>

      {/* Exercise Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Dumbbell size={100} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Dumbbell size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Sugestão de Movimento</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{sugestao_movimento.titulo}</h3>
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">{sugestao_movimento.descricao}</p>
          
          <div className="flex gap-3">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-medium">
              ⏱ {sugestao_movimento.duracao_minutos} min
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 ${
              sugestao_movimento.intensidade === 'ALTA' ? 'text-red-300' :
              sugestao_movimento.intensidade === 'MÉDIA' ? 'text-yellow-300' :
              'text-emerald-300'
            }`}>
              ⚡ Intensidade: {sugestao_movimento.intensidade}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
