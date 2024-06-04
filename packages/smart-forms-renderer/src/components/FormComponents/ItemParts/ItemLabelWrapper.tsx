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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import Iconify from '../../Iconify/Iconify';

interface LabelWrapperProps {
  qItem: QuestionnaireItem;
  readOnly: boolean;
}

function ItemLabelWrapper(props: LabelWrapperProps) {
  const { qItem, readOnly } = props;

  const { required, displayFlyover } = useRenderingExtensions(qItem);
  const contextDisplayItems = getContextDisplays(qItem);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Tooltip
        title={displayFlyover}
        placement="top"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -8]
                }
              }
            ]
          }
        }}>
        <span>
          <Box display="flex" columnGap={0.4} justifyContent="space-between" alignItems="center">
            {required ? (
              <Typography color="red" sx={{ ml: -1.15 }}>
                *
              </Typography>
            ) : null}
            <ItemLabelText qItem={qItem} readOnly={readOnly} />
            {displayFlyover !== '' ? (
              <Iconify
                icon="mdi:information-outline"
                sx={{ height: 16, width: 16, mt: 0.25, ml: 0.25, color: 'text.secondary' }}
              />
            ) : null}
          </Box>
        </span>
      </Tooltip>

      <Box display="flex" columnGap={0.5}>
        {contextDisplayItems.map((item) => {
          return <ContextDisplayItem key={item.linkId} displayItem={item} />;
        })}
      </Box>
    </Box>
  );
}

export default ItemLabelWrapper;
