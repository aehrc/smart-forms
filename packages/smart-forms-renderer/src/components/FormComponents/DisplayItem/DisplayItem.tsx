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

import React, { memo } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { FullWidthFormComponentBox } from '../../Box.styles';
import { isSpecificItemControl } from '../../../utils';
import LabelWrapper from '../ItemParts/ItemLabelWrapper';
import { useQuestionnaireStore } from '../../../stores';

interface DisplayItemProps {
  qItem: QuestionnaireItem;
}

const DisplayItem = memo(function DisplayItem(props: DisplayItemProps) {
  const { qItem } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const isContextDisplay = isSpecificItemControl(qItem, 'context-display');
  if (isContextDisplay) {
    return null;
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-display-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <LabelWrapper qItem={qItem} readOnly={false} />
    </FullWidthFormComponentBox>
  );
});

export default DisplayItem;
