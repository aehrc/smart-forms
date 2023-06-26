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

import type { ChangeEvent } from 'react';
import { memo, useCallback, useContext, useEffect, useState } from 'react';
import { Fade, Grid, InputAdornment, TextField } from '@mui/material';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../../../features/renderer/utils/qrItem.ts';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { FullWidthFormComponentBox } from '../../../../StyledComponents/Boxes.styles';
import debounce from 'lodash.debounce';
import { CalculatedExpressionContext } from '../../../../../features/calculatedExpression/contexts/CalculatedExpressionContext.tsx';
import CheckIcon from '@mui/icons-material/Check';
import useRenderingExtensions from '../../../../../features/renderer/hooks/useRenderingExtensions.ts';
import useValidationError from '../../../../../features/renderer/hooks/useValidationError.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../features/renderer/types/renderProps.interface.ts';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemText(props: Props) {
  const { qItem, qrItem, isRepeated, onQrItemChange } = props;

  // Get additional rendering extensions
  const {
    displayUnit,
    displayPrompt,
    displayInstructions,
    readOnly,
    entryFormat,
    regexValidation,
    maxLength
  } = useRenderingExtensions(qItem);

  // Init input value
  let valueText = '';
  if (qrItem && qrItem.answer && qrItem.answer.length && qrItem.answer[0].valueString) {
    valueText = qrItem.answer[0].valueString;
  }
  const [input, setInput] = useState(valueText);

  // Perform validation checks
  const [focused, setFocused] = useState(false);
  const { feedback } = useValidationError(input, focused, regexValidation, maxLength);

  // Update input value if calculated expression changes
  const { calculatedExpressions } = useContext(CalculatedExpressionContext);
  const [calExpIsCalculating, setCalExpIsCalculating] = useState(false);

  useEffect(
    () => {
      const calcExpression = calculatedExpressions[qItem.linkId];

      // only update if calculated value is different from current value
      if (calcExpression?.value !== input && typeof calcExpression?.value === 'string') {
        // update ui to show calculated value changes
        setCalExpIsCalculating(true);
        setTimeout(() => {
          setCalExpIsCalculating(false);
        }, 500);

        // update questionnaireResponse
        setInput(calcExpression.value);
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueString: calcExpression.value }]
        });
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const newInput = event.target.value;
    setInput(newInput);
    updateQrItemWithDebounce(newInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      if (input !== '') {
        onQrItemChange({ ...createEmptyQrItem(qItem), answer: [{ valueString: input.trim() }] });
      } else {
        onQrItemChange(createEmptyQrItem(qItem));
      }
    }, 200),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const textInput = (
    <TextField
      id={qItem.linkId}
      value={input}
      error={!!feedback}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={handleChange}
      disabled={readOnly}
      label={displayPrompt}
      placeholder={entryFormat}
      fullWidth
      multiline
      minRows={3}
      InputProps={{
        endAdornment: (
          <InputAdornment position={'end'}>
            <Fade in={calExpIsCalculating} timeout={{ enter: 100, exit: 300 }}>
              <CheckIcon color="success" fontSize="small" />
            </Fade>
            {displayUnit}
          </InputAdornment>
        )
      }}
      helperText={feedback}
      data-test="q-item-text-field"
    />
  );

  const renderQItemText = isRepeated ? (
    <>{textInput}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-text-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {textInput}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemText}</>;
}

export default memo(QItemText);
