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

import React, { memo } from 'react';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem } from 'fhir/r4';
import ChoiceRadioSingle from '../ChoiceItems/ChoiceRadioSingle';
import { StyledRadioGroup } from '../Item.styles';
import { getChoiceOrientation } from '../../../utils/choice';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';

interface BooleanFieldProps extends PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  valueBoolean: boolean | undefined;
  calcExpUpdated: boolean;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

const BooleanField = memo(function BooleanField(props: BooleanFieldProps) {
  const { qItem, readOnly, valueBoolean, calcExpUpdated, isTabled, onCheckedChange, onClear } =
    props;

  // defaults to horizontal, only set to vertical if explicitly set
  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Horizontal;

  const selection = valueBoolean === undefined ? null : valueBoolean.toString();

  return (
    <Box display="flex" alignItems="center">
      <StyledRadioGroup
        row={orientation === ChoiceItemOrientation.Horizontal}
        name={qItem.text}
        id={qItem.id}
        onChange={(e) => onCheckedChange(e.target.value)}
        value={selection}>
        <ChoiceRadioSingle value="true" label="Yes" readOnly={readOnly} />
        <ChoiceRadioSingle value="false" label="No" readOnly={readOnly} />
      </StyledRadioGroup>

      <Box flexGrow={1} />

      <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
      <Fade in={valueBoolean !== undefined} timeout={100}>
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
    </Box>
  );
});

export default BooleanField;
