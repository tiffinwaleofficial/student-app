export interface ColorPalette {
    // Primitives
    orange: string;
    white: string;
    black: string;
    grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    red: string;
    green: string;
    blue: string;
    blueLight: string;
    orangeLight: string;
    transparent: string;
}

export interface ThemeColors {
    primary: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    error: string;
    success: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
    modalOverlay: string;
    shadowColor: string;
    primaryLight: string;
    info: string;
    infoLight: string;
    warningText: string;
    white: string;
}

export interface Typography {
    fontFamily: {
        regular: string;
        medium: string;
        bold: string;
        semiBold: string;
    };
    size: {
        xs: number;
        s: number;
        m: number;
        l: number;
        xl: number;
        xxl: number;
        xxxl: number;
    };
    weight: {
        regular: '400';
        medium: '500';
        semiBold: '600';
        bold: '700';
    };
}

export interface Spacing {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
}

export interface BorderRadius {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    round: number;
}

export interface Theme {
    colors: ThemeColors;
    typography: Typography;
    spacing: Spacing;
    borderRadius: BorderRadius;
    mode: 'light' | 'dark';
}
