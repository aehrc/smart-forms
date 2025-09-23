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
import { createEmptyQrItem } from '../../../utils/qrItem';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import { convertCodingsToAnswerOptions, updateChoiceCheckboxAnswers } from '../../../utils/choice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import ChoiceCheckboxAnswerValueSetFields from './ChoiceCheckboxAnswerValueSetFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';

interface ChoiceCheckboxAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  showText?: boolean;
}

function ChoiceCheckboxAnswerValueSetItem(props: ChoiceCheckboxAnswerValueSetItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    isTabled,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const answers = qrChoiceCheckbox.answer ?? [];

  const { displayInstructions } = renderingExtensions;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Get codings/options from valueSet
  // TODO use dynamicCodingsUpdated to trigger a "refresh" icon when codings are dynamically updated
  const { codings, terminologyError } = useValueSetCodings(qItem);

  const options = useMemo(() => convertCodingsToAnswerOptions(codings), [codings]);

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

  // Event handlers
  function handleCheckedChange(changedValue: string) {
    if (options.length === 0) {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    const updatedQrChoiceCheckbox = updateChoiceCheckboxAnswers(
      changedValue,
      answers,
      options,
      qrChoiceCheckbox,
      isRepeated,
      answerKey
    );

    if (updatedQrChoiceCheckbox) {
      onQrItemChange(updatedQrChoiceCheckbox);
    }
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isTabled) {
    return (
      <>
        <ChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          options={options}
          answers={answers}
          feedback={feedback}
          readOnly={readOnly}
          expressionUpdated={answerOptionsToggleExpUpdated}
          answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
          terminologyError={terminologyError}
          isTabled={isTabled}
          onCheckedChange={handleCheckedChange}
          onClear={handleClear}
        />
        <DisplayInstructions readOnly={readOnly}>{displayInstructions}</DisplayInstructions>
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-checkbox-answer-value-set-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceCheckboxAnswerValueSetFields
            qItem={qItem}
            options={options}
            answers={answers}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={answerOptionsToggleExpUpdated}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            terminologyError={terminologyError}
            isTabled={isTabled}
            onCheckedChange={handleCheckedChange}
            onClear={handleClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceCheckboxAnswerValueSetItem;
