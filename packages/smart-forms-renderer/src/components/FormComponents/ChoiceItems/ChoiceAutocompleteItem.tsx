/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import { AUTOCOMPLETE_DEBOUNCE_DURATION } from '../../../utils/debounce';
import useReadOnly from '../../../hooks/useReadOnly';
import ChoiceAutocompleteField from './ChoiceAutocompleteField';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';

interface ChoiceAutocompleteItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceAutocompleteItem(props: ChoiceAutocompleteItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const qrChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueCoding: Coding | undefined;
  if (qrChoice.answer) {
    valueCoding = qrChoice.answer[0].valueCoding;
  }

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const maxList = 10;

  const [input, setInput] = useState('');
  const debouncedInput = useDebounce(input, AUTOCOMPLETE_DEBOUNCE_DURATION);

  const { options, loading, feedback } = useTerminologyServerQuery(
    qItem,
    maxList,
    input,
    debouncedInput
  );

  if (!qItem.answerValueSet) {
    return null;
  }

  // Event handlers
  function handleValueChange(newValue: Coding | null) {
    if (newValue === null) {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

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
        feedback={feedback ?? null}
        readOnly={readOnly}
        isTabled={isTabled}
        onInputChange={setInput}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-autocomplete-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceAutocompleteField
          qItem={qItem}
          options={options}
          valueCoding={valueCoding ?? null}
          loading={loading}
          feedback={feedback ?? null}
          readOnly={readOnly}
          isTabled={isTabled}
          onInputChange={setInput}
          onValueChange={handleValueChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceAutocompleteItem;
