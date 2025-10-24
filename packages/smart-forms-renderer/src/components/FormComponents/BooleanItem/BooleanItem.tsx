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

import Box from '@mui/material/Box';
import useReadOnly from '../../../hooks/useReadOnly';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid, { getInstructionsId } from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import BooleanField from './BooleanField';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';

function BooleanItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    parentIsReadOnly,
    feedbackFromParent,
    calcExpUpdated,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks - there's no string-based input here
  const feedback = useValidationFeedback(qItem, feedbackFromParent);

  // Get instructions ID for aria-describedby
  const { displayInstructions } = useRenderingExtensions(qItem);
  const instructionsId = getInstructionsId(qItem, displayInstructions, !!feedback);

  // Init input value
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueBoolean: boolean | undefined = undefined;
  if (qrItem?.answer?.[0]?.valueBoolean !== undefined) {
    valueBoolean = qrItem.answer[0].valueBoolean;
  }

  // Event handlers
  function handleValueChange(newValue: string) {
    switch (newValue) {
      case 'true':
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueBoolean: true }]
        });
        break;
      case 'false':
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: [{ id: answerKey, valueBoolean: false }]
        });
        break;
      default:
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
        break;
    }
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem, answerKey));
  }

  if (isTabled) {
    return (
      <Box display="flex" justifyContent="center">
        <BooleanField
          qItem={qItem}
          readOnly={readOnly}
          valueBoolean={valueBoolean}
          feedback={feedback}
          calcExpUpdated={calcExpUpdated}
          instructionsId={instructionsId}
          onCheckedChange={handleValueChange}
          onClear={handleClear}
        />
      </Box>
    );
  }

  if (isRepeated) {
    return (
      <BooleanField
        qItem={qItem}
        readOnly={readOnly}
        valueBoolean={valueBoolean}
        feedback={feedback}
        calcExpUpdated={calcExpUpdated}
        instructionsId={instructionsId}
        onCheckedChange={handleValueChange}
        onClear={handleClear}
      />
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-boolean-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <BooleanField
            qItem={qItem}
            readOnly={readOnly}
            valueBoolean={valueBoolean}
            feedback={feedback}
            calcExpUpdated={calcExpUpdated}
            instructionsId={instructionsId}
            onCheckedChange={handleValueChange}
            onClear={handleClear}
          />
        }
      />
    </FullWidthFormComponentBox>
  );
}

export default BooleanItem;
