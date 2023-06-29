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
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import { StandardTextField } from '../Textfield.styles.tsx';
import debounce from 'lodash.debounce';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import useValidationError from '../../../../hooks/useValidationError.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import useIntegerCalculatedExpression from '../../../../../calculatedExpression/hooks/useIntegerCalculatedExpression.ts';
import { parseValidInteger } from '../../../../utils/parseInputs.ts';
import FadingCheckIcon from '../../../../../calculatedExpression/components/FadingCheckIcon.tsx';
import { DEBOUNCE_DURATION } from '../../../../utils/debounce.ts';

interface QItemIntegerProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

const QItemInteger = memo(function QItemInteger(props: QItemIntegerProps) {
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
  const { feedback, onFieldFocus } = useValidationError(
    input.toString(),
    regexValidation,
    maxLength
  );

  const { calcExpUpdated } = useIntegerCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    displayUnit: displayUnit,
    setInputValue: (value) => {
      setInput(value);
    },
    onQrItemChange: onQrItemChange
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const inputNumber = parseValidInteger(event.target.value);

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
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const integerInput = (
    <StandardTextField
      id={qItem.linkId}
      value={input.toString()}
      error={!!feedback}
      onFocus={() => onFieldFocus(true)}
      onBlur={() => onFieldFocus(false)}
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
            <FadingCheckIcon fadeIn={calcExpUpdated} />
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
});

export default QItemInteger;
