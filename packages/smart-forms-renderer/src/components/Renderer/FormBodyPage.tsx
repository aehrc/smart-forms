import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import GroupItem from '../FormComponents/GroupItem/GroupItem';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../stores';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { createEmptyQrGroup, updateQrItemsInGroup } from '../../utils/qrItem';

interface FormBodyPageProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem | null;
}

function FormBodyPage(props: FormBodyPageProps) {
  const { topLevelQItem, topLevelQRItem, parentIsReadOnly, onQrItemChange } = props;

  const pages = useQuestionnaireStore.use.pages();
  const currentPage = useQuestionnaireStore.use.currentPageIndex();

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
      <TabContext value={currentPage.toString()}>
        <Grid item xs={12} md={12} lg={12}>
          {qItems.map((qItem, i) => {
            const qrItem = qrItemsByIndex[i];

            const isNotRepeatGroup = !Array.isArray(qrItem);
            const isPage = !!pages[qItem.linkId];

            if (!isPage || !isNotRepeatGroup) {
              // Something has gone horribly wrong
              return null;
            }

            const isRepeated = qItem.repeats ?? false;
            const pageIsMarkedAsComplete = pages[qItem.linkId].isComplete ?? false;

            return (
              <TabPanel
                key={qItem.linkId}
                sx={{ p: 0 }}
                value={i.toString()}
                data-test="renderer-page-panel">
                <GroupItem
                  qItem={qItem}
                  qrItem={qrItem ?? null}
                  isRepeated={isRepeated}
                  groupCardElevation={1}
                  pageIsMarkedAsComplete={pageIsMarkedAsComplete}
                  pages={pages}
                  currentPageIndex={currentPage}
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
