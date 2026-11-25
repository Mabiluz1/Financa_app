import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthResult<T = void> {
  data?: T;
  error?: string;
}

function mapAuthError(error: AuthError | Error | null | undefined): string {
  if (!error) return 'Ocorreu um erro inesperado.';
  const message = error.message || '';
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'E-mail ou senha inválidos.';
  if (lower.includes('email not confirmed')) return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.';
  if (lower.includes('user already registered')) return 'Este e-mail já está cadastrado.';
  if (lower.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (lower.includes('invalid email')) return 'Informe um e-mail válido.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Falha de conexão. Verifique sua internet e tente novamente.';
  return message || 'Ocorreu um erro inesperado.';
}

function ensureConfigured(): string | null {
  if (!isSupabaseConfigured) {
    return 'Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.';
  }
  return null;
}

export async function signIn(email: string, password: string): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  const cfgError = ensureConfigured();
  if (cfgError) return { error: cfgError };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: mapAuthError(error) };
  return { data: { user: data.user, session: data.session } };
}

export async function signUp(email: string, password: string): Promise<AuthResult<{ user: User | null; session: Session | null; needsEmailConfirmation: boolean }>> {
  const cfgError = ensureConfigured();
  if (cfgError) return { error: cfgError };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: mapAuthError(error) };
  const needsEmailConfirmation = !data.session && !!data.user;
  return { data: { user: data.user, session: data.session, needsEmailConfirmation } };
}

export async function signOut(): Promise<AuthResult> {
  const cfgError = ensureConfigured();
  if (cfgError) return { error: cfgError };
  const { error } = await supabase.auth.signOut();
  if (error) return { error: mapAuthError(error) };
  return {};
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
