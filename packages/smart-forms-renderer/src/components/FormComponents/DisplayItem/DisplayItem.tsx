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

import React, { memo } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { FullWidthFormComponentBox } from '../../Box.styles';
import { isSpecificItemControl } from '../../../utils';
import { useQuestionnaireStore } from '../../../stores';
import useReadOnly from '../../../hooks/useReadOnly';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute
} from '../../../interfaces/renderProps.interface';
import Divider from '@mui/material/Divider';
import ItemLabel from '../ItemParts/ItemLabel';
import type { RenderingExtensions } from '../../../hooks/useRenderingExtensions';

interface DisplayItemProps
  extends PropsWithParentIsReadOnlyAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem?: QuestionnaireResponseItem | null;
  renderingExtensions?: RenderingExtensions;
}

const DisplayItem = memo(function DisplayItem(props: DisplayItemProps) {
  const { qItem, parentIsReadOnly, parentStyles } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const isContextDisplay = isSpecificItemControl(qItem, 'context-display');
  if (isContextDisplay) {
    return null;
  }

  const isFlyover = isSpecificItemControl(qItem, 'flyover');
  if (isFlyover) {
    return null;
  }

  const isDivider = isSpecificItemControl(qItem, 'divider');
  if (isDivider) {
    return <Divider sx={{ mt: 1.5, mb: 1 }} />;
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-display-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      width="100%"
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemLabel
        qItem={qItem}
        readOnly={readOnly}
        isDisplayItem={true}
        parentStyles={parentStyles}
      />
    </FullWidthFormComponentBox>
  );
});

export default DisplayItem;
