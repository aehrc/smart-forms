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

import React, { useCallback } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import debounce from 'lodash.debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { FullWidthFormComponentBox } from '../../Box.styles';
import IntegerField from './IntegerField';
import useIntegerCalculatedExpression from '../../../hooks/useIntegerCalculatedExpression';
import { parseValidInteger } from '../../../utils/parseInputs';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useNumberInput from '../../../hooks/useNumberInput';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';

interface IntegerItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function IntegerItem(props: IntegerItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  // Init input value
  let valueInteger = 0;
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueInteger) {
      valueInteger = qrItem.answer[0].valueInteger;
    }
    if (qrItem?.answer[0].valueDecimal) {
      valueInteger = Math.round(qrItem.answer[0].valueDecimal);
    }
  }
  const [value, setValue] = useNumberInput(valueInteger);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, value.toString());

  // Process calculated expressions
  const { calcExpUpdated } = useIntegerCalculatedExpression({
    qItem: qItem,
    inputValue: value,
    setInputValue: (newValue) => {
      setValue(newValue);
    },
    onQrItemChange: onQrItemChange
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const newValue = parseValidInteger(newInput);

    setValue(newValue);
    updateQrItemWithDebounce(newValue);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((newValue: number) => {
      onQrItemChange({
        ...createEmptyQrItem(qItem),
        answer: [{ valueInteger: newValue }]
      });
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <IntegerField
        linkId={qItem.linkId}
        value={value}
        feedback={feedback}
        displayPrompt={displayPrompt}
        displayUnit={displayUnit}
        entryFormat={entryFormat}
        readOnly={readOnly}
        calcExpUpdated={calcExpUpdated}
        isTabled={isTabled}
        onInputChange={handleInputChange}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-integer-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <IntegerField
          linkId={qItem.linkId}
          value={value}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onInputChange={handleInputChange}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default IntegerItem;
