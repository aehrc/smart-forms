import React, { memo, useContext } from 'react';
import { Box, Card, Collapse } from '@mui/material';
import { PrimarySelectableList } from '../../StyledComponents/Lists.styles';
import { TransitionGroup } from 'react-transition-group';
import { isTab } from '../../../functions/TabFunctions';
import { isHidden } from '../../../functions/QItemFunctions';
import { getShortText } from '../../../functions/ItemControlFunctions';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { QuestionnaireItem } from 'fhir/r5';
import FormBodySingleTab from './FormBodySingleTab';

interface Props {
  qFormItems: QuestionnaireItem[];
  currentTabIndex: number;
  tabs: Record<string, { tabIndex: number; isComplete: boolean }>;
  updateTabIndex: (newTabIndex: number) => unknown;
}

function FormBodyTabList(props: Props) {
  const { qFormItems, currentTabIndex, tabs, updateTabIndex } = props;

  const enableWhenContext = useContext(EnableWhenContext);

  return (
    <Card sx={{ p: 0.75, mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PrimarySelectableList dense disablePadding sx={{ my: 0.5 }} data-test="renderer-tab-list">
          <TransitionGroup>
            {qFormItems.map((qItem, i) => {
              if (!isTab(qItem) || isHidden(qItem, enableWhenContext)) {
                return null;
              }
              return (
                <Collapse key={qItem.linkId}>
                  <FormBodySingleTab
                    selected={currentTabIndex.toString() === i.toString()}
                    tabText={getShortText(qItem) ?? qItem.text + ''}
                    listIndex={i}
                    markedAsComplete={tabs[qItem.linkId].isComplete ?? false}
                    updateTabIndex={updateTabIndex}
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </PrimarySelectableList>
      </Box>
    </Card>
  );
}

export default memo(FormBodyTabList);
