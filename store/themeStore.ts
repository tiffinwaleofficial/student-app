import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '@/theme';
import { Theme } from '@/theme/types';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  theme: Theme;
  isInitialized: boolean;
  
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
}

const getSystemTheme = (): 'light' | 'dark' => {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
};

const resolveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

const getThemeObject = (resolvedMode: 'light' | 'dark'): Theme => {
  return resolvedMode === 'dark' ? darkTheme : lightTheme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      resolvedMode: 'light',
      theme: lightTheme,
      isInitialized: false,

      setMode: (mode: ThemeMode) => {
        const resolvedMode = resolveTheme(mode);
        const theme = getThemeObject(resolvedMode);
        
        set({ mode, resolvedMode, theme });
        
        if (__DEV__) {
          console.log('🎨 ThemeStore: Theme changed to', mode, '(resolved:', resolvedMode, ')');
        }
      },

      toggleTheme: () => {
        const { mode } = get();
        let newMode: ThemeMode;
        
        if (mode === 'light') {
          newMode = 'dark';
        } else if (mode === 'dark') {
          newMode = 'system';
        } else {
          newMode = 'light';
        }
        
        const resolvedMode = resolveTheme(newMode);
        const theme = getThemeObject(resolvedMode);
        
        set({ mode: newMode, resolvedMode, theme });
        
        if (__DEV__) {
          console.log('🎨 ThemeStore: Theme toggled to', newMode, '(resolved:', resolvedMode, ')');
        }
      },

      initializeTheme: async () => {
        const { mode } = get();
        const resolvedMode = resolveTheme(mode);
        const theme = getThemeObject(resolvedMode);
        
        set({ resolvedMode, theme, isInitialized: true });
        
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
          const currentMode = get().mode;
          if (currentMode === 'system') {
            const newResolvedMode = colorScheme === 'dark' ? 'dark' : 'light';
            const newTheme = getThemeObject(newResolvedMode);
            set({ resolvedMode: newResolvedMode, theme: newTheme });
            
            if (__DEV__) {
              console.log('🎨 ThemeStore: System theme changed to', newResolvedMode);
            }
          }
        });
        
        if (__DEV__) {
          console.log('🎨 ThemeStore: Initialized with mode', mode, '(resolved:', resolvedMode, ')');
        }
      },
    }),
    {
      name: 'tiffin-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolvedMode = resolveTheme(state.mode);
          state.resolvedMode = resolvedMode;
          state.theme = getThemeObject(resolvedMode);
          state.isInitialized = true;
        }
      },
    }
  )
);

export const getThemeColors = () => {
  return useThemeStore.getState().theme.colors;
};

export const isDarkMode = () => {
  return useThemeStore.getState().resolvedMode === 'dark';
};
