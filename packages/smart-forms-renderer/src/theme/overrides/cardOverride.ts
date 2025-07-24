/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export function cardOverride(theme: Theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: `0 0 2px 0 ${alpha(grey[500], 0.2)}, 0 12px 24px -4px ${alpha(
            grey[500],
            0.16
          )}`,
          borderRadius: Number(theme.shape.borderRadius) * 2,
          position: 'relative',
          zIndex: 0 // Fix Safari overflow: hidden with border radius
        }
      }
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: 'h6' },
        subheaderTypographyProps: { variant: 'body2' }
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0)
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3)
        }
      }
    }
  };
}
