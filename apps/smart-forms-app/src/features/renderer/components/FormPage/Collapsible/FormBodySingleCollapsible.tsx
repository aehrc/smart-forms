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

import type { ReactNode } from 'react';
import { memo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tooltip,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getContextDisplays } from '../../../utils/tabs.ts';
import { QuestionnaireItem } from 'fhir/r4';
import { getShortText } from '../../../utils/itemControl.ts';
import GroupHeadingIcon from '../QFormComponents/GroupItem/GroupHeadingIcon.tsx';

interface FormBodySingleCollapsibleProps {
  qItem: QuestionnaireItem;
  index: number;
  selectedIndex: number;
  onToggleExpand: (index: number) => void;
  children: ReactNode;
}

const FormBodySingleCollapsible = memo(function FormBodySingleCollapsible(
  props: FormBodySingleCollapsibleProps
) {
  const { qItem, index, selectedIndex, onToggleExpand, children } = props;

  const contextDisplayItems = getContextDisplays(qItem);

  const collapsibleLabel = getShortText(qItem) ?? qItem.text ?? '';

  return (
    <Accordion
      expanded={selectedIndex === index}
      TransitionProps={{ unmountOnExit: true }}
      onChange={() => onToggleExpand(index)}>
      <AccordionSummary
        expandIcon={
          <Tooltip title={'Expand'}>
            <ExpandMoreIcon />
          </Tooltip>
        }>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mr={3}>
          <Typography variant="subtitle2">{collapsibleLabel}</Typography>
          <Box display="flex" columnGap={0.5}>
            {contextDisplayItems.map((item) => {
              return <GroupHeadingIcon key={item.linkId} displayItem={item} />;
            })}
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
});

export default FormBodySingleCollapsible;
