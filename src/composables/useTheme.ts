import { ref } from 'vue';
import { Preferences } from '@capacitor/preferences';

const THEME_KEY = 'app_theme_preference';
const isDarkMode = ref(false);
let initialized = false;

function applyTheme(dark: boolean) {
  isDarkMode.value = dark;
  document.body.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}

export function useTheme() {
  async function initTheme() {
    if (initialized) return;
    initialized = true;
    try {
      const { value } = await Preferences.get({ key: THEME_KEY });
      if (value === 'dark' || value === 'light') {
        applyTheme(value === 'dark');
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark);
      }
    } catch {
      applyTheme(false);
    }
  }

  async function setDarkMode(enabled: boolean) {
    applyTheme(enabled);
    try {
      await Preferences.set({ key: THEME_KEY, value: enabled ? 'dark' : 'light' });
    } catch {
      // preferência visual já aplicada; falha ao persistir não deve quebrar a UI
    }
  }

  async function toggleTheme() {
    await setDarkMode(!isDarkMode.value);
  }

  return {
    isDarkMode,
    initTheme,
    setDarkMode,
    toggleTheme
  };
}
