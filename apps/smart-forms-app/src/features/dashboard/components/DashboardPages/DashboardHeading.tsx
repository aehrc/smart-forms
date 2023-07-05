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

import { Box, Stack, Typography } from '@mui/material';
import QuestionnaireSourceToggle from '../../../../components/Toggles/QuestionnaireSourceToggle.tsx';
import useConfigStore from '../../../../stores/useConfigStore.ts';

interface DashboardHeadingProps {
  headingText: string;
  setPage: (page: number) => void;
}
function DashboardHeading(props: DashboardHeadingProps) {
  const { headingText, setPage } = props;

  const debugMode = useConfigStore((state) => state.debugMode);

  return (
    <Stack direction="row" alignItems="center" mb={3}>
      <Typography variant="h3">{headingText}</Typography>
      <Box flexGrow={1} />
      {debugMode ? <QuestionnaireSourceToggle setPage={setPage} /> : null}
    </Stack>
  );
}

export default DashboardHeading;
