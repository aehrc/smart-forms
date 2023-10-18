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

import { Box, Card, Container, Fade } from '@mui/material';
import { Helmet } from 'react-helmet';
import PageHeading from '../PageHeading.tsx';
import QuestionnaireTable from './QuestionnaireTable.tsx';
import DatePickerAutocompleteField from '../../../../customDateTimePicker/DatePickerAutocompleteField.tsx';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
import { getSelectedDateFormat } from '../../../../customDateTimePicker/lib/parseDates.ts';

function QuestionnairesPage() {
  const [date, setDate] = useState<string>('');

  const dateToDisplay = date.length === 0 ? 'N/A' : date;

  return (
    <>
      <Helmet>
        <title>Questionnaires</title>
      </Helmet>
      <Fade in={true}>
        <Container data-test="dashboard-questionnaires-container">
          <PageHeading>Questionnaires</PageHeading>

          <Card>
            <QuestionnaireTable />
          </Card>
          <Box display="flex" mt={3}>
            <Box>
              <DatePickerAutocompleteField
                value={date}
                onValueChange={(newValue) => {
                  setDate(newValue);
                }}
              />
              <Box>
                <Typography variant="caption" fontSize={10.5}>
                  Selected date: <b>{dateToDisplay}</b>
                </Typography>
                <Typography fontSize={10.5}>
                  Format: <b>{getSelectedDateFormat(date)}</b>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Fade>
    </>
  );
}

export default QuestionnairesPage;
