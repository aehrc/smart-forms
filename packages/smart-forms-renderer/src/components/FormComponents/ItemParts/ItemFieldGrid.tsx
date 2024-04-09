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
import Grid from '@mui/material/Grid';
import type { QuestionnaireItem } from 'fhir/r4';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import LabelWrapper from './ItemLabelWrapper';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';

interface ItemFieldGridProps {
  children: ReactNode;
  qItem: QuestionnaireItem;
  readOnly: boolean;
}

function ItemFieldGrid(props: ItemFieldGridProps) {
  const { children, qItem, readOnly } = props;

  const { displayInstructions } = useRenderingExtensions(qItem);

  return (
    <Grid container columnSpacing={6}>
      <Grid item xs={5}>
        <LabelWrapper qItem={qItem} readOnly={readOnly} />
      </Grid>
      <Grid item xs={7}>
        {children}
        <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
      </Grid>
    </Grid>
  );
}

export default ItemFieldGrid;
