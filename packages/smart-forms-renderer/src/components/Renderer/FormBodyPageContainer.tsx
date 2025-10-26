import React, { useMemo } from 'react';
import { Grid } from '@mui/material';
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

interface FormBodyPageContainerProps
  extends PropsWithQrItemChangeHandler,
    PropsWithParentIsReadOnlyAttribute {
  topLevelQItem: QuestionnaireItem;
  topLevelQRItem: QuestionnaireResponseItem | null;
}

/* Using "page" item as a page-container - only preserved for backwards compatibility (not compliant with https://hl7.org/fhir/extensions/CodeSystem-questionnaire-item-control.html#questionnaire-item-control-page)
 * - The first "page" item in the questionnaire will be considered as a page-container, and all its children will be considered as pages
 * - All other pages will be ignored by the renderer
 * - You can have non-page items in the same level as the page-container to be used as faux headers or footers
 * - Ensure that only group items are in the page-container
 * Note: This will only be used if wholeFormIsPaginated=false
 */
function FormBodyPageContainer(props: FormBodyPageContainerProps) {
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
        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
          {qItems.map((qItem, i) => {
            const qrItem = qrItemsByIndex[i];

            const isNotRepeatGroup = !Array.isArray(qrItem);
            const isPage = !!pages[qItem.linkId];

            if (!isPage || !isNotRepeatGroup) {
              // This should never happen
              return null;
            }

            const isRepeated = qItem.repeats ?? false;
            const pageIsMarkedAsComplete = pages[qItem.linkId].isComplete ?? false;

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

export default FormBodyPageContainer;
