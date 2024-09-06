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

import { useEffect, useState } from 'react';
import { Fade, Typography } from '@mui/material';
import useResponsive from '../../../../hooks/useResponsive.ts';
import { useQuestionnaireResponseStore } from '@aehrc/smart-forms-renderer';

function UpdatingIndicator() {
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  const [isUpdating, setIsUpdating] = useState(false);

  const isDesktop = useResponsive('up', 'lg');

  useEffect(() => {
    setIsUpdating(true);
    const timeoutId = setTimeout(() => {
      setIsUpdating(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [updatableResponse]);

  return (
    <Fade in={isUpdating} timeout={100}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontSize={isDesktop ? 12 : 9}
        sx={{ mx: isDesktop ? 2 : 0.5 }}
        data-test="updating-indicator">
        Updating...
      </Typography>
    </Fade>
  );
}

export default UpdatingIndicator;
