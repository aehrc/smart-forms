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

import React, { useMemo } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { convertCodingsToAnswerOptions, findInAnswerOptions } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import ChoiceRadioAnswerValueSetFields from './ChoiceRadioAnswerValueSetFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useCodingCalculatedExpression from '../../../hooks/useCodingCalculatedExpression';

interface ChoiceRadioAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceRadioAnswerValueSetItem(props: ChoiceRadioAnswerValueSetItemProps) {
  const { qItem, qrItem, isRepeated, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const qrChoiceRadio = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueRadio: string | null = null;
  if (qrChoiceRadio.answer) {
    valueRadio = qrChoiceRadio.answer[0].valueCoding?.code ?? null;
  }

  // Get codings/options from valueSet
  const { codings, terminologyError } = useValueSetCodings(qItem);

  const options = useMemo(() => convertCodingsToAnswerOptions(codings), [codings]);

  const { calcExpUpdated } = useCodingCalculatedExpression({
    qItem: qItem,
    valueInString: valueRadio ?? '',
    onChangeByCalcExpressionString: (newValueString: string) => {
      handleChange(newValueString);
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  });

  function handleChange(newValue: string) {
    if (codings.length > 0) {
      const qrAnswer = findInAnswerOptions(options, newValue);
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      onQrItemChange(
        qrAnswer ? { ...emptyQrItem, answer: [{ ...qrAnswer, id: answerKey }] } : emptyQrItem
      );
    }
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isRepeated) {
    return (
      <ChoiceRadioAnswerValueSetFields
        qItem={qItem}
        options={options}
        valueRadio={valueRadio}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        terminologyError={terminologyError}
        onCheckedChange={handleChange}
        onClear={handleClear}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-radio-answer-value-set-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <ChoiceRadioAnswerValueSetFields
          qItem={qItem}
          options={options}
          valueRadio={valueRadio}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          terminologyError={terminologyError}
          onCheckedChange={handleChange}
          onClear={handleClear}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerValueSetItem;
