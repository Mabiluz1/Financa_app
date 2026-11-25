import { supabase } from './supabase';
import type { Receita, ReceitaInput } from '@/types/financeiro';

export interface ServiceResult<T = void> {
  data?: T;
  error?: string;
}

function mapError(error: unknown): string {
  if (!error) return 'Ocorreu um erro inesperado.';
  const msg = (error as { message?: string }).message || '';
  const lower = msg.toLowerCase();
  if (lower.includes('row-level security') || lower.includes('permission')) {
    return 'Você não tem permissão para realizar esta operação.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'Falha de conexão com o servidor. Tente novamente.';
  }
  if (lower.includes('violates check constraint')) {
    return 'Valor inválido. O valor deve ser maior que zero.';
  }
  return msg || 'Ocorreu um erro inesperado.';
}

export async function listReceitas(userId: string): Promise<ServiceResult<Receita[]>> {
  const { data, error } = await supabase
    .from('receitas')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) return { error: mapError(error) };
  return { data: (data ?? []) as Receita[] };
}

export async function createReceita(userId: string, input: ReceitaInput): Promise<ServiceResult<Receita>> {
  const { data, error } = await supabase
    .from('receitas')
    .insert([{ ...input, user_id: userId }])
    .select()
    .single();
  if (error) return { error: mapError(error) };
  return { data: data as Receita };
}

export async function updateReceita(id: string, userId: string, input: ReceitaInput): Promise<ServiceResult<Receita>> {
  const { data, error } = await supabase
    .from('receitas')
    .update({ ...input })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) return { error: mapError(error) };
  return { data: data as Receita };
}

export async function deleteReceita(id: string, userId: string): Promise<ServiceResult> {
  const { error } = await supabase.from('receitas').delete().eq('id', id).eq('user_id', userId);
  if (error) return { error: mapError(error) };
  return {};
}
