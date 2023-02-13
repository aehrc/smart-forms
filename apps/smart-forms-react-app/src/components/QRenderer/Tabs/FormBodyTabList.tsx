import React, { memo, useContext } from 'react';
import { Box, Card, Collapse } from '@mui/material';
import { PrimarySelectableList } from '../../StyledComponents/Lists.styles';
import { TransitionGroup } from 'react-transition-group';
import { isTab } from '../../../functions/TabFunctions';
import { isHidden } from '../../../functions/QItemFunctions';
import { getShortText } from '../../../functions/ItemControlFunctions';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { QuestionnaireItem } from 'fhir/r5';
import { EnableWhenChecksContext } from '../Form';
import FormBodySingleTab from './FormBodySingleTab';

interface Props {
  qFormItems: QuestionnaireItem[];
  tabIndex: number;
  updateTabIndex: (newTabIndex: number) => unknown;
}

function FormBodyTabList(props: Props) {
  const { qFormItems, tabIndex, updateTabIndex } = props;

  const enableWhenContext = useContext(EnableWhenContext);
  const enableWhenChecksContext = useContext(EnableWhenChecksContext);

  return (
    <Card sx={{ p: 0.75, mb: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <PrimarySelectableList dense disablePadding sx={{ my: 0.5 }} data-test="renderer-tab-list">
          <TransitionGroup>
            {qFormItems.map((qItem, index) => {
              if (!isTab(qItem) || isHidden(qItem, enableWhenContext, enableWhenChecksContext)) {
                return null;
              }
              return (
                <Collapse key={qItem.linkId}>
                  <FormBodySingleTab
                    selected={tabIndex.toString() === (index + 1).toString()}
                    tabText={getShortText(qItem) ?? qItem.text + ''}
                    listIndex={index}
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
