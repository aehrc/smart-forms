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
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import QItemDisplayInstructions from './QItemDisplayInstructions.tsx';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import { StandardTextField } from '../Textfield.styles.tsx';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import debounce from 'lodash.debounce';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import useValidationError from '../../../../hooks/useValidationError.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import { DEBOUNCE_DURATION } from '../../../../utils/debounce.ts';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

const QItemString = memo(function QItemString(props: Props) {
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
  let valueString = '';
  if (qrItem && qrItem.answer && qrItem.answer.length && qrItem.answer[0].valueString) {
    valueString = qrItem.answer[0].valueString;
  }
  const [input, setInput] = useState(valueString);

  // Perform validation checks
  const { feedback, onFieldFocus } = useValidationError(input, regexValidation, maxLength);

  // Event handlers
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
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const stringInput = (
    <StandardTextField
      fullWidth
      isTabled={isTabled}
      id={qItem.linkId}
      value={input}
      error={!!feedback}
      onFocus={() => onFieldFocus(true)}
      onBlur={() => onFieldFocus(false)}
      onChange={handleChange}
      label={displayPrompt}
      placeholder={entryFormat}
      disabled={readOnly}
      InputProps={{ endAdornment: <InputAdornment position={'end'}>{displayUnit}</InputAdornment> }}
      helperText={feedback}
      data-test="q-item-string-field"
    />
  );

  const renderQItemString = isRepeated ? (
    <>{stringInput}</>
  ) : (
    <FullWidthFormComponentBox data-test="q-item-string-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {stringInput}
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemString}</>;
});

export default QItemString;
