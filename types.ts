export interface UserProfile {
  phase: number;
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  context: string;
  dailyCarbLimit: number; // New: Limit for the day
}

export enum Verdict {
  APROVADO = "APROVADO",
  COM_MODERACAO = "COM MODERAÇÃO",
  REPROVADO = "REPROVADO"
}

export interface FoodItem {
  alimento: string;
  peso_estimado_g: number;
  carbs_liquidos_g: number;
  status_na_fase: "PERMITIDO" | "ATENÇÃO" | "PROIBIDO";
  motivo_status: string;
}

export interface PlateSummary {
  total_carbs_liquidos: number;
  veredito_final: Verdict | string;
  mensagem_coach: string;
  feedback_progresso: string;
  sugestao_correcao: string | null;
}

export interface ExerciseSuggestion {
  titulo: string;
  descricao: string;
  intensidade: "BAIXA" | "MÉDIA" | "ALTA";
  duracao_minutos: number;
}

export interface AIResponse {
  analise_visual: FoodItem[];
  resumo_prato: PlateSummary;
  sugestao_movimento: ExerciseSuggestion;
}
