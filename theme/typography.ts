import { Typography } from './types';

export const typography: Typography = {
    fontFamily: {
        regular: 'Poppins-Regular',
        medium: 'Poppins-Medium',
        semiBold: 'Poppins-SemiBold',
        bold: 'Poppins-Bold',
    },
    size: {
        xs: 10,
        s: 12,
        m: 14,
        l: 16,
        xl: 18,
        xxl: 22,
        xxxl: 28,
    },
    weight: {
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
    },
};

export const fontStyles = {
    h1: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.size.xxxl,
        fontWeight: typography.weight.bold as '700',
        lineHeight: 36,
    },
    h2: {
        fontFamily: typography.fontFamily.bold,
        fontSize: typography.size.xxl,
        fontWeight: typography.weight.bold as '700',
        lineHeight: 30,
    },
    h3: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.size.xl,
        fontWeight: typography.weight.semiBold as '600',
        lineHeight: 26,
    },
    h4: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.size.l,
        fontWeight: typography.weight.semiBold as '600',
        lineHeight: 24,
    },
    body: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.size.m,
        fontWeight: typography.weight.regular as '400',
        lineHeight: 22,
    },
    bodyMedium: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.size.m,
        fontWeight: typography.weight.medium as '500',
        lineHeight: 22,
    },
    caption: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.size.s,
        fontWeight: typography.weight.regular as '400',
        lineHeight: 18,
    },
    captionMedium: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.size.s,
        fontWeight: typography.weight.medium as '500',
        lineHeight: 18,
    },
    small: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.regular as '400',
        lineHeight: 14,
    },
    button: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.size.m,
        fontWeight: typography.weight.semiBold as '600',
        lineHeight: 20,
    },
    buttonSmall: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.size.s,
        fontWeight: typography.weight.semiBold as '600',
        lineHeight: 16,
    },
    label: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.size.s,
        fontWeight: typography.weight.medium as '500',
        lineHeight: 16,
        letterSpacing: 0.5,
    },
};
