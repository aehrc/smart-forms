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

import React, { useCallback, useState } from 'react';

import type { Coding } from 'fhir/r4';

import type { AutocompleteChangeReason } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import useDebounce from '../../../hooks/useDebounce';
import useReadOnly from '../../../hooks/useReadOnly';
import useTerminologyServerQuery from '../../../hooks/useTerminologyServerQuery';
import debounce from 'lodash.debounce';
import { AUTOCOMPLETE_DEBOUNCE_DURATION, DEBOUNCE_DURATION } from '../../../utils/debounce';
import OpenChoiceAutocompleteField from './OpenChoiceAutocompleteField';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import { sanitizeInput } from '../../../utils/inputSanitization';
import { useValidationFeedback } from '../../../hooks';
import { createEmptyQrItem } from '../../../utils';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { FullWidthFormComponentBox } from '../../Box.styles';

function OpenChoiceAutocompleteItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    feedbackFromParent,
    parentIsReadOnly,
    onQrItemChange,
    calcExpUpdated
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const answerKey = qrItem?.answer?.[0]?.id;
  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);

  // Init input value
  let valueAutocomplete: Coding | string | undefined;
  if (qrOpenChoice.answer) {
    const answer = qrOpenChoice.answer[0];
    valueAutocomplete = answer.valueCoding ? answer.valueCoding : answer.valueString;
  }

  if (!valueAutocomplete) {
    valueAutocomplete = '';
  }

  const maxList = 10;

  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, AUTOCOMPLETE_DEBOUNCE_DURATION);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const validationFeedback = useValidationFeedback(qItem, feedbackFromParent);

  const {
    options,
    loading,
    feedback: terminologyFeedback
  } = useTerminologyServerQuery(qItem, maxList, input, debouncedInput);

  let feedback: { message: string; color: AlertColor } | null = null;
  if (terminologyFeedback) {
    feedback = terminologyFeedback;
  } else if (validationFeedback !== '') {
    feedback = { message: validationFeedback, color: 'error' };
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      if (input !== '') {
        onQrItemChange({
          ...emptyQrItem,
          answer: [{ id: answerKey, valueString: sanitizeInput(input) }]
        });
      } else {
        onQrItemChange(emptyQrItem);
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (!qItem.answerValueSet) {
    return null;
  }

  // Event handlers
  // Handler function which handles both input change and selection change
  function handleValueChange(
    newValue: Coding | string | null,
    reason: AutocompleteChangeReason | string
  ) {
    // When the reason is selectOption this function gets called twice. One for the string value and one for the selected option. So we need to make sure we ignore the string value on selectOption
    // If the reason is reset, then don't change value. Otherwise you will end up with looped setState calls
    if (reason === 'reset') {
      return;
    }

    // Set state if text input is changed and input is string
    if (newValue && typeof newValue === 'string' && reason === 'input') {
      setInput(newValue);
    }

    if (newValue === null) {
      setInput('');
      newValue = '';
    }

    if (typeof newValue === 'string' && reason === 'input') {
      if (newValue !== '') {
        // Check if the newValue is in the options, first check options.display, then check options.code
        const foundOption = options.find((option) => {
          if (option.display) {
            return option.display === newValue;
          }
          return option.code === newValue;
        });
        if (foundOption) {
          newValue = foundOption;
          // For option selection, update immediately (no debounce)
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ id: answerKey, valueCoding: newValue }]
          });
        }
        // if newValue is not in the options list, treat it as a string
        else {
          // For string input, use debounced update
          updateQrItemWithDebounce(newValue);
        }
      } else {
        // For empty string, update immediately
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
      }
    } else if (typeof newValue === 'object' && reason === 'selectOption') {
      // For coding selection, update immediately (no debounce) i.e reason should be selectOption
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueCoding: newValue }]
      });
    }
  }

  if (isRepeated) {
    return (
      <OpenChoiceAutocompleteField
        qItem={qItem}
        options={options}
        valueAutocomplete={valueAutocomplete}
        input={input}
        loading={loading}
        feedback={feedback}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-autocomplete-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <OpenChoiceAutocompleteField
            qItem={qItem}
            options={options}
            valueAutocomplete={valueAutocomplete}
            input={input}
            loading={loading}
            feedback={feedback}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            onValueChange={handleValueChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceAutocompleteItem;
