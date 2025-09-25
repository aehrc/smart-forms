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

import React, { useState } from 'react';

import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';

import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useDebounce from '../../../hooks/useDebounce';
import useTerminologyServerQuery from '../../../hooks/useTerminologyServerQuery';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { AUTOCOMPLETE_DEBOUNCE_DURATION } from '../../../utils/debounce';
import OpenChoiceAutocompleteField from './OpenChoiceAutocompleteField';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { AlertColor } from '@mui/material/Alert';
import ItemLabel from '../ItemParts/ItemLabel';
import type { AutocompleteChangeReason } from '@mui/material';
import { sanitizeInput } from '../../../utils/inputSanitization';

interface OpenChoiceAutocompleteItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceAutocompleteItem(props: OpenChoiceAutocompleteItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    feedbackFromParent,
    parentIsReadOnly,
    onQrItemChange
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

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

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

  if (!qItem.answerValueSet) {
    return null;
  }

  // Event handlers
  // Handler function which handles both input change and selection change
  function handleValueChange(
    newValue: Coding | string | null,
    reason: AutocompleteChangeReason | string
  ) {
    //if the reason is reset, then we don't change the value, otherwise you will end up with looped setState calls
    if (reason === 'reset') {
      return;
    }
    //if the text input is changed, and only if hte input is a string the set the state.
    if (newValue && typeof newValue === 'string' && reason === 'input') {
      setInput(newValue);
      // return;
    }

    if (newValue === null) {
      setInput('');
      newValue = '';
    }

    if (typeof newValue === 'string') {
      if (newValue !== '') {
        // Check if the newValue in in the options, first check options.display, then check options.code
        const foundOption = options.find((option) => {
          if (option.display) {
            return option.display === newValue;
          }
          return option.code === newValue;
        });
        if (foundOption) {
          newValue = foundOption;
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ id: answerKey, valueCoding: newValue }]
          });
        }
        // if newValue is not in the options list, treat it as a string
        else {
          onQrItemChange({
            ...createEmptyQrItem(qItem, answerKey),
            answer: [{ id: answerKey, valueString: sanitizeInput(newValue) }]
          });
        }
      } else {
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
      }
    } else {
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
