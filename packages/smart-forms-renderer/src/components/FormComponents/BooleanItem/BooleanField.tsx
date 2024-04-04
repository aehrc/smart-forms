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

import React, { memo } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { TEXT_FIELD_WIDTH } from '../Textfield.styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';

interface BooleanFieldProps extends PropsWithIsTabledAttribute {
  checked: boolean;
  readOnly: boolean;
  valueBoolean: boolean | undefined;
  onCheckedChange: (newChecked: boolean) => void;
  onClear: () => void;
}
const BooleanField = memo(function BooleanField(props: BooleanFieldProps) {
  const { checked, readOnly, valueBoolean, isTabled, onCheckedChange, onClear } = props;

  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ maxWidth: !isTabled ? TEXT_FIELD_WIDTH : 3000, minWidth: 160 }}>
      <FormControlLabel
        disabled={readOnly}
        control={
          <Checkbox
            size="small"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
          />
        }
        label=""
      />
      <Box flexGrow={1} />

      <Fade in={valueBoolean !== undefined} timeout={100}>
        <Tooltip title="Set question as unanswered">
          <Button
            sx={{
              color: grey['500'],
              '&:hover': { backgroundColor: grey['200'] }
            }}
            onClick={onClear}>
            Clear
          </Button>
        </Tooltip>
      </Fade>
    </Box>
  );
});

export default BooleanField;
