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
import { useRendererStylingStore } from '../../stores/rendererStylingStore';
import { SingleItem } from '../FormComponents';
import PageButtonsWrapper from '../FormComponents/GroupItem/PageButtonWrapper';
import { QGroupContainerBox } from '../Box.styles';
import { GroupCard } from '../FormComponents/GroupItem/GroupItem.styles';

interface FormBodyPaginatedProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItems: QuestionnaireItem[];
  topLevelQRItems: (QuestionnaireResponseItem | QuestionnaireResponseItem[] | undefined)[];
}

// TODO This implementation doesnt take into account repeat items and repeat groups
// TODO need to fix this before bringing it into release
// Every group item in here is rendered as a page
function FormBodyPaginated(props: FormBodyPaginatedProps) {
  const { topLevelQItems, topLevelQRItems, parentIsReadOnly, onQrItemChange } = props;

  const pages = useQuestionnaireStore.use.pages();
  const currentPage = useQuestionnaireStore.use.currentPageIndex();
  const disableCardView = useRendererStylingStore.use.disablePageCardView();

  return (
    <Grid container spacing={1.5}>
      <TabContext value={currentPage.toString()}>
        <Grid item xs={12} md={12} lg={12}>
          {topLevelQItems.map((qItem, i) => {
            const qrItem = topLevelQRItems[i];

            const isNotRepeatGroup = !Array.isArray(qrItem);
            const isPage = !!pages[qItem.linkId];

            const itemIsGroup = qItem.type === 'group';

            if (!isPage || !isNotRepeatGroup) {
              // Something has gone horribly wrong
              return null;
            }

            const isRepeated = qItem.repeats ?? false;
            const pageIsMarkedAsComplete = pages[qItem.linkId].isComplete ?? false;

            // Render this page as a group
            if (itemIsGroup) {
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
                    disableCardView={disableCardView}
                    pageIsMarkedAsComplete={pageIsMarkedAsComplete}
                    pages={pages}
                    currentPageIndex={currentPage}
                    parentIsReadOnly={parentIsReadOnly}
                    onQrItemChange={onQrItemChange}
                  />
                </TabPanel>
              );
            }

            // Page consists of a non-group item
            return (
              <TabPanel
                key={qItem.linkId}
                sx={{ p: 0 }}
                value={i.toString()}
                data-test="renderer-page-panel">
                <QGroupContainerBox
                  cardElevation={1}
                  isRepeated={isRepeated}
                  data-test="q-item-group-box">
                  {disableCardView ? (
                    <>
                      <SingleItem
                        qItem={qItem}
                        qrItem={qrItem ?? null}
                        isRepeated={isRepeated}
                        groupCardElevation={1}
                        parentIsReadOnly={parentIsReadOnly}
                        onQrItemChange={onQrItemChange}
                        isTabled={false}
                      />
                      <PageButtonsWrapper currentPageIndex={currentPage} pages={pages} />
                    </>
                  ) : (
                    <GroupCard elevation={1} isRepeated={isRepeated}>
                      <SingleItem
                        qItem={qItem}
                        qrItem={qrItem ?? null}
                        isRepeated={isRepeated}
                        groupCardElevation={1}
                        parentIsReadOnly={parentIsReadOnly}
                        onQrItemChange={onQrItemChange}
                        isTabled={false}
                      />
                      <PageButtonsWrapper currentPageIndex={currentPage} pages={pages} />
                    </GroupCard>
                  )}
                </QGroupContainerBox>
              </TabPanel>
            );
          })}
        </Grid>
      </TabContext>
    </Grid>
  );
}

export default FormBodyPaginated;
