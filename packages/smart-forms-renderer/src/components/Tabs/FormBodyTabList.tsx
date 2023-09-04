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

import React, { memo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import { PrimarySelectableList } from '../Lists.styles';
import { TransitionGroup } from 'react-transition-group';
import { isHidden } from '../../utils/qItem';
import { getShortText } from '../../utils/itemControl';
import type { QuestionnaireItem } from 'fhir/r4';
import FormBodySingleTab from './FormBodySingleTab';
import type { Tabs } from '../../interfaces/tab.interface';
import useQuestionnaireStore from '../../stores/useQuestionnaireStore';
import { IconButton } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

interface FormBodyTabListProps {
  qFormItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Tabs;
}

const FormBodyTabList = memo(function FormBodyTabList(props: FormBodyTabListProps) {
  const { qFormItems, currentTabIndex, tabs } = props;

  const [completedTabsExpanded, setCompletedTabsExpanded] = useState(true);

  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  return (
    <Card sx={{ p: 0.75, mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PrimarySelectableList dense disablePadding sx={{ mb: 1 }} data-test="renderer-tab-list">
          <Box display="flex" justifyContent="center" alignItems="center" mx={2} columnGap={0.5}>
            <Typography
              variant="overline"
              fontSize={9}
              color={completedTabsExpanded ? 'text.secondary' : 'text.disabled'}>
              Completed tabs {completedTabsExpanded ? 'shown' : 'hidden'}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                setCompletedTabsExpanded(!completedTabsExpanded);
              }}>
              {completedTabsExpanded ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </IconButton>
          </Box>
          <Divider sx={{ mx: 1 }} light />

          <TransitionGroup>
            {qFormItems.map((qItem, i) => {
              const isTab = !!tabs[qItem.linkId];

              if (
                !isTab ||
                isHidden({
                  questionnaireItem: qItem,
                  enableWhenIsActivated,
                  enableWhenItems,
                  enableWhenExpressions
                })
              ) {
                return null;
              }

              const tabIsSelected = currentTabIndex.toString() === i.toString();
              const tabLabel = getShortText(qItem) ?? qItem.text ?? '';

              return (
                <Collapse key={qItem.linkId} timeout={100}>
                  <FormBodySingleTab
                    qItem={qItem}
                    selected={tabIsSelected}
                    tabLabel={tabLabel}
                    listIndex={i}
                    completedTabsCollapsed={!completedTabsExpanded}
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </PrimarySelectableList>
      </Box>
    </Card>
  );
});

export default FormBodyTabList;
