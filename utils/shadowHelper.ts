/**
 * Utility to convert deprecated React Native shadow properties to modern boxShadow
 * 
 * @deprecated Use boxShadow instead of individual shadow properties
 */

export interface ShadowProps {
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

export interface BoxShadowProps {
  boxShadow?: string;
}

/**
 * Convert deprecated shadow props to modern boxShadow
 * @param shadowProps - Object containing deprecated shadow properties
 * @returns Object with boxShadow property
 */
export const convertShadowToBoxShadow = (shadowProps: ShadowProps): BoxShadowProps => {
  const {
    shadowColor = '#000000',
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity = 0.1,
    shadowRadius = 4,
  } = shadowProps;

  // Convert shadowColor with opacity to rgba if needed
  let color = shadowColor;
  if (shadowColor.startsWith('#') && shadowOpacity < 1) {
    // Convert hex to rgba with opacity
    const hex = shadowColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    color = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
  }

  // Create CSS boxShadow string
  const boxShadow = `${shadowOffset.width}px ${shadowOffset.height}px ${shadowRadius}px ${color}`;

  return { boxShadow };
};

/**
 * Common shadow presets using modern boxShadow
 */
export const shadowPresets = {
  small: {
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  medium: {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
  large: {
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.15)',
  },
  card: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  elevated: {
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  },
};