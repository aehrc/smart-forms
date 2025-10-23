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

import debounce from 'lodash.debounce';
import { useCallback, useMemo } from 'react';
import useAnswerOptionsToggleExpressions from '../../../hooks/useAnswerOptionsToggleExpressions';
import useOpenLabel from '../../../hooks/useOpenLabel';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { convertCodingsToAnswerOptions, updateChoiceCheckboxAnswers } from '../../../utils/choice';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { getOpenLabelText } from '../../../utils/extensions';
import { updateOpenLabelAnswer } from '../../../utils/openChoice';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import OpenChoiceCheckboxAnswerValueSetFields from './OpenChoiceCheckboxAnswerValueSetFields';

function OpenChoiceCheckboxAnswerValueSetItem(props: BaseItemProps) {
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
  const answerKey = qrItem?.answer?.[0]?.id;
  const qrOpenChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const answers = qrOpenChoiceCheckbox.answer ?? [];

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  const { displayInstructions } = renderingExtensions;
  const openLabelText = getOpenLabelText(qItem);

  // Get codings/options from valueSet
  const { codings, terminologyError, dynamicCodingsUpdated } = useValueSetCodings(qItem);

  const options = useMemo(() => convertCodingsToAnswerOptions(codings), [codings]);

  const { openLabelValue, setOpenLabelValue, openLabelChecked, setOpenLabelChecked } = useOpenLabel(
    options,
    answers
  );

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
        <OpenChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          options={options}
          answers={answers}
          openLabelText={openLabelText}
          openLabelValue={openLabelValue}
          openLabelChecked={openLabelChecked}
          feedback={feedback}
          readOnly={readOnly}
          expressionUpdated={
            calcExpUpdated || dynamicCodingsUpdated || answerOptionsToggleExpUpdated
          }
          answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
          terminologyError={terminologyError}
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
      data-test="q-item-open-choice-checkbox-answer-value-set-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <OpenChoiceCheckboxAnswerValueSetFields
            qItem={qItem}
            options={options}
            answers={answers}
            openLabelText={openLabelText}
            openLabelValue={openLabelValue}
            openLabelChecked={openLabelChecked}
            feedback={feedback}
            readOnly={readOnly}
            expressionUpdated={
              calcExpUpdated || dynamicCodingsUpdated || answerOptionsToggleExpUpdated
            }
            answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            terminologyError={terminologyError}
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

export default OpenChoiceCheckboxAnswerValueSetItem;
