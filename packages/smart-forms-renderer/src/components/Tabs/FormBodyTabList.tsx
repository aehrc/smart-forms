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

import React, { memo } from 'react';
import { Box, Card, Collapse } from '@mui/material';
import { PrimarySelectableList } from '../Lists.styles';
import { TransitionGroup } from 'react-transition-group';
import { isHidden } from '../../utils/qItem';
import { getShortText } from '../../utils/itemControl';
import type { QuestionnaireItem } from 'fhir/r4';
import FormBodySingleTab from './FormBodySingleTab';
import type { Tabs } from '../../interfaces/tab.interface';
import useQuestionnaireStore from '../../stores/useQuestionnaireStore';

interface FormBodyTabListProps {
  qFormItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Tabs;
}

const FormBodyTabList = memo(function FormBodyTabList(props: FormBodyTabListProps) {
  const { qFormItems, currentTabIndex, tabs } = props;

  const enableWhenIsActivated = useQuestionnaireStore((state) => state.enableWhenIsActivated);
  const enableWhenItems = useQuestionnaireStore((state) => state.enableWhenItems);
  const enableWhenExpressions = useQuestionnaireStore((state) => state.enableWhenExpressions);

  return (
    <Card sx={{ p: 0.75, mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PrimarySelectableList dense disablePadding sx={{ my: 1 }} data-test="renderer-tab-list">
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
