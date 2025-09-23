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
import TextField from './TextField';
import useStringCalculatedExpression from '../../../hooks/useStringCalculatedExpression';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';
import useShowFeedback from '../../../hooks/useShowFeedback';
import { readStringValue } from '../../../utils/readValues';
import type { QuestionnaireResponseItem } from 'fhir/r4';

function TextItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
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

  // Provides a way to hide the feedback when the user is typing
  const { showFeedback, setShowFeedback, hasBlurred, setHasBlurred } = useShowFeedback();

  // Process calculated expressions
  const { calcExpUpdated } = useStringCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    onChangeByCalcExpressionString: (newValueString: string) => {
      setInput(newValueString);
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueString: newValueString }]
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
    setInput(newInput);

    // Only suppress feedback once (before first blur)
    if (!hasBlurred) {
      setShowFeedback(false);
    }

    updateQrItemWithDebounce(newInput);
  }

  function handleBlur() {
    setShowFeedback(true);
    setHasBlurred(true); // From now on, feedback should stay visible
  }

  function handleRepopulateSync(newQrItem: QuestionnaireResponseItem | null) {
    if (newQrItem && newQrItem?.answer) {
      const { valueString: newValueString, initialInput: newInput } = readStringValue(newQrItem);

      setInput(newInput);
      onQrItemChange(
        {
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueString: newValueString }]
        },
        itemPath
      );
      return;
    }

    // At this point newQrItem is null, so create an QRItem to replace it
    setInput('');
    onQrItemChange(createEmptyQrItem(qItem, answerKey), itemPath);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      if (input !== '') {
        onQrItemChange({ ...emptyQrItem, answer: [{ id: answerKey, valueString: input }] });
      } else {
        onQrItemChange(emptyQrItem);
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <TextField
        qItem={qItem}
        input={input}
        feedback={showFeedback ? feedback : ''}
        renderingExtensions={renderingExtensions}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        onInputChange={handleInputChange}
        onRepopulateSync={handleRepopulateSync}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-text-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <TextField
            qItem={qItem}
            input={input}
            feedback={showFeedback ? feedback : ''}
            renderingExtensions={renderingExtensions}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
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

export default TextItem;
