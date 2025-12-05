import { Spacing } from './types';

export const spacing: Spacing = {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
};

export const layout = {
    screenPadding: 16,
    cardPadding: 16,
    cardPaddingLarge: 20,
    sectionGap: 24,
    itemGap: 12,
    inputHeight: 52,
    buttonHeight: 52,
    buttonHeightSmall: 40,
    iconSize: {
        xs: 16,
        s: 20,
        m: 24,
        l: 32,
        xl: 48,
    },
    borderRadius: {
        xs: 4,
        s: 8,
        m: 12,
        l: 16,
        xl: 20,
        xxl: 24,
        full: 9999,
    },
};

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    small: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    medium: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    large: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    orange: {
        shadowColor: '#FF9B42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
};
