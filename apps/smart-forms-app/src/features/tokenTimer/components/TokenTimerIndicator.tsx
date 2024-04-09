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

import { Typography } from '@mui/material';
import { formatDisplayTime } from '../utils/formatDisplayTime.ts';
import useResponsive from '../../../hooks/useResponsive.ts';

interface TokenTimerIndicatorProps {
  showRemainingTime: boolean;
  timeLeft: number | null;
  isAutoSaving: boolean;
}

function TokenTimerIndicator(props: TokenTimerIndicatorProps) {
  const { showRemainingTime, timeLeft, isAutoSaving } = props;

  const isDesktop = useResponsive('up', 'lg');

  if (!showRemainingTime || timeLeft === null) {
    return null;
  }

  return (
    <Typography
      variant="subtitle2"
      color="text.secondary"
      fontSize={isDesktop ? 12 : 9}
      sx={{ mx: isDesktop ? 2 : 0.5 }}>
      {getIndicatorText(isAutoSaving, timeLeft)}
    </Typography>
  );
}

function getIndicatorText(isAutoSaving: boolean, timeLeft: number) {
  if (isAutoSaving) {
    return 'Autosaving...';
  }

  if (timeLeft <= 0) {
    return 'Session ended';
  }

  return formatDisplayTime(timeLeft);
}
export default TokenTimerIndicator;
