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
import { Fade, Grid, InputAdornment } from '@mui/material';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItemWithUnit } from '../../../../utils/qrItem.ts';
import QItemDisplayInstructions from './QItemDisplayInstructions.tsx';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import { StandardTextField } from '../Textfield.styles.tsx';
import debounce from 'lodash.debounce';
import CheckIcon from '@mui/icons-material/Check';
import { CalculatedExpressionContext } from '../../../../../calculatedExpression/contexts/CalculatedExpressionContext.tsx';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import useValidationError from '../../../../hooks/useValidationError.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemInteger(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

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
  let valueInteger = 0;
  if (qrItem && qrItem.answer && qrItem.answer.length && qrItem.answer[0].valueInteger) {
    valueInteger = qrItem.answer[0].valueInteger;
  }
  const [input, setInput] = useState(valueInteger);

  // Perform validation checks
  const [focused, setFocused] = useState(false);
  const { feedback } = useValidationError(input.toString(), focused, regexValidation, maxLength);

  // Update input value if calculated expression changes
  const { calculatedExpressions } = useContext(CalculatedExpressionContext);
  const [calExpIsCalculating, setCalExpIsCalculating] = useState(false);

  useEffect(
    () => {
      const calcExpression = calculatedExpressions[qItem.linkId];

      // only update if calculated value is different from current value
      if (calcExpression?.value !== input && typeof calcExpression?.value === 'number') {
        // update ui to show calculated value changes
        setCalExpIsCalculating(true);
        setTimeout(() => {
          setCalExpIsCalculating(false);
        }, 500);

        // update questionnaireResponse
        setInput(calcExpression.value);
        onQrItemChange({
          ...createEmptyQrItemWithUnit(qItem, displayUnit),
          answer: [{ valueInteger: calcExpression.value }]
        });
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let newInput = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(newInput)) {
      newInput = '0';
    }

    const inputNumber = parseInt(newInput);
    setInput(inputNumber);
    updateQrItemWithDebounce(inputNumber);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((inputNumber: number) => {
      onQrItemChange({
        ...createEmptyQrItemWithUnit(qItem, displayUnit),
        answer: [{ valueInteger: inputNumber }]
      });
    }, 200),
    [onQrItemChange, qItem, displayUnit]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const integerInput = (
    <StandardTextField
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
      isTabled={isTabled}
      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
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
      data-test="q-item-integer-field"
    />
  );

  const renderQItemInteger = isRepeated ? (
    <>{integerInput}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-integer-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {integerInput}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemInteger}</>;
}

export default memo(QItemInteger);
