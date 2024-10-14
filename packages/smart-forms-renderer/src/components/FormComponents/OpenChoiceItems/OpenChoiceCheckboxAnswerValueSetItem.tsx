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

import React, { useCallback, useMemo } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { getOpenLabelText } from '../../../utils/itemControl';
import { updateOpenLabelAnswer } from '../../../utils/openChoice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import debounce from 'lodash.debounce';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import OpenChoiceCheckboxAnswerValueSetFields from './OpenChoiceCheckboxAnswerValueSetFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useOpenLabel from '../../../hooks/useOpenLabel';
import { convertCodingsToAnswerOptions, updateChoiceCheckboxAnswers } from '../../../utils/choice';
import useValueSetCodings from '../../../hooks/useValueSetCodings';

interface OpenChoiceCheckboxAnswerValueSetItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceCheckboxAnswerValueSetItem(props: OpenChoiceCheckboxAnswerValueSetItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    showMinimalView = false,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const qrOpenChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const answers = qrOpenChoiceCheckbox.answer ?? [];

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayInstructions } = useRenderingExtensions(qItem);
  const openLabelText = getOpenLabelText(qItem);

  // Get codings/options from valueSet
  const { codings, terminologyError } = useValueSetCodings(qItem);

  const options = useMemo(() => convertCodingsToAnswerOptions(codings), [codings]);

  const { openLabelValue, setOpenLabelValue, openLabelChecked, setOpenLabelChecked } = useOpenLabel(
    options,
    answers
  );

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

  if (showMinimalView) {
    return (
      <>
        <OpenChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          options={options}
          answers={answers}
          openLabelText={openLabelText}
          openLabelValue={openLabelValue}
          openLabelChecked={openLabelChecked}
          readOnly={readOnly}
          terminologyError={terminologyError}
          onOptionChange={handleOptionChange}
          onOpenLabelCheckedChange={handleOpenLabelCheckedChange}
          onOpenLabelInputChange={handleOpenLabelInputChange}
        />
        <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-checkbox-answer-value-set-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <OpenChoiceCheckboxAnswerValueSetFields
          qItem={qItem}
          options={options}
          answers={answers}
          openLabelText={openLabelText}
          openLabelValue={openLabelValue}
          openLabelChecked={openLabelChecked}
          readOnly={readOnly}
          terminologyError={terminologyError}
          onOptionChange={handleOptionChange}
          onOpenLabelCheckedChange={handleOpenLabelCheckedChange}
          onOpenLabelInputChange={handleOpenLabelInputChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceCheckboxAnswerValueSetItem;
