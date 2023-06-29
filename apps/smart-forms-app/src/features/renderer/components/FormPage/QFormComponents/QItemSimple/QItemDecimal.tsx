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
import { memo, useCallback, useState } from 'react';
import { Grid, InputAdornment } from '@mui/material';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItemWithUnit } from '../../../../utils/qrItem.ts';
import QItemDisplayInstructions from './QItemDisplayInstructions.tsx';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import { StandardTextField } from '../Textfield.styles.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import debounce from 'lodash.debounce';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import useValidationError from '../../../../hooks/useValidationError.ts';
import { getDecimalPrecision } from '../../../../utils/itemControl.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import FadingCheckIcon from '../../../../../calculatedExpression/components/FadingCheckIcon.tsx';
import { DEBOUNCE_DURATION } from '../../../../utils/debounce.ts';
import useDecimalCalculatedExpression from '../../../../../calculatedExpression/hooks/useDecimalCalculatedExpression.ts';
import {
  parseDecimalStringToFloat,
  parseDecimalStringWithPrecision
} from '../../../../utils/parseInputs.ts';

interface QItemDecimalProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

const QItemDecimal = memo(function QItemDecimal(props: QItemDecimalProps) {
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
  const { feedback, onFieldFocus } = useValidationError(input, regexValidation, maxLength);

  const { calcExpUpdated } = useDecimalCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    displayUnit: displayUnit,
    precision: precision,
    setInputValue: (value) => {
      setInput(value);
    },
    onQrItemChange: onQrItemChange
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const parsedInput: string = parseDecimalStringWithPrecision(event.target.value, precision);

    setInput(parsedInput);
    updateQrItemWithDebounce(parsedInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      onQrItemChange({
        ...createEmptyQrItemWithUnit(qItem, displayUnit),
        answer: precision
          ? [{ valueDecimal: parseDecimalStringToFloat(input, precision) }]
          : [{ valueDecimal: parseFloat(input) }]
      });
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit, precision]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const decimalInput = (
    <StandardTextField
      id={qItem.linkId}
      value={input}
      error={!!feedback}
      onFocus={() => onFieldFocus(true)}
      onBlur={() => onFieldFocus(false)}
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
            <FadingCheckIcon fadeIn={calcExpUpdated} />
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
});

export default QItemDecimal;
