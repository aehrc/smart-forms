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

import React, { useMemo } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { convertCodingsToAnswerOptions, findInAnswerOptions } from '../../../utils/choice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import ChoiceRadioAnswerValueSetFields from './ChoiceRadioAnswerValueSetFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useCodingCalculatedExpression from '../../../hooks/useCodingCalculatedExpression';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';

interface ChoiceRadioAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceRadioAnswerValueSetItem(props: ChoiceRadioAnswerValueSetItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    parentIsReadOnly,
    feedbackFromParent,
    isTabled,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrChoiceRadio = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueRadio: string | null = null;
  if (qrChoiceRadio.answer) {
    valueRadio =
      qrChoiceRadio.answer[0].valueCoding?.code ??
      qrChoiceRadio.answer[0].valueCoding?.display ??
      null;
  }

  // Get codings/options from valueSet
  const { codings, terminologyError, dynamicCodingsUpdated } = useValueSetCodings(qItem);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  const options = useMemo(() => convertCodingsToAnswerOptions(codings), [codings]);

  const { calcExpUpdated } = useCodingCalculatedExpression({
    qItem: qItem,
    valueInString: valueRadio ?? '',
    onChangeByCalcExpressionString: (newValueString: string) => {
      handleChange(newValueString, true);
    },
    onChangeByCalcExpressionNull: () => {
      onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
    }
  });

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

  function handleChange(
    newValue: string,
    includeItemPath: boolean = false // only include when this is called from useCalculatedExpression hook
  ) {
    const targetItemPath = includeItemPath ? itemPath : undefined;

    if (codings.length > 0) {
      const qrAnswer = findInAnswerOptions(options, newValue);
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      onQrItemChange(
        qrAnswer ? { ...emptyQrItem, answer: [{ ...qrAnswer, id: answerKey }] } : emptyQrItem,
        targetItemPath
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
        feedback={feedback}
        readOnly={readOnly}
        expressionUpdated={calcExpUpdated || dynamicCodingsUpdated || answerOptionsToggleExpUpdated}
        answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
        terminologyError={terminologyError}
        isTabled={isTabled}
        onCheckedChange={handleChange}
        onClear={handleClear}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-radio-answer-value-set-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceRadioAnswerValueSetFields
            qItem={qItem}
            options={options}
            valueRadio={valueRadio}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={
              calcExpUpdated || dynamicCodingsUpdated || answerOptionsToggleExpUpdated
            }
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            terminologyError={terminologyError}
            isTabled={isTabled}
            onCheckedChange={handleChange}
            onClear={handleClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceRadioAnswerValueSetItem;
