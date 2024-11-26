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
import Grid from '@mui/material/Unstable_Grid2';
import type { QuestionnaireItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import Box from '@mui/material/Box';
import { useRendererStylingStore } from '../../../stores';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';

interface ItemFieldGridProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  labelChildren?: ReactNode;
  fieldChildren?: ReactNode;
}

function ItemFieldGrid(props: ItemFieldGridProps) {
  const { qItem, readOnly, labelChildren, fieldChildren } = props;

  const itemLabelGridBreakpoints = useRendererStylingStore.use.itemLabelGridBreakpoints();
  const itemFieldGridBreakpoints = useRendererStylingStore.use.itemFieldGridBreakpoints();

  const { displayInstructions } = useRenderingExtensions(qItem);

  return (
    <Grid container columnSpacing={4}>
      <Grid
        xs={itemLabelGridBreakpoints.xs}
        sm={itemLabelGridBreakpoints.sm}
        md={itemLabelGridBreakpoints.md}
        lg={itemLabelGridBreakpoints.lg}
        xl={itemLabelGridBreakpoints.xl}>
        {labelChildren}
      </Grid>
      <Box
        sx={{
          my: { xs: 1.5, md: 0 } // Adds padding for `xs` breakpoint and removes it for `md` and up
        }}
      />
      <Grid
        xs={itemFieldGridBreakpoints.xs}
        sm={itemFieldGridBreakpoints.sm}
        md={itemFieldGridBreakpoints.md}
        lg={itemFieldGridBreakpoints.lg}
        xl={itemFieldGridBreakpoints.xl}>
        {fieldChildren}
        <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
      </Grid>
    </Grid>
  );
}

export default ItemFieldGrid;
