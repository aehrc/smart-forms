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
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import type { PropsWithIsRepeatedAttribute } from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem } from 'fhir/r4';
import { getContextDisplays } from '../../../utils/tabs';
import ContextDisplayItem from '../ItemParts/ContextDisplayItem';
import ItemLabelText from '../ItemParts/ItemLabelText';

interface GroupHeadingProps extends PropsWithIsRepeatedAttribute {
  qItem: QuestionnaireItem;
  readOnly: boolean;
  tabIsMarkedAsComplete?: boolean;
  pageIsMarkedAsComplete?: boolean;
}

const GroupHeading = memo(function GroupHeading(props: GroupHeadingProps) {
  const { qItem, readOnly, tabIsMarkedAsComplete, pageIsMarkedAsComplete, isRepeated } = props;

  const contextDisplayItems = getContextDisplays(qItem);

  if (isRepeated) {
    return null;
  }

  const isTabHeading = tabIsMarkedAsComplete !== undefined;
  const isPageHeading = pageIsMarkedAsComplete !== undefined;

  return (
    <>
      <Box display="flex" alignItems="center" width="100%">
        <Typography
          variant="h6"
          fontSize={isTabHeading || isPageHeading ? 16 : 15}
          color={readOnly && (!isTabHeading || !isPageHeading) ? 'text.secondary' : 'text.primary'}>
          <ItemLabelText qItem={qItem} />
        </Typography>
        <Box flexGrow={1} />
        <Box display="flex" columnGap={0.5} mx={1}>
          {contextDisplayItems.map((item) => {
            return <ContextDisplayItem key={item.linkId} displayItem={item} />;
          })}
        </Box>
      </Box>
      {qItem.text ? <Divider sx={{ mt: 1, mb: 1.5 }} light /> : null}
    </>
  );
});

export default GroupHeading;
