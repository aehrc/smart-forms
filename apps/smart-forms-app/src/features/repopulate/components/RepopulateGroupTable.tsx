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
import { GroupTable } from '@aehrc/smart-forms-renderer';

interface RepopulateRepeatGroupProps {
  qItem: QuestionnaireItem;
  newQRItems?: QuestionnaireResponseItem[];
  oldQRItems?: QuestionnaireResponseItem[];
}

function RepopulateGroupTable(props: RepopulateRepeatGroupProps) {
  const { qItem, newQRItems, oldQRItems } = props;

  return (
    <Grid container rowGap={2} mt={0.25}>
      <Grid size={{ xs: 12 }}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          Old answer
        </Typography>
        <GroupTable
          qItem={qItem}
          qrItems={oldQRItems ?? []}
          itemPath={[]}
          groupCardElevation={1}
          isRepeated={true}
          showMinimalView={true}
          parentIsReadOnly={true}
          onQrRepeatGroupChange={() => void 0}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          New answer
        </Typography>
        <GroupTable
          qItem={qItem}
          qrItems={newQRItems ?? []}
          itemPath={[]}
          groupCardElevation={1}
          isRepeated={true}
          showMinimalView={true}
          parentIsReadOnly={true}
          onQrRepeatGroupChange={() => void 0}
        />
      </Grid>
    </Grid>
  );
}

export default RepopulateGroupTable;
