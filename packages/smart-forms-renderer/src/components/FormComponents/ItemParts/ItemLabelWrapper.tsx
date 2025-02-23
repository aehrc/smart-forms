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

import React from 'react';
import Box from '@mui/material/Box';
import ContextDisplayItem from './ContextDisplayItem';
import type { QuestionnaireItem } from 'fhir/r4';
import { getContextDisplays } from '../../../utils/tabs';
import ItemLabelText from './ItemLabelText';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { useRendererStylingStore } from '../../../stores';
import RequiredAsterisk from './RequiredAsterisk';

interface LabelWrapperProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
}

function ItemLabelWrapper(props: LabelWrapperProps) {
  const { qItem, readOnly } = props;

  const requiredIndicatorPosition = useRendererStylingStore.use.requiredIndicatorPosition();

  const { required } = useRenderingExtensions(qItem);
  const contextDisplayItems = getContextDisplays(qItem);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box position="relative" flexGrow={1}>
        {required && requiredIndicatorPosition === 'start' ? (
          <RequiredAsterisk
            sx={{ position: 'absolute', top: 0, left: -8 }} // Adjust top and left values as needed
          >
            *
          </RequiredAsterisk>
        ) : null}
        <ItemLabelText qItem={qItem} readOnly={readOnly} />
      </Box>

      <Box display="flex" columnGap={0.5}>
        {contextDisplayItems.map((item) => {
          return <ContextDisplayItem key={item.linkId} displayItem={item} />;
        })}
      </Box>
    </Box>
  );
}

export default ItemLabelWrapper;
