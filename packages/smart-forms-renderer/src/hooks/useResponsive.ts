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

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Props for the useResponsive() hook -  used to determine if the screen size matches a given breakpoint query.
 *
 * @param {'up' | 'down' | 'between' | 'only'} query - The type of query:
 *   - `'up'`: Matches screen sizes above and including `start`.
 *   - `'down'`: Matches screen sizes below and including `start`.
 *   - `'between'`: Matches screen sizes between `start` and `end` (inclusive).
 *   - `'only'`: Matches exactly the `start` size.
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} start - The starting breakpoint.
 * @param {'xs' | 'sm' | 'md' | 'lg' | 'xl'} end - The ending breakpoint (required if `query` is `'between'`).
 *
 * @example
 * // Check if the screen size is at least 'md' (medium)
 * const isMdUp = useResponsive({ query: 'up', start: 'md' });
 *
 * @example
 * // Check if the screen size is exactly 'lg' (large)
 * const isLgOnly = useResponsive({ query: 'only', start: 'lg' });
 *
 **/
export interface UseResponsiveProps {
  query: 'up' | 'down' | 'between' | 'only';
  start: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  end?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * A hook to determine if the screen size matches a given breakpoint query.
 *
 * @param props - The responsive query options.
 *
 * @returns {boolean} `true` if the current screen size matches the query, otherwise `false`.
 *
 * @example
 * // Check if the screen size is at least 'md' (medium)
 * const isMdUp = useResponsive({ query: 'up', start: 'md' });
 *
 * @example
 * // Check if the screen size is exactly 'lg' (large)
 * const isLgOnly = useResponsive({ query: 'only', start: 'lg' });
 */
function useResponsive(props: UseResponsiveProps): boolean {
  const { query, start, end = 'xl' } = props;

  const theme = useTheme();

  const mediaUp = useMediaQuery(theme.breakpoints.up(start));

  const mediaDown = useMediaQuery(theme.breakpoints.down(start));

  const mediaBetween = useMediaQuery(theme.breakpoints.between(start, end));

  const mediaOnly = useMediaQuery(theme.breakpoints.only(start));

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  return mediaOnly;
}

export default useResponsive;
