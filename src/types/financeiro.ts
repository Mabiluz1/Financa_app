export type CategoriaReceita = 'Salário' | 'Freelance' | 'Investimentos' | 'Outros';
export type CategoriaDespesa =
  | 'Alimentação'
  | 'Transporte'
  | 'Moradia'
  | 'Educação'
  | 'Lazer'
  | 'Saúde'
  | 'Outros';

export interface TransacaoBase {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data: string; // ISO date YYYY-MM-DD
  user_id: string;
}

export interface Receita extends TransacaoBase {
  categoria: CategoriaReceita;
}

export interface Despesa extends TransacaoBase {
  categoria: CategoriaDespesa;
}

export type TipoTransacao = 'receita' | 'despesa';

export interface ReceitaInput {
  descricao: string;
  valor: number;
  categoria: CategoriaReceita;
  data: string;
}

export interface DespesaInput {
  descricao: string;
  valor: number;
  categoria: CategoriaDespesa;
  data: string;
}

export type PeriodoFiltroTipo = 'todos' | 'mes_atual' | 'mes_anterior' | 'ano_atual' | 'personalizado';

export interface PeriodoFiltro {
  tipo: PeriodoFiltroTipo;
  inicio?: string; // YYYY-MM-DD
  fim?: string; // YYYY-MM-DD
}

export const CATEGORIAS_RECEITA: CategoriaReceita[] = ['Salário', 'Freelance', 'Investimentos', 'Outros'];
export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Educação',
  'Lazer',
  'Saúde',
  'Outros'
];
