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

import { useCallback, useState } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import useValidationError from '../../../../hooks/useValidationError.ts';
import debounce from 'lodash.debounce';
import { createEmptyQrItemWithUnit } from '../../../../utils/qrItem.ts';
import { DEBOUNCE_DURATION } from '../../../../utils/debounce.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import FieldGrid from '../FieldGrid.tsx';
import IntegerField from './IntegerField.tsx';
import useIntegerCalculatedExpression from '../../../../../calculatedExpression/hooks/useIntegerCalculatedExpression.ts';
import { parseValidInteger } from '../../../../utils/parseInputs.ts';

interface IntegerItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function IntegerItem(props: IntegerItemProps) {
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
  if (qrItem?.answer && qrItem?.answer[0].valueInteger) {
    valueInteger = qrItem.answer[0].valueInteger;
  }
  const [value, setValue] = useState(valueInteger);

  // Perform validation checks
  const { feedback, onFieldFocus } = useValidationError(
    value.toString(),
    regexValidation,
    maxLength
  );

  // Process calculated expressions
  const { calcExpUpdated } = useIntegerCalculatedExpression({
    qItem: qItem,
    inputValue: value,
    displayUnit: displayUnit,
    setInputValue: (newValue) => {
      setValue(newValue);
    },
    onQrItemChange: onQrItemChange
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const newValue = parseValidInteger(newInput);

    setValue(newValue);
    updateQrItemWithDebounce(newValue);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((newValue: number) => {
      onQrItemChange({
        ...createEmptyQrItemWithUnit(qItem, displayUnit),
        answer: [{ valueInteger: newValue }]
      });
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <IntegerField
        linkId={qItem.linkId}
        value={value}
        feedback={feedback}
        displayPrompt={displayPrompt}
        displayUnit={displayUnit}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onFieldFocus={onFieldFocus}
        onInputChange={handleInputChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-integer-box">
      <FieldGrid qItem={qItem} displayInstructions={displayInstructions}>
        <IntegerField
          linkId={qItem.linkId}
          value={value}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onFieldFocus={onFieldFocus}
          onInputChange={handleInputChange}
        />
      </FieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default IntegerItem;
