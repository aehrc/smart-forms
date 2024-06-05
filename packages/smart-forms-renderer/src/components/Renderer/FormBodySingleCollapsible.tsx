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

import type { ReactNode } from 'react';
import React, { memo } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getContextDisplays } from '../../utils/tabs';
import type { QuestionnaireItem } from 'fhir/r4';
import { getShortText } from '../../utils/itemControl';
import ContextDisplayItem from '../FormComponents/ItemParts/ContextDisplayItem';

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

  const isExpanded = selectedIndex === index;

  return (
    <Accordion
      expanded={isExpanded}
      slotProps={{
        transition: { unmountOnExit: true, timeout: 250 }
      }}
      onChange={() => onToggleExpand(index)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mr={3}>
          <Typography variant="subtitle2">{collapsibleLabel}</Typography>
          <Box display="flex" columnGap={0.5}>
            {contextDisplayItems.map((item) => {
              return <ContextDisplayItem key={item.linkId} displayItem={item} />;
            })}
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
});

export default FormBodySingleCollapsible;
