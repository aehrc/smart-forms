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
import { useCallback, useState } from 'react';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { getDecimalPrecision } from '../../../utils/extensions';
import {
  parseDecimalStringToFloat,
  parseDecimalStringWithPrecision
} from '../../../utils/parseInputs';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid, { getInstructionsId } from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import type { QuestionnaireResponseItem } from 'fhir/r4';
import { readDecimalValue } from '../../../utils/readValues';
import DecimalField from './DecimalField';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';

function DecimalItem(props: BaseItemProps) {
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

  const precision = getDecimalPrecision(qItem);

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const { initialInput } = readDecimalValue(qrItem, precision);

  const [input, setInput] = useState(initialInput);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Get instructions for accessibility
  const { displayInstructions } = useRenderingExtensions(qItem);
  const instructionsId = getInstructionsId(qItem, displayInstructions, !!feedback);

  // Event handlers
  function handleInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setInput(parsedNewInput);
    updateQrItemWithDebounce(parsedNewInput);
  }

  function handleRepopulateSync(newQrItem: QuestionnaireResponseItem | null) {
    if (newQrItem && newQrItem?.answer) {
      const { valueDecimal: newValueDecimal, initialInput: newInput } = readDecimalValue(
        newQrItem,
        precision
      );

      setInput(newInput);
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueDecimal: newValueDecimal }]
      });
      return;
    }

    // At this point newQrItem is null, so create an QRItem to replace it
    setInput('');
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      if (parsedNewInput === '') {
        onQrItemChange(emptyQrItem);
      } else {
        onQrItemChange({
          ...emptyQrItem,
          answer: precision
            ? [
                {
                  id: answerKey,
                  valueDecimal: parseDecimalStringToFloat(parsedNewInput, precision)
                }
              ]
            : [{ id: answerKey, valueDecimal: parseFloat(parsedNewInput) }]
        });
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, precision]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <DecimalField
        qItem={qItem}
        input={input}
        feedback={feedback ?? ''}
        renderingExtensions={renderingExtensions}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        instructionsId={instructionsId}
        onInputChange={handleInputChange}
        onRepopulateSync={handleRepopulateSync}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-decimal-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <DecimalField
            qItem={qItem}
            input={input}
            feedback={feedback ?? ''}
            renderingExtensions={renderingExtensions}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            instructionsId={instructionsId}
            onInputChange={handleInputChange}
            onRepopulateSync={handleRepopulateSync}
          />
        }
        feedback={feedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default DecimalItem;
