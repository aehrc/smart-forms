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

import React, { useCallback } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import useValidationError from '../../../hooks/useValidationError';
import debounce from 'lodash.debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { FullWidthFormComponentBox } from '../../Box.styles';
import TextField from './TextField';
import useStringCalculatedExpression from '../../../hooks/useStringCalculatedExpression';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useStringInput from '../../../hooks/useStringInput';
import useReadOnly from '../../../hooks/useReadOnly';

interface TextItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function TextItem(props: TextItemProps) {
  const { qItem, qrItem, isRepeated, parentIsReadOnly, onQrItemChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const {
    displayUnit,
    displayPrompt,
    displayInstructions,
    entryFormat,
    regexValidation,
    maxLength
  } = useRenderingExtensions(qItem);

  // Init input value
  let valueText = '';
  if (qrItem?.answer && qrItem?.answer[0].valueString) {
    valueText = qrItem.answer[0].valueString;
  }
  const [input, setInput] = useStringInput(valueText);

  // Perform validation checks
  const feedback = useValidationError(input, regexValidation, maxLength);

  // Process calculated expressions
  const { calcExpUpdated } = useStringCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    setInputValue: (value) => {
      setInput(value);
    },
    onQrItemChange: onQrItemChange
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    setInput(newInput);
    updateQrItemWithDebounce(newInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      const emptyQrItem = createEmptyQrItem(qItem);
      if (input !== '') {
        onQrItemChange({ ...emptyQrItem, answer: [{ valueString: input.trim() }] });
      } else {
        onQrItemChange(emptyQrItem);
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <TextField
        linkId={qItem.linkId}
        input={input}
        feedback={feedback}
        displayPrompt={displayPrompt}
        displayUnit={displayUnit}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        onInputChange={handleInputChange}
      />
    );
  }
  return (
    <FullWidthFormComponentBox data-test="q-item-text-box">
      <ItemFieldGrid qItem={qItem} displayInstructions={displayInstructions} readOnly={readOnly}>
        <TextField
          linkId={qItem.linkId}
          input={input}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          onInputChange={handleInputChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default TextItem;
