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
import { RepeatItem } from '@aehrc/smart-forms-renderer';

interface RepopulateRepeatItemProps {
  qItem: QuestionnaireItem;
  oldQRItem?: QuestionnaireResponseItem;
  newQRItem: QuestionnaireResponseItem;
}

function RepopulateRepeatItem(props: RepopulateRepeatItemProps) {
  const { qItem, oldQRItem, newQRItem } = props;

  return (
    <Grid container columnSpacing={2} mt={0.25}>
      <Grid item xs={12} md={6}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          Old answers
        </Typography>
        <RepeatItem
          qItem={qItem}
          qrItem={
            oldQRItem ?? {
              linkId: qItem.linkId,
              text: qItem.text
            }
          }
          groupCardElevation={1}
          showMinimalView={true}
          onQrItemChange={() => void 0}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography color="text.secondary" variant="overline" fontSize={7.5}>
          New answers
        </Typography>
        <RepeatItem
          qItem={qItem}
          qrItem={newQRItem}
          groupCardElevation={1}
          showMinimalView={true}
          onQrItemChange={() => void 0}
        />
      </Grid>
    </Grid>
  );
}

export default RepopulateRepeatItem;
