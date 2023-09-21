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

import { Grid, Typography } from '@mui/material';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { GroupTable } from '@aehrc/smart-forms-renderer';

interface RepopulateRepeatGroupProps {
  qItem: QuestionnaireItem;
  oldQRItem?: QuestionnaireResponseItem;
  newQRItem: QuestionnaireResponseItem;
}

function RepopulateGroupTable(props: RepopulateRepeatGroupProps) {
  const { qItem, oldQRItem, newQRItem } = props;

  if (!newQRItem.item) {
    return null;
  }

  return (
    <Grid container columnSpacing={2} mt={0.25}>
      <Grid item xs={12}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          Old answer
        </Typography>
        <GroupTable
          qItem={qItem}
          qrItems={oldQRItem ? [oldQRItem] : []}
          groupCardElevation={1}
          onQrRepeatGroupChange={() => void 0}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          New answer
        </Typography>
        <GroupTable
          qItem={qItem}
          qrItems={[newQRItem]}
          groupCardElevation={1}
          onQrRepeatGroupChange={() => void 0}
        />
      </Grid>
    </Grid>
  );
}

export default RepopulateGroupTable;
