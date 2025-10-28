/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
import RadioGroup from '@mui/material/RadioGroup';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem } from 'fhir/r4';
import ChoiceRadioSingle from '../ChoiceItems/ChoiceRadioSingle';
import { StyledFeedbackTypography } from '../Item.styles';
import { getChoiceOrientation } from '../../../utils/choice';
import ExpressionUpdateFadingIcon from '../ItemParts/ExpressionUpdateFadingIcon';
import FormControlLabel from '@mui/material/FormControlLabel';
import { isSpecificItemControl } from '../../../utils';
import ClearInputButton from '../ItemParts/ClearInputButton';
import { useRendererConfigStore } from '../../../stores';
import { StandardCheckbox } from '../../Checkbox.styles';
import { ariaCheckedMap } from '../../../utils/checkbox';
import { SrOnly } from '../SrOnly.styles';
import AccessibleFeedback from '../ItemParts/AccessibleFeedback';

interface BooleanFieldProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  valueBoolean: boolean | undefined;
  feedback: string;
  calcExpUpdated: boolean;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

const BooleanField = memo(function BooleanField(props: BooleanFieldProps) {
  const { qItem, readOnly, valueBoolean, feedback, calcExpUpdated, onCheckedChange, onClear } =
    props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const inputsFlexGrow = useRendererConfigStore.use.inputsFlexGrow();
  const reverseBooleanYesNo = useRendererConfigStore.use.reverseBooleanYesNo();

  const booleanAsCheckbox = isSpecificItemControl(qItem, 'check-box');

  // defaults to horizontal, only set to vertical if explicitly set
  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Horizontal;

  const selection = valueBoolean === undefined ? null : valueBoolean.toString();

  const ariaCheckedValue = ariaCheckedMap.get(selection ?? 'false');

  const feedbackId = `${qItem.type}-${qItem.linkId}-feedback`;

  return (
    <>
      <Box
        display="flex"
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
        {booleanAsCheckbox ? (
          <FormControlLabel
            disabled={readOnly && readOnlyVisualStyle === 'disabled'}
            control={
              <StandardCheckbox
                id={qItem.type + '-' + qItem.linkId}
                size="small"
                checked={selection === 'true'}
                readOnly={readOnly && readOnlyVisualStyle === 'readonly'}
                aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
                aria-describedby={feedback ? feedbackId : undefined}
                role="checkbox"
                aria-checked={ariaCheckedValue}
                onChange={() => {
                  // If item.readOnly=true, do not allow any changes
                  if (readOnly) {
                    return;
                  }

                  if (selection === 'true') {
                    onCheckedChange('false');
                  }

                  if (selection === 'false' || selection === null) {
                    onCheckedChange('true');
                  }
                }}
              />
            }
            label={<SrOnly>{qItem.text}</SrOnly>}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}>
            <RadioGroup
              id={qItem.type + '-' + qItem.linkId}
              aria-labelledby={'label-' + qItem.linkId}
              row={orientation === ChoiceItemOrientation.Horizontal}
              sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}
              aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
              aria-describedby={feedback ? feedbackId : undefined}
              onChange={(e) => {
                // If item.readOnly=true, do not allow any changes
                if (readOnly) {
                  return;
                }

                onCheckedChange(e.target.value);
              }}
              value={selection}>
              {reverseBooleanYesNo ? (
                <>
                  <ChoiceRadioSingle
                    value="false"
                    label="No"
                    readOnly={readOnly}
                    disabledViaToggleExpression={false}
                    fullWidth={inputsFlexGrow}
                  />
                  <ChoiceRadioSingle
                    value="true"
                    label="Yes"
                    readOnly={readOnly}
                    disabledViaToggleExpression={false}
                    fullWidth={inputsFlexGrow}
                  />
                </>
              ) : (
                <>
                  <ChoiceRadioSingle
                    value="true"
                    label="Yes"
                    readOnly={readOnly}
                    disabledViaToggleExpression={false}
                    fullWidth={inputsFlexGrow}
                  />
                  <ChoiceRadioSingle
                    value="false"
                    label="No"
                    readOnly={readOnly}
                    disabledViaToggleExpression={false}
                    fullWidth={inputsFlexGrow}
                  />
                </>
              )}
            </RadioGroup>

            <Box flexGrow={1} />

            <ExpressionUpdateFadingIcon fadeIn={calcExpUpdated} disabled={readOnly} />
          </Box>
        )}

        <ClearInputButton
          buttonShown={valueBoolean !== undefined}
          readOnly={readOnly}
          onClear={onClear}
        />
      </Box>

      {feedback ? (
        <AccessibleFeedback id={feedbackId}>
          <StyledFeedbackTypography>{feedback}</StyledFeedbackTypography>
        </AccessibleFeedback>
      ) : null}
    </>
  );
});

export default BooleanField;
