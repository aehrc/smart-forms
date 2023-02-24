export function pxToRem(value: number) {
  return `${value / 16}rem`;
}

export function responsiveFontSizes(props: { sm: number; md: number; lg: number }) {
  const { sm, md, lg } = props;
  return {
    '@media (min-width:600px)': {
      fontSize: pxToRem(sm)
    },
    '@media (min-width:900px)': {
      fontSize: pxToRem(md)
    },
    '@media (min-width:1200px)': {
      fontSize: pxToRem(lg)
    }
  };
}

// ----------------------------------------------------------------------

const typography = {
  fontFamily: 'Public Sans, sans-serif, Roboto, Arial, "Helvetica Neue", Helvetica',
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
  h1: {
    fontWeight: 800,
    lineHeight: 80 / 64,
    fontSize: pxToRem(36),
    ...responsiveFontSizes({ sm: 40, md: 48, lg: 54 })
  },
  h2: {
    fontWeight: 800,
    lineHeight: 64 / 48,
    fontSize: pxToRem(28),
    ...responsiveFontSizes({ sm: 32, md: 34, lg: 36 })
  },
  h3: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
    ...responsiveFontSizes({ sm: 22, md: 26, lg: 28 })
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    ...responsiveFontSizes({ sm: 18, md: 20, lg: 20 })
  },
  h5: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
    ...responsiveFontSizes({ sm: 15, md: 16, lg: 16 })
  },
  h6: {
    fontWeight: 700,
    lineHeight: 28 / 18,
    fontSize: pxToRem(13),
    ...responsiveFontSizes({ sm: 14, md: 14, lg: 14 })
  },
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.5,
    fontSize: pxToRem(12)
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 22 / 14,
    fontSize: pxToRem(11)
  },
  body1: {
    lineHeight: 1.5,
    fontSize: pxToRem(12)
  },
  body2: {
    lineHeight: 22 / 14,
    fontSize: pxToRem(11)
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(10)
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: pxToRem(10)
  },
  button: {
    fontWeight: 700,
    lineHeight: 24 / 14,
    fontSize: pxToRem(11)
  }
};

export default typography;
