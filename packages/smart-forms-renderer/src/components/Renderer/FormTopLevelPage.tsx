import React from 'react';
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

interface FormTopLevelPageProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItems: QuestionnaireItem[];
  topLevelQRItems: (QuestionnaireResponseItem | QuestionnaireResponseItem[] | undefined)[];
}

function FormTopLevelPage(props: FormTopLevelPageProps) {
  const { topLevelQItems, topLevelQRItems, parentIsReadOnly, onQrItemChange } = props;

  const pages = useQuestionnaireStore.use.pages();
  const currentPage = useQuestionnaireStore.use.currentPageIndex();

  return (
    <Grid container spacing={1.5}>
      <TabContext value={currentPage.toString()}>
        <Grid item xs={12} md={12} lg={12}>
          {topLevelQItems.map((qItem, i) => {
            const qrItem = topLevelQRItems[i];

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
                  onQrItemChange={onQrItemChange}
                />
              </TabPanel>
            );
          })}
        </Grid>
      </TabContext>
    </Grid>
  );
}

export default FormTopLevelPage;
