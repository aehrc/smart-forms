/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import React from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import BooleanField from './BooleanField';
import Box from '@mui/material/Box';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';

interface BooleanItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function BooleanItem(props: BooleanItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const valueBoolean = qrItem?.answer && qrItem.answer[0].valueBoolean;

  // Init input value
  let checked = false;
  if (qrItem?.answer && qrItem.answer[0].valueBoolean) {
    checked = qrItem?.answer?.[0].valueBoolean;
  }

  // Event handlers
  function handleCheckedChange(newChecked: boolean) {
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueBoolean: newChecked }]
    });
  }

  function handleClear() {
    onQrItemChange(createEmptyQrItem(qItem));
  }

  if (isTabled) {
    return (
      <Box display="flex" justifyContent="center">
        <BooleanField
          checked={checked}
          readOnly={readOnly}
          isTabled={isTabled}
          valueBoolean={valueBoolean}
          onCheckedChange={handleCheckedChange}
          onClear={handleClear}
        />
      </Box>
    );
  }

  if (isRepeated) {
    return (
      <BooleanField
        checked={checked}
        readOnly={readOnly}
        isTabled={isTabled}
        valueBoolean={valueBoolean}
        onCheckedChange={handleCheckedChange}
        onClear={handleClear}
      />
    );
  }
  return (
    <FullWidthFormComponentBox
      data-test="q-item-boolean-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <BooleanField
          checked={checked}
          readOnly={readOnly}
          isTabled={isTabled}
          valueBoolean={valueBoolean}
          onCheckedChange={handleCheckedChange}
          onClear={handleClear}
        />
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default BooleanItem;
