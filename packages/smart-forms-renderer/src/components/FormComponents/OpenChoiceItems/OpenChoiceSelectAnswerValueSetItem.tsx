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
import type { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValueSetCodings from '../../../hooks/useValueSetCodings';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import OpenChoiceSelectAnswerValueSetField from './OpenChoiceSelectAnswerValueSetField';
import useReadOnly from '../../../hooks/useReadOnly';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import { useQuestionnaireStore } from '../../../stores';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import ItemLabel from '../ItemParts/ItemLabel';
import type { AutocompleteChangeReason } from '@mui/material';
import { sanitizeInput } from '../../../utils/inputSanitization';

interface OpenChoiceSelectAnswerValueSetItemProps
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

function OpenChoiceSelectAnswerValueSetItem(props: OpenChoiceSelectAnswerValueSetItemProps) {
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
  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);

  let valueSelect: Coding | string | null = null;
  if (qrOpenChoice['answer']) {
    //check if answer has valueCoding or valueString and assign it to valueSelect and null if not present
    if (qrOpenChoice['answer'][0].valueString) {
      valueSelect = qrOpenChoice['answer'][0].valueString;
    } else if (qrOpenChoice['answer'][0].valueCoding) {
      valueSelect = qrOpenChoice['answer'][0].valueCoding;
    } else {
      valueSelect = null;
    }
  }

  // TODO Process calculated expressions
  // This requires its own hook, because in the case of multi-select, we need to check if the value is already checked to prevent an infinite loop
  // This will be done after the choice/open-choice refactoring

  // Get codings/options from valueSet
  // TODO use dynamicCodingsUpdated to trigger a "refresh" icon when codings are dynamically updated
  const { codings, terminologyError } = useValueSetCodings(qItem);

  // Event handlers
  // Handler function which handles both input change and selection change
  function handleValueChange(
    newValue: Coding | string | null,
    reason: AutocompleteChangeReason | string
  ) {
    //if the reason is reset, then we don't change the value, otherwise you will end up with looped setState calls

    if (reason === 'reset') {
      return;
    }

    if (newValue) {
      if (typeof newValue === 'string') {
        // Check if the newValue is in the options, first check options.display, then check options.code
        const foundOption = codings.find((option) => {
          if (option.display) {
            return option.display === newValue;
          }
          return option.code === newValue;
        });

        //if the option.display is not present, then compare to code.

        if (foundOption) {
          newValue = foundOption;
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ id: answerKey, valueCoding: newValue }]
          });
        } //if newValue is not in the options list, treat it as a string
        else {
          onQrItemChange({
            ...qrOpenChoice,
            answer: [{ id: answerKey, valueString: sanitizeInput(newValue) }]
          });
        }
      } //if the newValue is not a string, then it is coding
      else {
        onQrItemChange({
          ...qrOpenChoice,
          answer: [{ id: answerKey, valueCoding: newValue }]
        });
      }
      return;
    }

    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isRepeated) {
    return (
      <OpenChoiceSelectAnswerValueSetField
        qItem={qItem}
        options={codings}
        valueSelect={valueSelect}
        terminologyError={terminologyError}
        feedback={feedback}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        readOnly={readOnly}
        onValueChange={handleValueChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-open-choice-select-answer-value-set-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <OpenChoiceSelectAnswerValueSetField
            qItem={qItem}
            options={codings}
            valueSelect={valueSelect}
            terminologyError={terminologyError}
            feedback={feedback}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            readOnly={readOnly}
            onValueChange={handleValueChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerValueSetItem;
