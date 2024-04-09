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

import React, { useCallback, useMemo, useState } from 'react';
import { CheckBoxOption } from '../../../interfaces/choice.enum';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { getOpenLabelText } from '../../../utils/itemControl';
import {
  getOldOpenLabelAnswer,
  updateQrOpenChoiceCheckboxAnswers
} from '../../../utils/openChoice';
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
import OpenChoiceCheckboxAnswerOptionFields from './OpenChoiceCheckboxAnswerOptionFields';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';

interface OpenChoiceCheckboxAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceCheckboxAnswerOptionItem(props: OpenChoiceCheckboxAnswerOptionItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    showMinimalView = false,
    parentIsReadOnly,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const openLabelText = getOpenLabelText(qItem);
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Init answers
  const qrOpenChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem);
  const answers = useMemo(() => qrOpenChoiceCheckbox.answer ?? [], [qrOpenChoiceCheckbox.answer]);

  // Init options and open label value
  const answerOptions = qItem.answerOption;
  let initialOpenLabelValue = '';
  let initialOpenLabelChecked = false;
  if (answerOptions) {
    const oldLabelAnswer = getOldOpenLabelAnswer(answers, answerOptions);
    if (oldLabelAnswer && oldLabelAnswer.valueString) {
      initialOpenLabelValue = oldLabelAnswer.valueString;
      initialOpenLabelChecked = true;
    }
  }
  const [openLabelValue, setOpenLabelValue] = useState(initialOpenLabelValue);
  const [openLabelChecked, setOpenLabelChecked] = useState(initialOpenLabelChecked);

  // Event handlers
  const handleValueChange = useCallback(
    (changedOptionValue: string | null, changedOpenLabelValue: string | null) => {
      if (!answerOptions) return null;

      let updatedQrChoiceCheckbox: QuestionnaireResponseItem | null = null;
      if (changedOptionValue) {
        updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
          changedOptionValue,
          null,
          answers,
          answerOptions,
          qrOpenChoiceCheckbox,
          CheckBoxOption.AnswerOption,
          isRepeated
        );
      } else if (changedOpenLabelValue !== null) {
        updatedQrChoiceCheckbox = updateQrOpenChoiceCheckboxAnswers(
          null,
          changedOpenLabelValue,
          answers,
          answerOptions,
          qrOpenChoiceCheckbox,
          CheckBoxOption.AnswerOption,
          isRepeated
        );
      }

      if (updatedQrChoiceCheckbox) {
        onQrItemChange(updatedQrChoiceCheckbox);
      }
    },
    [answerOptions, answers, isRepeated, onQrItemChange, qrOpenChoiceCheckbox]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateOpenLabelValueWithDebounce = useCallback(
    debounce((input: string) => {
      handleValueChange(null, input);
    }, DEBOUNCE_DURATION),
    [handleValueChange]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  function handleOpenLabelCheckedChange(checked: boolean) {
    handleValueChange(null, openLabelValue);
    setOpenLabelChecked(checked);
  }

  function handleOpenLabelInputChange(newValue: string) {
    setOpenLabelValue(newValue);
    updateOpenLabelValueWithDebounce(newValue);
  }

  if (showMinimalView) {
    return (
      <>
        <OpenChoiceCheckboxAnswerOptionFields
          qItem={qItem}
          answers={answers}
          openLabelText={openLabelText}
          openLabelValue={openLabelValue}
          openLabelChecked={openLabelChecked}
          readOnly={readOnly}
          onValueChange={handleValueChange}
          onOpenLabelCheckedChange={handleOpenLabelCheckedChange}
          onOpenLabelInputChange={handleOpenLabelInputChange}
        />
        <DisplayInstructions displayInstructions={displayInstructions} readOnly={readOnly} />
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-checkbox-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <OpenChoiceCheckboxAnswerOptionFields
          qItem={qItem}
          answers={answers}
          openLabelText={openLabelText}
          openLabelValue={openLabelValue}
          openLabelChecked={openLabelChecked}
          readOnly={readOnly}
          onValueChange={handleValueChange}
          onOpenLabelCheckedChange={handleOpenLabelCheckedChange}
          onOpenLabelInputChange={handleOpenLabelInputChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceCheckboxAnswerOptionItem;
