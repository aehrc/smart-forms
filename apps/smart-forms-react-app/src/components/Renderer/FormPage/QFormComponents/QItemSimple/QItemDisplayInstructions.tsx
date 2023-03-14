/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import React from 'react';
import { Box, Typography } from '@mui/material';
import type { QuestionnaireItem } from 'fhir/r5';
import { getTextDisplayInstructions } from '../../../../../functions/QItemFunctions';

interface Props {
  qItem: QuestionnaireItem;
}

function QItemDisplayInstructions(props: Props) {
  const { qItem } = props;

  const displayInstructions = getTextDisplayInstructions(qItem);

  const renderQItemDisplayInstructions = displayInstructions ? (
    <Box sx={{ color: 'text.secondary', textTransform: 'capitalize', mb: 1 }}>
      <Typography variant="caption" fontSize={10.5}>
        {displayInstructions}
      </Typography>
    </Box>
  ) : null;

  return <>{renderQItemDisplayInstructions}</>;
}

export default QItemDisplayInstructions;
