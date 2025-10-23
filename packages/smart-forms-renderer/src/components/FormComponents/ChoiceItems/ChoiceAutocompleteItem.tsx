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

import type { Coding } from 'fhir/r4';
import { useState } from 'react';

import type { AlertColor } from '@mui/material/Alert';
import useDebounce from '../../../hooks/useDebounce';
import useReadOnly from '../../../hooks/useReadOnly';
import useTerminologyServerQuery from '../../../hooks/useTerminologyServerQuery';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { AUTOCOMPLETE_DEBOUNCE_DURATION } from '../../../utils/debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import ChoiceAutocompleteField from './ChoiceAutocompleteField';

function ChoiceAutocompleteItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;
  // TODO no calcExpUpdated

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueCoding: Coding | undefined;
  if (qrChoice.answer) {
    valueCoding = qrChoice.answer[0].valueCoding;
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

  if (!qItem.answerValueSet) {
    return null;
  }

  // Event handlers
  function handleValueChange(newValue: Coding | null) {
    if (newValue === null) {
      setInput('');
      // For clearing selection, update immediately
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    // For option selection, update immediately (no debounce)
    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: [{ id: answerKey, valueCoding: newValue }]
    });
  }

  if (isRepeated) {
    return (
      <ChoiceAutocompleteField
        qItem={qItem}
        options={options}
        valueCoding={valueCoding ?? null}
        loading={loading}
        feedback={feedback}
        readOnly={readOnly}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        onInputChange={setInput}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-autocomplete-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceAutocompleteField
            qItem={qItem}
            options={options}
            valueCoding={valueCoding ?? null}
            loading={loading}
            feedback={feedback}
            readOnly={readOnly}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            onInputChange={setInput}
            onValueChange={handleValueChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceAutocompleteItem;
