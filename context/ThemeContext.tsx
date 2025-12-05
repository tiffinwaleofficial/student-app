import * as React from 'react';
import { createContext, useEffect, ReactNode } from 'react';
import { Theme, lightTheme } from '../theme';
import { useThemeStore } from '@/store/themeStore';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    mode: ThemeMode;
    resolvedMode: 'light' | 'dark';
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
    isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    mode: 'light',
    resolvedMode: 'light',
    toggleTheme: () => { },
    setMode: () => { },
    isDarkMode: false,
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const AppThemeProvider = ({ children }: ThemeProviderProps) => {
    const { 
        theme, 
        mode, 
        resolvedMode, 
        toggleTheme, 
        setMode, 
        initializeTheme,
        isInitialized 
    } = useThemeStore();

    useEffect(() => {
        if (!isInitialized) {
            initializeTheme();
        }
    }, [isInitialized, initializeTheme]);

    const contextValue: ThemeContextType = {
        theme,
        mode,
        resolvedMode,
        toggleTheme,
        setMode,
        isDarkMode: resolvedMode === 'dark',
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const ThemeProvider = AppThemeProvider;
