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
import UrlField from './UrlField';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import ItemLabel from '../ItemParts/ItemLabel';
import { sanitizeInput } from '../../../utils/inputSanitization';

function UrlItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    renderingExtensions,
    isRepeated,
    isTabled,
    parentIsReadOnly,
    feedbackFromParent,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const { displayUnit, displayPrompt, entryFormat } = renderingExtensions;

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueUri = '';
  if (qrItem?.answer && qrItem?.answer[0].valueUri) {
    valueUri = qrItem.answer[0].valueUri;
  }

  const [input, setInput] = useState(valueUri);

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Event handlers
  function handleChange(newInput: string) {
    setInput(newInput);

    updateQrItemWithDebounce(newInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((input: string) => {
      const emptyQrItem = createEmptyQrItem(qItem, answerKey);
      if (input !== '') {
        onQrItemChange({
          ...emptyQrItem,
          answer: [{ id: answerKey, valueUri: sanitizeInput(input) }]
        });
      } else {
        onQrItemChange(emptyQrItem);
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <UrlField
        linkId={qItem.linkId}
        itemType={qItem.type}
        input={input}
        feedback={feedback ?? ''}
        displayPrompt={displayPrompt}
        displayUnit={displayUnit}
        entryFormat={entryFormat}
        readOnly={readOnly}
        onInputChange={handleChange}
        isTabled={isTabled}
      />
    );
  }
  return (
    <FullWidthFormComponentBox
      data-test="q-item-url-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <UrlField
            linkId={qItem.linkId}
            itemType={qItem.type}
            input={input}
            feedback={feedback ?? ''}
            displayPrompt={displayPrompt}
            displayUnit={displayUnit}
            entryFormat={entryFormat}
            readOnly={readOnly}
            onInputChange={handleChange}
            isTabled={isTabled}
          />
        }
        feedback={feedback ?? undefined}
      />
    </FullWidthFormComponentBox>
  );
}

export default UrlItem;
