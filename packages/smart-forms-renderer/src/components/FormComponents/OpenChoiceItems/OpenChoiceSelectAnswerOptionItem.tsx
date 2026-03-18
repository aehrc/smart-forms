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

import type { Coding } from 'fhir/r4';
import useReadOnly from '../../../hooks/useReadOnly';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { createEmptyQrItem, getQRItemId } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid, { getInstructionsId } from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import { sanitizeInput } from '../../../utils/inputSanitization';
import CustomOpenChoiceField from './CustomOpenChoiceField';

function OpenChoiceSelectAnswerOptionItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange,
    calcExpUpdated
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Get instructions ID for aria-describedby
  const { displayInstructions } = useRenderingExtensions(qItem);
  const instructionsId = getInstructionsId(qItem, displayInstructions, !!feedback);

  // Init input value
  const answerKey = getQRItemId(qrItem?.answer?.[0]?.id);
  const answerOptions = qItem.answerOption;
  if (!answerOptions) return null;

  // Convert answerOptions to Coding format for CustomOpenChoiceField
  const codingOptions: Coding[] = answerOptions
    .map((opt) => opt.valueCoding)
    .filter((coding): coding is Coding => Boolean(coding));

  const qrOpenChoice = qrItem ?? createEmptyQrItem(qItem, answerKey);

  // Get current value as Coding or string
  let valueAutocomplete: Coding | string = '';
  if (qrOpenChoice.answer && qrOpenChoice.answer[0]) {
    const answer = qrOpenChoice.answer[0];
    if (answer.valueCoding) {
      valueAutocomplete = answer.valueCoding;
    } else if (answer.valueString) {
      valueAutocomplete = answer.valueString;
    }
  }

  // Event handlers
  // Handler function which handles both input change and selection change
  function handleValueChange(newValue: Coding | string | null, reason: string) {
    if (reason === 'reset') {
      return;
    }

    if (!newValue) {
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
      return;
    }

    // If the value is a string (custom input)
    if (typeof newValue === 'string') {
      onQrItemChange({
        ...qrOpenChoice,
        answer: [{ id: answerKey, valueString: sanitizeInput(newValue) }]
      });
      return;
    }

    // If the value is a Coding (selected from dropdown)
    onQrItemChange({
      ...qrOpenChoice,
      answer: [{ id: answerKey, valueCoding: newValue }]
    });
  }

  if (isRepeated) {
    return (
      <CustomOpenChoiceField
        qItem={qItem}
        options={codingOptions}
        valueAutocomplete={valueAutocomplete}
        loading={false}
        feedback={feedback ? { message: feedback, color: 'error' } : null}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        instructionsId={instructionsId}
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
          <CustomOpenChoiceField
            qItem={qItem}
            options={codingOptions}
            valueAutocomplete={valueAutocomplete}
            loading={false}
            feedback={feedback ? { message: feedback, color: 'error' } : null}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            instructionsId={instructionsId}
            onValueChange={handleValueChange}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default OpenChoiceSelectAnswerOptionItem;
