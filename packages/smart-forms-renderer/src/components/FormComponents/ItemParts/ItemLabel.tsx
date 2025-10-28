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
import type { QuestionnaireItem } from 'fhir/r4';
import Box from '@mui/material/Box';
import { useRendererConfigStore } from '../../../stores/rendererConfigStore';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import RequiredAsterisk from './RequiredAsterisk';
import { getContextDisplays } from '../../../utils/tabs';
import ContextDisplayItem from './ContextDisplayItem';
import ItemTextSwitcher from './ItemTextSwitcher';
import Typography from '@mui/material/Typography';
import FlyoverItem from './FlyoverItem';
import type { PropsWithParentStylesAttribute } from '../../../interfaces/renderProps.interface';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { default as parseStyleToJs } from 'style-to-js';

interface ItemLabelProps extends PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  isDisplayItem?: boolean;
}

const ItemLabel = memo(function ItemLabel(props: ItemLabelProps) {
  const { qItem, readOnly, isDisplayItem, parentStyles } = props;

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const requiredIndicatorPosition = useRendererConfigStore.use.requiredIndicatorPosition();

  const { required, displayFlyover } = useRenderingExtensions(qItem);
  const contextDisplayItems = getContextDisplays(qItem);

  // is item is a display item, it should not use the "label" variant
  const component = isDisplayItem ? 'span' : 'label';
  const variant = isDisplayItem ? undefined : 'label';

  // Get text color from parent styles if available
  const readOnlyTextColor = readOnlyVisualStyle === 'disabled' ? 'text.disabled' : 'text.secondary';
  const textColor = parentStyles?.color || (readOnly ? readOnlyTextColor : 'text.primary');

  // Get styles from qItem._text
  const stylesString = structuredDataCapture.getStyle(qItem._text);
  const itemStyles = stylesString ? parseStyleToJs(stylesString) : {};

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Box position="relative" display="flex" flexGrow={1} alignItems="center">
        {/* Label typography */}
        {/* Added 0.5 marginTop (4px) because item labels doesn't look in line with their fields */}
        {/* flexGrow: 1 is important if xhtml and markdown rendering has width: 100% */}
        <Typography
          id={'label-' + qItem.linkId}
          component={component}
          variant={variant}
          htmlFor={qItem.type + '-' + qItem.linkId}
          color={textColor}
          sx={{
            mt: 0.5,
            flexGrow: 1,
            ...(parentStyles || {}),
            ...itemStyles
          }}>
          {/* Required asterisk position is in front of text */}
          {required && requiredIndicatorPosition === 'start' ? (
            <RequiredAsterisk
              readOnly={readOnly}
              variant={variant}
              sx={{ position: 'absolute', top: 4, left: -8 }}>
              *
            </RequiredAsterisk>
          ) : null}

          <ItemTextSwitcher qItem={qItem} />

          {/* Required asterisk position is behind text */}
          {required && requiredIndicatorPosition === 'end' ? (
            <RequiredAsterisk readOnly={readOnly} variant={variant}>
              *
            </RequiredAsterisk>
          ) : null}

          {/* Flyover */}
          {displayFlyover !== '' ? (
            <Typography component="span" sx={{ ml: 0.75 }}>
              <FlyoverItem displayFlyover={displayFlyover} readOnly={readOnly} />
            </Typography>
          ) : null}
        </Typography>
      </Box>

      <Box display="flex" columnGap={0.5}>
        {contextDisplayItems.map((item) => {
          return <ContextDisplayItem key={item.linkId} displayItem={item} />;
        })}
      </Box>
    </Box>
  );
});

export default ItemLabel;
