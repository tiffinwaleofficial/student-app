import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useThemeStore } from '@/store/themeStore';

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const useAppTheme = () => {
    const store = useThemeStore();
    return {
        theme: store.theme,
        mode: store.mode,
        resolvedMode: store.resolvedMode,
        isDarkMode: store.resolvedMode === 'dark',
        toggleTheme: store.toggleTheme,
        setMode: store.setMode,
        colors: store.theme.colors,
        typography: store.theme.typography,
        spacing: store.theme.spacing,
        borderRadius: store.theme.borderRadius,
    };
};
