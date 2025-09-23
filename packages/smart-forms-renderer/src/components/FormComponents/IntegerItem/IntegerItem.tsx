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

import React, { useCallback, useState } from 'react';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import debounce from 'lodash.debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { FullWidthFormComponentBox } from '../../Box.styles';
import IntegerField from './IntegerField';
import useIntegerCalculatedExpression from '../../../hooks/useIntegerCalculatedExpression';
import { parseIntegerString } from '../../../utils/parseInputs';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';
import useShowFeedback from '../../../hooks/useShowFeedback';
import { readIntegerValue } from '../../../utils/readValues';
import type { QuestionnaireResponseItem } from 'fhir/r4';

function IntegerItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  const { initialInput } = readIntegerValue(qrItem);

  const [input, setInput] = useState(initialInput);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Provides a way to hide the feedback when the user is typing
  const { showFeedback, setShowFeedback, hasBlurred, setHasBlurred } = useShowFeedback();

  // Process calculated expressions
  const { calcExpUpdated } = useIntegerCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    onChangeByCalcExpressionInteger: (newValueInteger: number) => {
      setInput(newValueInteger.toString());
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueInteger: newValueInteger }]
        },
        itemPath
      );
    },
    onChangeByCalcExpressionNull: () => {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
    }
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const parsedNewInput = parseIntegerString(newInput);

    setInput(parsedNewInput);

    // Only suppress feedback once (before first blur)
    if (!hasBlurred) {
      setShowFeedback(false);
    }

    updateQrItemWithDebounce(parsedNewInput);
  }

  function handleBlur() {
    setShowFeedback(true);
    setHasBlurred(true); // From now on, feedback should stay visible
  }

  function handleRepopulateSync(newQrItem: QuestionnaireResponseItem | null) {
    if (newQrItem && newQrItem?.answer) {
      const { valueInteger: newValueInteger, initialInput: newInput } = readIntegerValue(newQrItem);

      setInput(newInput);
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueInteger: newValueInteger }]
        },
        itemPath
      );
      return;
    }

    // At this point newQrItem is null, so create a QRItem to replace it
    setInput('');
    onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      if (parsedNewInput === '') {
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
      } else {
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueInteger: parseInt(parsedNewInput) }]
        });
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <IntegerField
        qItem={qItem}
        input={input}
        feedback={showFeedback ? feedback : ''}
        renderingExtensions={renderingExtensions}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onInputChange={handleInputChange}
        onRepopulateSync={handleRepopulateSync}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-integer-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <IntegerField
            qItem={qItem}
            input={input}
            feedback={showFeedback ? feedback : ''}
            renderingExtensions={renderingExtensions}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            onInputChange={handleInputChange}
            onRepopulateSync={handleRepopulateSync}
            onBlur={handleBlur}
          />
        }
        feedback={showFeedback ? feedback : undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default IntegerItem;
