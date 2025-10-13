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
import { useRendererConfigStore } from '../../stores/rendererConfigStore';
import { SingleItem } from '../FormComponents';
import PageButtonsWrapper from '../FormComponents/GroupItem/PageButtonWrapper';
import { QGroupContainerBox } from '../Box.styles';
import { GroupCard } from '../FormComponents/GroupItem/GroupItem.styles';
import { isFooter, isHeader } from '../../utils/page';

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
  const disableCardView = useRendererConfigStore.use.disablePageCardView();

  const { headerQItems, pageQItems, footerQItems } = useMemo(() => {
    const headerQItems: [QuestionnaireItem, number][] = [];
    const pageQItems: [QuestionnaireItem, number][] = [];
    const footerQItems: [QuestionnaireItem, number][] = [];

    for (const [qrItemIndex, qItem] of topLevelQItems.entries()) {
      if (isHeader(qItem)) {
        headerQItems.push([qItem, qrItemIndex]);
      } else if (isFooter(qItem)) {
        footerQItems.push([qItem, qrItemIndex]);
      } else {
        pageQItems.push([qItem, qrItemIndex]);
      }
    }

    return { headerQItems, pageQItems, footerQItems };
  }, [topLevelQItems]);

  return (
    <>
      {headerQItems.map((headerQItem) => {
        const [qItem, qrItemIndex] = headerQItem;
        const qrItemOrItems = topLevelQRItems[qrItemIndex];

        const isRepeatGroup = Array.isArray(qrItemOrItems);
        if (isRepeatGroup) {
          // Does not work with repeat groups
          return null;
        }

        const isRepeated = qItem.repeats ?? false;

        return (
          <GroupItem
            key={qItem.linkId}
            qItem={qItem}
            qrItem={qrItemOrItems ?? null}
            isRepeated={isRepeated}
            groupCardElevation={1}
            disableCardView={disableCardView}
            currentPageIndex={currentPage}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      })}

      <Grid container spacing={1.5}>
        <TabContext value={currentPage.toString()}>
          <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            {pageQItems.map((pageQItem, i) => {
              const [qItem, qrItemIndex] = pageQItem;
              const qrItem = topLevelQRItems[qrItemIndex];

              const isNotRepeatGroup = !Array.isArray(qrItem);
              const isPage = !!pages[qItem.linkId];

              const itemIsGroup = qItem.type === 'group';

              // const isHeader = qItem.itemControl?.type === 'header';

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
                    aria-label={`${qItem.text ?? 'Unnamed'} page`}
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
                  aria-label={`${qItem.text ?? 'Unnamed'} page`}
                  key={qItem.linkId}
                  sx={{ p: 0 }}
                  value={i.toString()}
                  data-test="renderer-page-panel">
                  <QGroupContainerBox
                    cardElevation={1}
                    isRepeated={isRepeated}
                    data-test="q-item-group-box"
                    role="region"
                    aria-label={qItem.text ?? 'Unnamed group'}>
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

      {footerQItems.map((footerQItem) => {
        const [qItem, qrItemIndex] = footerQItem;
        const qrItemOrItems = topLevelQRItems[qrItemIndex];

        const isRepeatGroup = Array.isArray(qrItemOrItems);
        if (isRepeatGroup) {
          // Does not work with repeat groups
          return null;
        }

        const isRepeated = qItem.repeats ?? false;

        return (
          <GroupItem
            key={qItem.linkId}
            qItem={qItem}
            qrItem={qrItemOrItems ?? null}
            isRepeated={isRepeated}
            groupCardElevation={1}
            disableCardView={disableCardView}
            currentPageIndex={currentPage}
            parentIsReadOnly={parentIsReadOnly}
            onQrItemChange={onQrItemChange}
          />
        );
      })}
    </>
  );
}

export default FormBodyPaginated;
