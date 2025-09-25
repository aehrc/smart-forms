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

import React from 'react';
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import OpenChoiceSelectAnswerOptionField from './OpenChoiceSelectAnswerOptionField';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';
import type { AutocompleteChangeReason } from '@mui/material';
import { sanitizeInput } from '../../../utils/inputSanitization';

interface OpenChoiceSelectAnswerOptionItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function OpenChoiceSelectAnswerOptionItem(props: OpenChoiceSelectAnswerOptionItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);
  let valueSelect: QuestionnaireItemAnswerOption | string | null = null;
  if (qrOpenChoice.answer) {
    valueSelect = qrOpenChoice.answer[0] ?? null;
  }

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  // Event handlers
  // Handler function which handles both input change and selection change
  function handleValueChange(
    newValue: QuestionnaireItemAnswerOption | string | null,
    reason: AutocompleteChangeReason | string
  ) {
    //if the reason is reset, then we don't change the value, otherwise you will end up with looped setState calls
    if (reason === 'reset') {
      // console.log("Reason: ", reason)
      return;
    }
    if (newValue) {
      //If the value is a string (i.e from freeSolo input)
      if (typeof newValue === 'string') {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueString: sanitizeInput(newValue) }]
        });
        return;
      }

      //If the value is not a string, then it is a coding.
      const option = newValue;
      if (option['valueCoding']) {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueCoding: option.valueCoding }]
        });
      } else if (option['valueString']) {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueString: sanitizeInput(option.valueString) }]
        });
      } else if (option['valueInteger']) {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueInteger: option.valueInteger }]
        });
      }
      return;
    }
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isRepeated) {
    return (
      <OpenChoiceSelectAnswerOptionField
        qItem={qItem}
        options={answerOptions}
        valueSelect={valueSelect}
        feedback={feedback}
        readOnly={readOnly}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-select-answer-option-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <OpenChoiceSelectAnswerOptionField
            qItem={qItem}
            options={answerOptions}
            valueSelect={valueSelect}
            feedback={feedback}
            readOnly={readOnly}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            onValueChange={handleValueChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerOptionItem;
