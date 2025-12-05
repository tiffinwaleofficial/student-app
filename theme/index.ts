import { Theme } from './types';
import { lightColors, darkColors, palette } from './colors';
import { typography, fontStyles } from './typography';
import { spacing, layout, shadows } from './spacing';
import { borderRadius } from './borderRadius';

export const lightTheme: Theme = {
    colors: lightColors,
    typography,
    spacing,
    borderRadius,
    mode: 'light',
};

export const darkTheme: Theme = {
    colors: darkColors,
    typography,
    spacing,
    borderRadius,
    mode: 'dark',
};

export * from './types';
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './borderRadius';
export { palette, fontStyles, layout, shadows };
