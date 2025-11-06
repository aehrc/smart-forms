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

import { useEffect, useMemo } from 'react';

import type { Coding } from 'fhir/r4';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { createEmptyQrItem, getQRItemId } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import ChoiceSelectAnswerValueSetFields from './ChoiceSelectAnswerValueSetFields';

function ChoiceSelectAnswerValueSetItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    calcExpUpdated,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = getQRItemId(qrItem?.answer?.[0]?.id);
  const qrChoiceSelect = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueCoding: Coding | null = null;
  if (qrChoiceSelect.answer) {
    valueCoding = qrChoiceSelect.answer[0].valueCoding ?? null;
  }

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Get codings/options from valueSet
  const { codings, terminologyError, dynamicCodingsUpdated } = useValueSetCodings(qItem);

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

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

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
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={calcExpUpdated || dynamicCodingsUpdated || answerOptionsToggleExpUpdated}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        onSelectChange={handleChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-select-answer-value-set-box"
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceSelectAnswerValueSetFields
            qItem={qItem}
            codings={codings}
            valueCoding={valueCoding}
            terminologyError={terminologyError}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={calcExpUpdated || dynamicCodingsUpdated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            onSelectChange={handleChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceSelectAnswerValueSetItem;
