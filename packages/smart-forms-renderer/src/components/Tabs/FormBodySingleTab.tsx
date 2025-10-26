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
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useQuestionnaireStore, useRendererConfigStore } from '../../stores';
import type { QuestionnaireItem } from 'fhir/r4';
import ContextDisplayItem from '../FormComponents/ItemParts/ContextDisplayItem';
import { useFocusTabHeading } from '../../hooks/useFocusTabHeading';
import useDisplayCqfAndCalculatedExpression from '../../hooks/useDisplayCqfAndCalculatedExpression';

interface FormBodySingleTabProps {
  qItem: QuestionnaireItem;
  contextDisplayItems: QuestionnaireItem[];
  selected: boolean;
  tabLabel: string;
  listIndex: number;
}

const FormBodySingleTab = memo(function FormBodySingleTab(props: FormBodySingleTabProps) {
  const { qItem, contextDisplayItems, selected, tabLabel, listIndex } = props;

  const switchTab = useQuestionnaireStore.use.switchTab();
  const disableHeadingFocusOnTabSwitch =
    useRendererConfigStore.use.disableHeadingFocusOnTabSwitch();

  const focusHeading = useFocusTabHeading();

  // Get aria-label text if available
  const itemTextAriaLabel =
    useDisplayCqfAndCalculatedExpression(qItem, 'item._text.aria-label') ?? undefined;

  function handleTabClick() {
    switchTab(listIndex);
    window.scrollTo(0, 0);

    // Focus the first heading in the new tab panel if not disabled
    if (!disableHeadingFocusOnTabSwitch) {
      setTimeout(() => {
        focusHeading(`tabpanel-${listIndex}`);
      }, 100); // Small delay to ensure panel is rendered
    }
  }

  return (
    <>
      <ListItemButton
        selected={selected}
        sx={{ my: 0.1, minHeight: '36px' }}
        onClick={handleTabClick}>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                id={`tab-${listIndex}`}
                component="span"
                fontWeight={600}
                fontSize="0.8125rem"
                aria-label={itemTextAriaLabel}>
                {tabLabel}
              </Typography>
              <Box display="flex" minHeight={24} minWidth={24} ml={1}>
                {contextDisplayItems.map((item) => {
                  return <ContextDisplayItem key={item.linkId} displayItem={item} />;
                })}
              </Box>
            </Box>
          }
        />
      </ListItemButton>
    </>
  );
});

export default FormBodySingleTab;
