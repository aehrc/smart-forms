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

import React, { useEffect, useMemo } from 'react';

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
import ChoiceSelectAnswerValueSetFields from './ChoiceSelectAnswerValueSetFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useCodingCalculatedExpression from '../../../hooks/useCodingCalculatedExpression';
import { convertCodingsToAnswerOptions, findInAnswerOptions } from '../../../utils/choice';

interface ChoiceSelectAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceSelectAnswerValueSetItem(props: ChoiceSelectAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const qrChoiceSelect = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueCoding: Coding | null = null;
  if (qrChoiceSelect.answer) {
    valueCoding = qrChoiceSelect.answer[0].valueCoding ?? null;
  }

  // Get codings/options from valueSet
  const { codings, terminologyError } = useValueSetCodings(qItem);

  valueCoding = useMemo(() => {
    const updatedValueCoding = codings.find(
      (queriedCoding) => queriedCoding.code === valueCoding?.code
    );
    return updatedValueCoding ?? valueCoding;
  }, [codings, valueCoding]);

  // Check and remove populated answer if it is a string
  // NOTE: $populate will try to populate answer as valueCoding,
  //       but will fail if answer provided is not within options
  useEffect(
    () => {
      if (qrChoiceSelect.answer && qrChoiceSelect.answer[0].valueString) {
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
      }
    },
    // Only run effect once - on populate
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const answerOptions = useMemo(() => convertCodingsToAnswerOptions(codings), [codings]);

  // Process calculated expressions
  const { calcExpUpdated } = useCodingCalculatedExpression({
    qItem: qItem,
    valueInString: valueCoding?.code ?? '',
    onChangeByCalcExpressionString: (newValueString) => {
      if (codings.length > 0) {
        const qrAnswer = findInAnswerOptions(answerOptions, newValueString);
        onQrItemChange(
          qrAnswer
            ? { ...createEmptyQrItem(qItem, answerKey), answer: [{ ...qrAnswer, id: answerKey }] }
            : createEmptyQrItem(qItem, answerKey)
        );
      }
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  });

  // Event handlers
  function handleChange(newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isRepeated) {
    return (
      <ChoiceSelectAnswerValueSetFields
        qItem={qItem}
        codings={codings}
        valueCoding={valueCoding}
        terminologyError={terminologyError}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onSelectChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-select-answer-value-set-box"
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceSelectAnswerValueSetFields
          qItem={qItem}
          codings={codings}
          valueCoding={valueCoding}
          terminologyError={terminologyError}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onSelectChange={handleChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceSelectAnswerValueSetItem;
