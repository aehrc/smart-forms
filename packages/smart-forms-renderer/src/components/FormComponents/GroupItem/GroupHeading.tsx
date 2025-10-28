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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { QuestionnaireItem } from 'fhir/r4';
import { getContextDisplays } from '../../../utils/tabs';
import ContextDisplayItem from '../ItemParts/ContextDisplayItem';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { useRendererConfigStore } from '../../../stores';
import RequiredAsterisk from '../ItemParts/RequiredAsterisk';
import ItemTextSwitcher from '../ItemParts/ItemTextSwitcher';
import FlyoverItem from '../ItemParts/FlyoverItem';
import { getHeadingTag } from '../../../utils/headingVariant';
import type { PropsWithParentStylesAttribute } from '../../../interfaces/renderProps.interface';

interface GroupHeadingProps extends PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  groupCardElevation: number;
  tabIsMarkedAsComplete?: boolean;
  pageIsMarkedAsComplete?: boolean;
}

const GroupHeading = memo(function GroupHeading(props: GroupHeadingProps) {
  const {
    qItem,
    readOnly,
    groupCardElevation,
    tabIsMarkedAsComplete,
    pageIsMarkedAsComplete,
    parentStyles
  } = props;

  const requiredIndicatorPosition = useRendererConfigStore.use.requiredIndicatorPosition();

  const { required, displayFlyover } = useRenderingExtensions(qItem);
  const contextDisplayItems = getContextDisplays(qItem);

  const isTabHeading = tabIsMarkedAsComplete !== undefined;
  const isPageHeading = pageIsMarkedAsComplete !== undefined;

  // Get text color from parent styles if available
  const textColor =
    parentStyles?.color ||
    (readOnly && (!isTabHeading || !isPageHeading) ? 'text.secondary' : 'text.primary');

  return (
    <>
      <Box display="flex" alignItems="center" width="100%">
        <Box position="relative" display="flex" flexGrow={1} alignItems="center">
          {/* Group Heading typography */}
          {/* flexGrow: 1 is important if xhtml and markdown rendering has width: 100% */}
          <Typography
            component={getHeadingTag(groupCardElevation)}
            variant="groupHeading"
            color={textColor}
            display="flex"
            alignItems="center"
            sx={{ flexGrow: 1, ...(parentStyles || {}) }}>
            {/* Required asterisk position is in front of text */}
            {required && requiredIndicatorPosition === 'start' ? (
              <RequiredAsterisk
                sx={{ position: 'absolute', top: 0, left: -8 }} // Adjust top and left values as needed
              >
                *
              </RequiredAsterisk>
            ) : null}
            <ItemTextSwitcher qItem={qItem} />

            {/* Required asterisk position is behind text */}
            {required && requiredIndicatorPosition === 'end' ? (
              <RequiredAsterisk readOnly={readOnly} variant="groupHeading">
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
    </>
  );
});

export default GroupHeading;
