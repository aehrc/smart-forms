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

import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';

interface ClearInputButtonProps {
  buttonShown: boolean;
  readOnly: boolean;
  onClear: () => void;
}

function ClearInputButton(props: ClearInputButtonProps) {
  const { buttonShown, readOnly, onClear } = props;

  return (
    <Fade in={buttonShown} timeout={100}>
      <Tooltip title="Set question as unanswered">
        <span>
          <Button
            sx={{
              color: grey['500'],
              '&:hover': { backgroundColor: grey['200'] }
            }}
            disabled={readOnly}
            onClick={onClear}>
            Clear
          </Button>
        </span>
      </Tooltip>
    </Fade>
  );
}

export default ClearInputButton;