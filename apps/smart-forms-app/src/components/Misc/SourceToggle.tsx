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

import { FormControlLabel, Switch, Typography } from '@mui/material';
import { useContext } from 'react';
import { SourceContext } from '../../features/debug/contexts/SourceContext.tsx';
import { SelectedQuestionnaireContext } from '../../features/dashboard/contexts/SelectedQuestionnaireContext.tsx';

interface Props {
  setPage: (page: number) => void;
}
function SourceToggle(props: Props) {
  const { setPage } = props;
  const { source, setSource } = useContext(SourceContext);
  const { clearSelectedQuestionnaire } = useContext(SelectedQuestionnaireContext);

  return (
    <FormControlLabel
      control={
        <Switch
          checked={source === 'remote'}
          onChange={() => {
            setSource(source === 'local' ? 'remote' : 'local');
            clearSelectedQuestionnaire();
            setPage(0);
          }}
        />
      }
      label={
        <Typography variant="subtitle2" textTransform="capitalize">
          {source}
        </Typography>
      }
    />
  );
}

export default SourceToggle;
