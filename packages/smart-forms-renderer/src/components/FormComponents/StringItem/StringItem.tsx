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

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import debounce from 'lodash.debounce';
import { useCallback, useState } from 'react';
import useReadOnly from '../../../hooks/useReadOnly';
import useShowFeedback from '../../../hooks/useShowFeedback';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type {
  PropsWithCalculatedExpressionAnimatingAttribute,
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledRequiredAttribute,
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import StringField from './StringField';

interface StringItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledRequiredAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithCalculatedExpressionAnimatingAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
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
    calcExprAnimating,
    parentStyles,
    onQrItemChange
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

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Provides a way to hide the feedback when the user is typing
  const { showFeedback, setShowFeedback, hasBlurred, setHasBlurred } = useShowFeedback();

  // Event handlers
  function handleChange(newInput: string) {
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
        calcExprAnimating={calcExprAnimating}
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
            calcExprAnimating={calcExprAnimating}
            onInputChange={handleChange}
            onBlur={handleBlur}
            isTabled={isTabled}
          />
        }
        feedback={showFeedback ? feedback : undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default StringItem;
