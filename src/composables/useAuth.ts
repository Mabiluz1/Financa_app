import { computed, ref } from 'vue';
import type { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange, signIn, signOut, signUp } from '@/services/authService';

const user = ref<User | null>(null);
const session = ref<Session | null>(null);
const authLoading = ref(true);
const initialized = ref(false);
let authSubscription: { unsubscribe: () => void } | null = null;

export function useAuth() {
  const isAuthenticated = computed(() => !!session.value?.user);

  async function initAuth() {
    if (initialized.value) {
      authLoading.value = false;
      return;
    }
    authLoading.value = true;
    try {
      const currentSession = await getSession();
      session.value = currentSession;
      user.value = currentSession?.user ?? null;
      const { data } = onAuthStateChange((newSession) => {
        session.value = newSession;
        user.value = newSession?.user ?? null;
      });
      authSubscription = data.subscription;
      initialized.value = true;
    } finally {
      authLoading.value = false;
    }
  }

  async function login(email: string, password: string) {
    const result = await signIn(email, password);
    if (result.data?.session) {
      session.value = result.data.session;
      user.value = result.data.user ?? null;
    }
    return result;
  }

  async function register(email: string, password: string) {
    return await signUp(email, password);
  }

  async function logout() {
    const result = await signOut();
    if (!result.error) {
      session.value = null;
      user.value = null;
    }
    return result;
  }

  function cleanupAuthListener() {
    authSubscription?.unsubscribe();
    authSubscription = null;
    initialized.value = false;
  }

  return {
    user,
    session,
    authLoading,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    cleanupAuthListener
  };
}
