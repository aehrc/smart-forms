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

import React from 'react';
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import OpenChoiceSelectAnswerValueSetField from './OpenChoiceSelectAnswerValueSetField';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';

interface OpenChoiceSelectAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceSelectAnswerValueSetItem(props: OpenChoiceSelectAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueSelect: Coding | null = null;
  if (qrOpenChoice['answer']) {
    valueSelect = qrOpenChoice['answer'][0].valueCoding ?? null;
  }

  // Get codings/options from valueSet
  const { codings, terminologyError } = useValueSetCodings(qItem);

  // Event handlers
  function handleValueChange(newValue: Coding | string | null) {
    if (newValue) {
      if (typeof newValue === 'string') {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueString: newValue }]
        });
      } else {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueCoding: newValue }]
        });
      }
      return;
    }

    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isRepeated) {
    return (
      <OpenChoiceSelectAnswerValueSetField
        qItem={qItem}
        options={codings}
        valueSelect={valueSelect}
        terminologyError={terminologyError}
        isTabled={isTabled}
        readOnly={readOnly}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-select-answer-value-set-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <OpenChoiceSelectAnswerValueSetField
          qItem={qItem}
          options={codings}
          valueSelect={valueSelect}
          terminologyError={terminologyError}
          isTabled={isTabled}
          readOnly={readOnly}
          onValueChange={handleValueChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerValueSetItem;
