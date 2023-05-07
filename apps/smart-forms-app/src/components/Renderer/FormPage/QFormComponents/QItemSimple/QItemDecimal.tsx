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

import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../../interfaces/Interfaces';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItemWithUnit } from '../../../../../functions/QrItemFunctions';
import QItemDisplayInstructions from './QItemDisplayInstructions';
import QItemLabel from '../QItemParts/QItemLabel';
import { StandardTextField } from '../../../../StyledComponents/Textfield.styles';
import { FullWidthFormComponentBox } from '../../../../StyledComponents/Boxes.styles';
import debounce from 'lodash.debounce';
import CheckIcon from '@mui/icons-material/Check';
import { CalculatedExpressionContext } from '../../../../../custom-contexts/CalculatedExpressionContext';
import useRenderingExtensions from '../../../../../custom-hooks/useRenderingExtensions';
import useValidationError from '../../../../../custom-hooks/useValidationError';
import { getDecimalPrecision } from '../../../../../functions/ItemControlFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDecimal(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Get additional rendering extensions
  const precision = getDecimalPrecision(qItem);
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
  let initialInput = '0';
  let valueDecimal = 0.0;
  if (qrItem && qrItem.answer && qrItem.answer.length && qrItem.answer[0].valueDecimal) {
    valueDecimal = qrItem.answer[0].valueDecimal;
    initialInput = precision ? valueDecimal.toFixed(precision) : valueDecimal.toString();
  }
  const [input, setInput] = useState(initialInput);

  // Perform validation checks
  const [focused, setFocused] = useState(false);
  const { feedback } = useValidationError(input, focused, regexValidation, maxLength);

  // Update input value if calculated expression changes
  const { calculatedExpressions } = useContext(CalculatedExpressionContext);
  const [calExpIsCalculating, setCalExpIsCalculating] = useState(false);

  useEffect(() => {
    const calcExpression = calculatedExpressions[qItem.linkId];

    if (calcExpression?.value && typeof calcExpression?.value === 'number') {
      const value = precision
        ? parseFloat(calcExpression.value.toFixed(precision))
        : calcExpression.value;

      // only update if calculated value is different from current value
      if (value !== parseFloat(input)) {
        // update ui to show calculated value changes
        setCalExpIsCalculating(true);
        setTimeout(() => {
          setCalExpIsCalculating(false);
        }, 500);

        // update questionnaireResponse
        setInput(precision ? value.toFixed(precision) : value.toString());
        onQrItemChange({
          ...createEmptyQrItemWithUnit(qItem, displayUnit),
          answer: [{ valueDecimal: value }]
        });
      }
    }
  }, [calculatedExpressions]); // Only trigger this effect if calculatedExpression changes

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    // set input as 0 if no number in input
    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }

    let parsedInput = parseFloat(input).toString();

    // restore decimal digits if parseFloat() removes them
    const decimalPoint = input.indexOf('.');
    if (decimalPoint !== -1) {
      const decimalDigits = input.slice(decimalPoint);
      if (parsedInput.indexOf('.') === -1) {
        parsedInput += decimalDigits;
      }
    }

    // truncate decimal digits based on precision
    const parsedDecimalPoint = input.indexOf('.');
    if (precision && parsedDecimalPoint !== -1) {
      parsedInput = parsedInput.substring(0, parsedDecimalPoint + precision + 1);
    }

    setInput(parsedInput);
    updateQrItemWithDebounce(parsedInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      onQrItemChange({
        ...createEmptyQrItemWithUnit(qItem, displayUnit),
        answer: precision
          ? [{ valueDecimal: parseFloat(parseFloat(input).toFixed(precision)) }]
          : [{ valueDecimal: parseFloat(input) }]
      });
    }, 200),
    [onQrItemChange, qItem, displayUnit, precision]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const decimalInput = (
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
      inputProps={{
        inputMode: 'numeric',
        pattern: '[0-9]*'
      }}
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
      data-test="q-item-decimal-field"
    />
  );

  const renderQItemDecimal = isRepeated ? (
    <>{decimalInput}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-decimal-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {decimalInput}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );
  return <>{renderQItemDecimal}</>;
}

export default memo(QItemDecimal);
