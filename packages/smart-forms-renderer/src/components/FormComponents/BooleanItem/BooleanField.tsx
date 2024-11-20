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
import Box from '@mui/material/Box';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem } from 'fhir/r4';
import ChoiceRadioSingle from '../ChoiceItems/ChoiceRadioSingle';
import { StyledRadioGroup } from '../Item.styles';
import { getChoiceOrientation } from '../../../utils/choice';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { isSpecificItemControl } from '../../../utils';
import ClearInputButton from '../ItemParts/ClearInputButton';
import { useRendererStylingStore } from '../../../stores';
import { findCalculatedExpressionsInExtensions } from '../../../utils/getExpressionsFromItem';

interface BooleanFieldProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  valueBoolean: boolean | undefined;
  calcExpUpdated: boolean;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

const BooleanField = memo(function BooleanField(props: BooleanFieldProps) {
  const { qItem, readOnly, valueBoolean, calcExpUpdated, onCheckedChange, onClear } = props;

  const hideClearButton = useRendererStylingStore.use.hideClearButton();
  const calculatedExpressionExist =
    findCalculatedExpressionsInExtensions(qItem.extension ?? []).length > 0;

  const booleanAsCheckbox = isSpecificItemControl(qItem, 'check-box');

  // defaults to horizontal, only set to vertical if explicitly set
  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Horizontal;

  const selection = valueBoolean === undefined ? null : valueBoolean.toString();

  return (
    <Box display="flex" alignItems="center">
      {booleanAsCheckbox ? (
        <FormControlLabel
          id={qItem.linkId}
          disabled={readOnly}
          control={
            <Checkbox
              size="small"
              checked={selection === 'true'}
              onChange={() => {
                if (selection === 'true') {
                  onCheckedChange('false');
                }

                if (selection === 'false' || selection === null) {
                  onCheckedChange('true');
                }
              }}
            />
          }
          label=""
        />
      ) : (
        <StyledRadioGroup
          id={qItem.linkId}
          row={orientation === ChoiceItemOrientation.Horizontal}
          name={qItem.text}
          onChange={(e) => onCheckedChange(e.target.value)}
          value={selection}>
          <ChoiceRadioSingle value="true" label="Yes" readOnly={readOnly} />
          <ChoiceRadioSingle value="false" label="No" readOnly={readOnly} />
        </StyledRadioGroup>
      )}

      <Box flexGrow={1} />
      {calculatedExpressionExist ? (
        <FadingCheckIcon fadeIn={calcExpUpdated} disabled={readOnly} />
      ) : null}
      {hideClearButton ? null : (
        <ClearInputButton
          buttonShown={valueBoolean !== undefined}
          readOnly={readOnly}
          onClear={onClear}
        />
      )}
    </Box>
  );
});

export default BooleanField;
