import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../theme';

interface ThemeContextType {
    theme: Theme;
    mode: 'light' | 'dark';
    toggleTheme: () => void;
    setMode: (mode: 'light' | 'dark') => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    mode: 'light',
    toggleTheme: () => { },
    setMode: () => { },
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const systemColorScheme = useColorScheme();
    const [mode, setModeState] = useState<'light' | 'dark'>('light'); // Default to light for now

    // Optional: Sync with system preference on mount if desired, 
    // but for now we stick to manual control or default light as per request.
    // useEffect(() => {
    //   if (systemColorScheme) {
    //     setModeState(systemColorScheme);
    //   }
    // }, [systemColorScheme]);

    const toggleTheme = () => {
        setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const setMode = (newMode: 'light' | 'dark') => {
        setModeState(newMode);
    };

    const theme = mode === 'light' ? lightTheme : darkTheme;

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleTheme, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
