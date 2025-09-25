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

import React, { useCallback } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { getOpenLabelText } from '../../../utils/extensions';
import { updateOpenLabelAnswer } from '../../../utils/openChoice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import debounce from 'lodash.debounce';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useOpenLabel from '../../../hooks/useOpenLabel';
import { updateChoiceCheckboxAnswers } from '../../../utils/choice';
import OpenChoiceCheckboxAnswerOptionFields from './OpenChoiceCheckboxAnswerOptionFields';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';

interface OpenChoiceCheckboxAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceCheckboxAnswerOptionItem(props: OpenChoiceCheckboxAnswerOptionItemProps) {
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
  const qrOpenChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const answers = qrOpenChoiceCheckbox.answer ?? [];

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  const { displayInstructions } = renderingExtensions;
  const openLabelText = getOpenLabelText(qItem);

  const options = qItem.answerOption ?? [];

  const { openLabelValue, setOpenLabelValue, openLabelChecked, setOpenLabelChecked } = useOpenLabel(
    options,
    answers
  );

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  // Process answerOptionsToggleExpressions
  const { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated } =
    useAnswerOptionsToggleExpressions(qItem.linkId);

  // Clear open label if answerOptionsToggleExpressions are updated AND if openLabelChecked is true
  // Note: This adjusts the state during rendering https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (openLabelChecked && answerOptionsToggleExpUpdated) {
    setOpenLabelChecked(false);
  }

  // Event handlers

  // One of the options is changed
  // Processing is similar to a choice checkbox
  function handleOptionChange(changedOptionValue: string) {
    if (options.length === 0) {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    // Process as a choice checkbox
    const updatedQrItem = updateChoiceCheckboxAnswers(
      changedOptionValue,
      answers,
      options,
      qrOpenChoiceCheckbox,
      isRepeated,
      answerKey
    );

    if (updatedQrItem) {
      onQrItemChange(updatedQrItem);
    }

    // If single-selection, uncheck open label
    if (!isRepeated) {
      setOpenLabelChecked(false);
    }
  }

  function handleOpenLabelChange(openLabelChecked: boolean, changedOpenLabelValue: string) {
    const updatedQrItem = updateOpenLabelAnswer(
      openLabelChecked,
      changedOpenLabelValue,
      answers,
      options,
      qrOpenChoiceCheckbox,
      isRepeated,
      answerKey
    );

    if (updatedQrItem) {
      onQrItemChange(updatedQrItem);
    }
  }

  function handleOpenLabelCheckedChange(checked: boolean) {
    handleOpenLabelChange(checked, openLabelValue);
    setOpenLabelChecked(checked);
  }

  function handleOpenLabelInputChange(newValue: string) {
    updateOpenLabelValueWithDebounce(newValue);
    setOpenLabelValue(newValue);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateOpenLabelValueWithDebounce = useCallback(
    debounce((input: string) => {
      handleOpenLabelChange(openLabelChecked, input);
    }, DEBOUNCE_DURATION),
    [handleOpenLabelChange]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
    setOpenLabelChecked(false);
    setOpenLabelValue('');
  }

  if (isTabled) {
    return (
      <>
        <OpenChoiceCheckboxAnswerOptionFields
          qItem={qItem}
          options={options}
          answers={answers}
          openLabelText={openLabelText}
          openLabelValue={openLabelValue}
          openLabelChecked={openLabelChecked}
          feedback={feedback}
          readOnly={readOnly}
          expressionUpdated={answerOptionsToggleExpUpdated}
          answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
          isTabled={isTabled}
          onOptionChange={handleOptionChange}
          onOpenLabelCheckedChange={handleOpenLabelCheckedChange}
          onOpenLabelInputChange={handleOpenLabelInputChange}
          onClear={handleClear}
        />
        <DisplayInstructions readOnly={readOnly}>{displayInstructions}</DisplayInstructions>
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-checkbox-answer-option-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <OpenChoiceCheckboxAnswerOptionFields
            qItem={qItem}
            options={options}
            answers={answers}
            openLabelText={openLabelText}
            openLabelValue={openLabelValue}
            openLabelChecked={openLabelChecked}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={answerOptionsToggleExpUpdated}
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            isTabled={isTabled}
            onOptionChange={handleOptionChange}
            onOpenLabelCheckedChange={handleOpenLabelCheckedChange}
            onOpenLabelInputChange={handleOpenLabelInputChange}
            onClear={handleClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceCheckboxAnswerOptionItem;
