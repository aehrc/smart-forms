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

import { Grid, Typography } from '@mui/material';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { GridGroup } from '@aehrc/smart-forms-renderer';

interface RepopulateGridGroupProps {
  qItem: QuestionnaireItem;
  newQRItem?: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
}

function RepopulateGridGroup(props: RepopulateGridGroupProps) {
  const { qItem, newQRItem, oldQRItem } = props;

  // Create a duplicate old QR item with all answers removed if its undefined
  const oldQRItemWithRowsToRepopulate: QuestionnaireResponseItem =
    oldQRItem ??
    structuredClone({
      ...newQRItem,
      linkId: newQRItem?.linkId ?? '',
      item: newQRItem?.item?.map((item) => ({
        ...item,
        item: item.item?.map((subItem) => ({
          ...subItem,
          answer: undefined
        }))
      }))
    });

  return (
    <Grid container rowGap={2} mt={0.25}>
      <Grid item xs={12}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          Old answer
        </Typography>
        <GridGroup
          qItem={qItem}
          qrItem={oldQRItemWithRowsToRepopulate}
          groupCardElevation={1}
          showMinimalView={true}
          parentIsReadOnly={true}
          onQrItemChange={() => void 0}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          New answer
        </Typography>
        <GridGroup
          qItem={qItem}
          qrItem={
            newQRItem ?? {
              linkId: qItem.linkId,
              text: qItem.text
            }
          }
          groupCardElevation={1}
          showMinimalView={true}
          parentIsReadOnly={true}
          onQrItemChange={() => void 0}
        />
      </Grid>
    </Grid>
  );
}

export default RepopulateGridGroup;
