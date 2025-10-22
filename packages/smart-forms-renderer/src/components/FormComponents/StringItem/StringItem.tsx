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

import type { QuestionnaireResponseItem } from 'fhir/r4';
import debounce from 'lodash.debounce';
import { useCallback, useState } from 'react';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid, { getInstructionsId } from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import { readStringValue } from '../../../utils/readValues';
import { sanitizeInput } from '../../../utils/inputSanitization';
import StringField from './StringField';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';

function StringItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    calcExpUpdated,
    parentStyles,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const { initialInput } = readStringValue(qrItem);

  const [input, setInput] = useState(initialInput);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Get instructions for accessibility
  const { displayInstructions } = useRenderingExtensions(qItem);
  const instructionsId = getInstructionsId(qItem, displayInstructions, !!feedback);

  // Event handlers
  function handleChange(newInput: string) {
    setInput(newInput);

    updateQrItemWithDebounce(newInput);
  }

  function handleRepopulateSync(newQrItem: QuestionnaireResponseItem | null) {
    if (newQrItem && newQrItem?.answer) {
      const { valueString: newValueString, initialInput: newInput } = readStringValue(newQrItem);

      setInput(newInput);
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueString: sanitizeInput(newValueString) }]
      });
      return;
    }

    // At this point newQrItem is null, so create an QRItem to replace it
    setInput('');
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      if (input !== '') {
        onQrItemChange({
          ...emptyQrItem,
          answer: [{ id: answerKey, valueString: sanitizeInput(input) }]
        });
      } else {
        onQrItemChange(emptyQrItem);
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <StringField
        qItem={qItem}
        input={input}
        feedback={feedback ?? ''}
        renderingExtensions={renderingExtensions}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        instructionsId={instructionsId}
        onInputChange={handleChange}
        onRepopulateSync={handleRepopulateSync}
        isTabled={isTabled}
      />
    );
  }
  return (
    <FullWidthFormComponentBox
      data-test="q-item-string-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} parentStyles={parentStyles} />}
        fieldChildren={
          <StringField
            qItem={qItem}
            input={input}
            feedback={feedback ?? ''}
            renderingExtensions={renderingExtensions}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            instructionsId={instructionsId}
            onInputChange={handleChange}
            onRepopulateSync={handleRepopulateSync}
            isTabled={isTabled}
          />
        }
        feedback={feedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default StringItem;
