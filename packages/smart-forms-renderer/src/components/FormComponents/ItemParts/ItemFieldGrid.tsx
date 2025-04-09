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

import type { ReactNode } from 'react';
import React from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { useRendererStylingStore } from '../../../stores';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import Grid from '@mui/material/Grid2';

interface ItemFieldGridProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  labelChildren?: ReactNode;
  fieldChildren?: ReactNode;
  feedback?: string;
  dateFeedback?: string;
  timeFeedback?: string;
}

function ItemFieldGrid(props: ItemFieldGridProps) {
  const { qItem, readOnly, labelChildren, fieldChildren } = props;

  const itemResponsive = useRendererStylingStore.use.itemResponsive();
  const { labelBreakpoints, fieldBreakpoints, columnGapPixels, rowGapPixels } = itemResponsive;

  const { displayInstructions } = useRenderingExtensions(qItem);

  return (
    <Grid container columnSpacing={columnGapPixels + 'px'} rowGap={rowGapPixels + 'px'}>
      <Grid size={{ ...labelBreakpoints }}>{labelChildren}</Grid>
      <Grid size={{ ...fieldBreakpoints }}>
        {fieldChildren}
        {/* Only show display instructions if there is no feedback of any type */}
        {!props.feedback && !props.dateFeedback && !props.timeFeedback && (
          <DisplayInstructions readOnly={readOnly}>{displayInstructions}</DisplayInstructions>
        )}
      </Grid>
    </Grid>
  );
}

export default ItemFieldGrid;
