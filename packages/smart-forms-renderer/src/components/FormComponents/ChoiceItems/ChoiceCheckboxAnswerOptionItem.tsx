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
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { updateChoiceCheckboxAnswers } from '../../../utils/choice';
import { FullWidthFormComponentBox } from '../../Box.styles';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import DisplayInstructions from '../DisplayItem/DisplayInstructions';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import ChoiceCheckboxAnswerOptionFields from './ChoiceCheckboxAnswerOptionFields';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';

interface ChoiceCheckboxAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function ChoiceCheckboxAnswerOptionItem(props: ChoiceCheckboxAnswerOptionItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    renderingExtensions,
    showMinimalView = false,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0].id;
  const qrChoiceCheckbox = qrItem ?? createEmptyQrItem(qItem, answerKey);
  const answers = qrChoiceCheckbox.answer ?? [];

  const { displayInstructions } = renderingExtensions;

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent, '');

  const options = qItem.answerOption ?? [];

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

  if (showMinimalView) {
    return (
      <>
        <ChoiceCheckboxAnswerOptionFields
          qItem={qItem}
          options={options}
          answers={answers}
          feedback={feedback}
          readOnly={readOnly}
          onCheckedChange={handleCheckedChange}
        />
        <DisplayInstructions readOnly={readOnly}>{displayInstructions}</DisplayInstructions>
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-choice-checkbox-answer-option-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <ChoiceCheckboxAnswerOptionFields
            qItem={qItem}
            options={options}
            answers={answers}
            feedback={feedback}
            readOnly={readOnly}
            onCheckedChange={handleCheckedChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default ChoiceCheckboxAnswerOptionItem;
