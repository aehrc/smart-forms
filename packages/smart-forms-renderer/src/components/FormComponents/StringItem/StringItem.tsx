/* eslint-disable prettier/prettier */
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

import React, { useCallback, useState } from 'react';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import debounce from 'lodash.debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { FullWidthFormComponentBox } from '../../Box.styles';
import StringField from './StringField';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useStringCalculatedExpression from '../../../hooks/useStringCalculatedExpression';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';

interface StringItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  parentStyles?: Record<string, string>;
}
function StringItem(props: StringItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange,
    parentStyles
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueString = '';
  if (qrItem?.answer && qrItem?.answer[0].valueString) {
    valueString = qrItem.answer[0].valueString;
  }

  const [input, setInput] = useState(valueString);
  const [showFeedback, setShowFeedback] = useState(true); //provides a way to hide the feedback when the user is typing


  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent, input);

  // Process calculated expressions
  const { calcExpUpdated } = useStringCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    onChangeByCalcExpressionString: (newValueString: string) => {
      setInput(newValueString);
      onQrItemChange({
        ...createEmptyQrItem(qItem, answerKey),
        answer: [{ id: answerKey, valueString: newValueString }]
      });
    },
    onChangeByCalcExpressionNull: () => {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem, answerKey));
    }
  });

  // Event handlers
  function handleChange(newInput: string) {
     setInput(newInput);
     updateQrItemWithDebounce(newInput);
     setShowFeedback(false);
  }

  function handleBlur() {
    setShowFeedback(true);
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
      <StringField
        linkId={qItem.linkId}
        itemType={qItem.type}
        input={input}
        feedback={showFeedback ? feedback : ''}
        displayPrompt={displayPrompt}
        displayUnit={displayUnit}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        onInputChange={handleChange}
        onBlur={handleBlur}
        isTabled={isTabled}
      />
    );
  }
  return (
    <FullWidthFormComponentBox
      data-test="q-item-string-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} parentStyles={parentStyles} />}
        fieldChildren={
          <StringField
            linkId={qItem.linkId}
            itemType={qItem.type}
            input={input}
            feedback={showFeedback ? feedback : ''}
            displayPrompt={displayPrompt}
            displayUnit={displayUnit}
            entryFormat={entryFormat}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            onInputChange={handleChange}
            onBlur={handleBlur}
            isTabled={isTabled}
          />
        }
        feedback={feedback}
      />
    </FullWidthFormComponentBox>
  );
}

export default StringItem;
