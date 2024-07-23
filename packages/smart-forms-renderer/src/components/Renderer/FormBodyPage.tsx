import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import GroupItem from '../FormComponents/GroupItem/GroupItem';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../utils/qrItem';
import FormBodyTabListWrapper from '../Tabs/FormBodyTabListWrapper';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../stores';

interface FormBodyPageProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem | null;
}

function FormBodyPage(props: FormBodyPageProps) {
  const { topLevelQItem, topLevelQRItem, parentIsReadOnly, onQrItemChange } = props;

  const tabs = useQuestionnaireStore.use.tabs();
  const currentTab = useQuestionnaireStore.use.currentTabIndex();

  const indexMap: Record<string, number> = useMemo(
    () => mapQItemsIndex(topLevelQItem),
    [topLevelQItem]
  );

  const nonNullTopLevelQRItem = topLevelQRItem ?? createEmptyQrGroup(topLevelQItem);

  const qItems = topLevelQItem.item;
  const qrItems = nonNullTopLevelQRItem.item;

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateQrItemsInGroup(qrItem, null, nonNullTopLevelQRItem, indexMap);
    onQrItemChange(nonNullTopLevelQRItem);
  }

  if (!qItems || !qrItems) {
    return <>Unable to load form</>;
  }

  const qrItemsByIndex = getQrItemsIndex(qItems, qrItems, indexMap);

  return (
    <Grid container spacing={1.5}>
      <TabContext value={currentTab.toString()}>
        <Grid item xs={12} md={3} lg={2.75}>
          <FormBodyTabListWrapper topLevelItems={qItems} currentTabIndex={currentTab} tabs={tabs} />
        </Grid>

        <Grid item xs={12} md={9} lg={9.25}>
          {qItems.map((qItem, i) => {
            const qrItem = qrItemsByIndex[i];

            const isNotRepeatGroup = !Array.isArray(qrItem);
            const isTab = !!tabs[qItem.linkId];

            if (!isTab || !isNotRepeatGroup) {
              // Something has gone horribly wrong
              return null;
            }

            const isRepeated = qItem.repeats ?? false;
            const tabIsMarkedAsComplete = tabs[qItem.linkId].isComplete ?? false;

            return (
              <TabPanel
                key={qItem.linkId}
                sx={{ p: 0 }}
                value={i.toString()}
                data-test="renderer-tab-panel">
                <GroupItem
                  qItem={qItem}
                  qrItem={qrItem ?? null}
                  isRepeated={isRepeated}
                  groupCardElevation={1}
                  tabIsMarkedAsComplete={tabIsMarkedAsComplete}
                  tabs={tabs}
                  currentTabIndex={currentTab}
                  parentIsReadOnly={parentIsReadOnly}
                  onQrItemChange={handleQrGroupChange}
                />
              </TabPanel>
            );
          })}
        </Grid>
      </TabContext>
    </Grid>
  );
}

export default FormBodyPage;
