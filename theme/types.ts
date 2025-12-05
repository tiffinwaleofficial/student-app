export interface ColorPalette {
    orange: string;
    orangeLight: string;
    orangeDark: string;
    cream: string;
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
        950: string;
    };
    red: string;
    redLight: string;
    green: string;
    greenLight: string;
    blue: string;
    blueLight: string;
    yellow: string;
    yellowLight: string;
    purple: string;
    purpleLight: string;
    transparent: string;
}

export interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    backgroundSecondary: string;
    card: string;
    cardElevated: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    border: string;
    borderLight: string;
    divider: string;
    error: string;
    errorLight: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
    modalOverlay: string;
    shadowColor: string;
    warningText: string;
    white: string;
    skeleton: string;
    skeletonHighlight: string;
    inputBackground: string;
    inputBorder: string;
    inputPlaceholder: string;
    buttonDisabled: string;
    buttonDisabledText: string;
    ripple: string;
    overlay: string;
    statusPreparing: string;
    statusReady: string;
    statusDelivered: string;
    statusCancelled: string;
    statusScheduled: string;
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
