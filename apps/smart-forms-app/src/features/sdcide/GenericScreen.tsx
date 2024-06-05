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

import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface SdcIdeScreenProps {
  screenTitle: string;
  children: ReactNode;
}

function GenericScreen(props: SdcIdeScreenProps) {
  const { screenTitle, children } = props;

  // const [editorString, setEditorString] = useState('');
  //
  // function handleEditorChange(value: string | undefined) {
  //   setEditorString(value ?? '');
  // }

  return (
    <Stack height="100%" width="100%" sx={{ overflow: 'auto', p: 0.5 }}>
      <Typography variant="subtitle1">{screenTitle}</Typography>
      {children}
      {/*<SdcIdeQuestionnairePicker />*/}
    </Stack>
  );
}

export default GenericScreen;
