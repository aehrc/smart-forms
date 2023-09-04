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

import React, { memo, useMemo } from 'react';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import useQuestionnaireStore from '../../stores/useQuestionnaireStore';
import type { QuestionnaireItem } from 'fhir/r4';
import { getContextDisplays } from '../../utils/tabs';
import ItemLabelText from '../FormComponents/ItemParts/ItemLabelText';
import { isHidden } from '../../utils/qItem';

interface FormBodySingleTabProps {
  qItem: QuestionnaireItem;
  selected: boolean;
  tabLabel: string;
  listIndex: number;
  completedTabsCollapsed: boolean;
}

const FormBodySingleTab = memo(function FormBodySingleTab(props: FormBodySingleTabProps) {
  const { qItem, selected, tabLabel, listIndex, completedTabsCollapsed } = props;

  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);
  const switchTab = useQuestionnaireStore((state) => state.switchTab);

  const visibleContextDisplayItems = useMemo(
    () =>
      getContextDisplays(qItem).filter(
        (contextDisplayItem) =>
          !isHidden({
            questionnaireItem: contextDisplayItem,
            enableWhenIsActivated,
            enableWhenItems,
            enableWhenExpressions
          })
      ),
    [enableWhenExpressions, enableWhenIsActivated, enableWhenItems, qItem]
  );

  const tabIsCompleted = visibleContextDisplayItems.find((item) => item.text === 'Complete');
  if (tabIsCompleted && completedTabsCollapsed) {
    return null;
  }

  function handleTabClick() {
    switchTab(listIndex);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <ListItemButton
        selected={selected}
        sx={{ my: 0.2, minHeight: '36px' }}
        onClick={handleTabClick}>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">{tabLabel}</Typography>
              <Box display="flex" minHeight={24} minWidth={24} ml={1}>
                {visibleContextDisplayItems.map((item) => (
                  <ItemLabelText key={item.linkId} qItem={item} />
                ))}
              </Box>
            </Box>
          }
        />
      </ListItemButton>
    </>
  );
});

export default FormBodySingleTab;
