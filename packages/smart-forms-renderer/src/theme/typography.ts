/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { TypographyOptions } from '@mui/material/styles/createTypography';
import type { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  // noinspection JSUnusedGlobalSymbols
  interface TypographyVariants {
    label: CSSProperties;
    groupHeading: CSSProperties;
  }

  // noinspection JSUnusedGlobalSymbols
  interface TypographyVariantsOptions {
    label?: CSSProperties;
    groupHeading?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  // noinspection JSUnusedGlobalSymbols
  interface TypographyPropsVariantOverrides {
    label: true;
    groupHeading: true;
  }
}

// ----------------------------------------------------------------------

const typography: TypographyOptions = {
  fontFamily: ['Inter', 'sans-serif', 'Helvetica', 'Arial', 'Roboto', '"Helvetica Neue"'].join(','),
  h1: {
    fontSize: '2rem', // 32px
    fontWeight: 700,
    lineHeight: '40px'
  },
  h2: {
    fontSize: '1.75rem', // 28px
    fontWeight: 600,
    lineHeight: '34px'
  },
  h3: {
    fontSize: '1.625rem', // 26px
    fontWeight: 600,
    lineHeight: '32px'
  },
  h4: {
    fontSize: '1.5rem', // 24px
    fontWeight: 700,
    lineHeight: '30px'
  },
  h5: {
    fontSize: '1.375rem', // 22px
    fontWeight: 700,
    lineHeight: '28px'
  },
  h6: {
    fontSize: '1.125rem', // 18px
    fontWeight: 700,
    lineHeight: '24px'
  },
  subtitle1: {
    fontSize: '1rem', // 16px
    fontWeight: 600,
    lineHeight: '20px'
  },
  subtitle2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 600,
    lineHeight: '18px'
  },
  body1: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: '20px'
  },
  body2: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: '18px'
  },
  groupHeading: {
    fontSize: '0.875rem', // 14px
    fontWeight: 600,
    lineHeight: '20px'
  },
  label: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: '20px'
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 500,
    lineHeight: '18px'
  },
  overline: {
    fontSize: '0.8125rem', // 13px
    fontWeight: 700,
    lineHeight: '20px'
  },
  button: {
    fontSize: '0.8125rem', // 13px
    fontWeight: 700,
    lineHeight: '20px'
  }
};

export default typography;
