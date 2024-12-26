const COLORS = {
    'neutral-1200': '#000',
    'neutral-1000': '#2a2a2a',
    'neutral-900': '#787878',
    'neutral-800': '#aaa',
    'neutral-700': '#a2a2a2',
    'neutral-600': '#d5d5d5',
    'neutral-500': '#e2e2e2',
    'neutral-400': '#efefef',
    'neutral-300': '#fbfbfb',
    'neutral-200': '#f9f9f9',
    'neutral-100': '#fff',
    'info-1100': '#643900',
    'info-1000': '#a25a00',
    'info-900': '#d77904',
    'info-700': '#ef9526',
    'info-500': '#f7c991',
    'info-300': '#fef7ef',
    'accent-1100': '#0b2e40',
    'accent-1000': '#024263',
    'accent-900': '#066da4',
    'accent-800': '#0979b6',
    'accent-700': '#3fbfff',
    'secondary-1000': '#007066',
    'secondary-900': '#e53012',
    'secondary-700': '#f04031',
    'secondary-400': '#bfebeb',
    'secondary-300': '#ecf9f8',
    'primary-1100': '#c2280f',
    'primary-1000': '#bf3313',
    'primary-900': '#e03012',
    'primary-700': '#ef4b23',
    'primary-400': '#ff653f',
    'primary-300': '#ffe8e2',
    'misc-500': '#21222e',
    'misc-400': '#002b51',
    'misc-300': '#65818f',
    'misc-200': '#23efab',
};

const BACKGROUND_COLORS = {
    'neutral-1200': '#000',
    'neutral-1000': '#2a2a2a',
    'neutral-900': '#787878',
    'neutral-800': '#aaa',
    'neutral-700': '#a2a2a2',
    'neutral-600': '#d5d5d5',
    'neutral-500': '#e2e2e2',
    'neutral-400': '#efefef',
    'neutral-300': '#fbfbfb',
    'neutral-200': '#f9f9f9',
    'neutral-100': '#fff',
    'info-1100': '#643900',
    'info-1000': '#a25a00',
    'info-700': '#ef9526',
    'info-500': '#f7c991',
    'info-300': '#fef7ef',
    'accent-1100': '#0b2e40',
    'accent-1000': '#024263',
    'accent-900': '#066da4',
    'accent-800': '#0979b6',
    'secondary-1000': '#007066',
    'secondary-900': '#e53012',
    'secondary-700': '#f04031',
    'primary-1100': '#c2280f',
    'primary-1000': '#bf3313',
    'primary-900': '#e03012',
    'primary-700': '#ef4b23',
    'misc-500': '#21222e',
    'misc-400': '#002b51',
    'misc-300': '#65818f',
    'misc-100': 'transparent',
};

const FONT_SIZE = {
    0: 0,
    4.5: 9,
    5: 10,
    5.5: 11,
    6: 12,
    6.5: 13,
    7.5: 15,
    8: 16,
    9: 18,
    10: 20,
    11: 22,
    13: 26,
};

const SIZE = {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    72: 288,
    auto: 'auto',
    half: '50%',
    full: '100%',
};

const SPACE = {
    0: 0,
    0.5: 2,
    1: 4,
    1.5: 6,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
};

const RADII = {
    0: 0,
    2: 2,
    3: 3,
    4: 4,
    6: 6,
    10: 10,
    12: 12,
    half: '50%',
    full: '100%',
    pill: 9999,
};

const BORDER_WIDTHS = {
    0: 0,
    1: 1,
    2: 2,
    4: 4,
};

const BORDER_COLORS = {
    'neutral-1000': '#2a2a2a',
    'neutral-900': '#787878',
    'neutral-800': '#aaa',
    'neutral-700': '#a2a2a2',
    'neutral-600': '#d5d5d5',
    'neutral-500': '#e2e2e2',
    'neutral-400': '#efefef',
    'neutral-100': '#fff',
    'info-900': '#d77904',
    'info-700': '#ef9526',
    'accent-800': '#0979b6',
    'accent-700': '#3fbfff',
    'secondary-900': '#e53012',
    'primary-900': '#e03012',
    'primary-400': '#ff653f',
    'misc-400': '#002b51',
    'misc-300': '#65818f',
    'misc-100': '#00000001',
};

const FONT_WEIGHT = {
    regular: '400',
    semiBold: '600',
    bold: '700',
};

const COORDINATES = {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    half: '50%',
    full: '100%,',
};

const LINE_HEIGHT = {
    standard: 1.2,
    paragraph: 1.51,
};

const FONT_FAMILY = {
    regular: 'Lato-Regular',
    semiBold: 'Lato-Semibold',
    bold: 'Lato-Bold',
};

const TEXT_TRANSFORM = {
    lowercase: 'lowercase',
    uppercase: 'uppercase',
    capitalize: 'capitalize',
    none: 'none',
};

// misc
const OPACITIES = {
    0: 0,
    10: 0.1,
    30: 0.3,
    50: 0.5,
    75: 0.75,
    100: 1,
};

const Z_INDICES = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    8: 8,
    10: 10,
};

// ----- Theme -----

const theme = {
    color: COLORS,
    backgroundColor: BACKGROUND_COLORS,
    borderRadius: RADII,
    borderWidth: BORDER_WIDTHS,
    borderColor: BORDER_COLORS,
    coordinates: COORDINATES,
    fontSize: FONT_SIZE,
    fontWeight: FONT_WEIGHT,
    fontFamily: FONT_FAMILY,
    opacity: OPACITIES,
    size: SIZE,
    textTransform: TEXT_TRANSFORM,
    space: SPACE,
    lineHeight: LINE_HEIGHT,
    zIndex: Z_INDICES,
};

export default theme;
