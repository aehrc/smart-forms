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

import { memo } from 'react';
import { Box, ListItemButton, ListItemText, Typography } from '@mui/material';
import useQuestionnaireStore from '../../../../../stores/useQuestionnaireStore.ts';
import type { QuestionnaireItem } from 'fhir/r4';
import { getContextDisplays } from '../../../utils/tabs.ts';
import GroupHeadingIcon from '../QFormComponents/GroupItem/GroupHeadingIcon.tsx';

interface FormBodySingleTabProps {
  qItem: QuestionnaireItem;
  selected: boolean;
  tabLabel: string;
  listIndex: number;
}

const FormBodySingleTab = memo(function FormBodySingleTab(props: FormBodySingleTabProps) {
  const { qItem, selected, tabLabel, listIndex } = props;

  const switchTab = useQuestionnaireStore((state) => state.switchTab);

  const contextDisplayItems = getContextDisplays(qItem);

  function handleTabClick() {
    switchTab(listIndex);
    window.scrollTo(0, 0);
  }

  return (
    <>
      <ListItemButton selected={selected} sx={{ my: 0.25, py: 0.75 }} onClick={handleTabClick}>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">{tabLabel}</Typography>
              <Box display="flex">
                {contextDisplayItems.map((item) => {
                  return <GroupHeadingIcon key={item.linkId} displayItem={item} />;
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
