import React, { useState } from 'react';
import { Box, Container, Grid, Tab, Typography } from '@mui/material';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { PropsWithQrItemChangeHandler, QItemType } from './FormModel';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';
import { getQrItemsIndex, mapQItemsIndex } from './IndexFunctions';
import QItemGroup from './qform-items/QItemGroup';
import QItemSwitcher from './qform-items/QItemSwitcher';
import { isTab } from './TabFunctions';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QItemBodyTabbed(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;
  const indexMap: Record<string, number> = mapQItemsIndex(qForm);
  const [tabIndex, setTabIndex] = useState('1');

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    QuestionnaireResponseService.updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <div>
        {/* render tabbed groups */}
        <Container sx={{ p: 3, border: 1 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            {qForm.text}
          </Typography>
          <TabContext value={tabIndex}>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex'
              }}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TabList
                    orientation="vertical"
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}>
                    {qFormItems.map((qItem, i) => {
                      if (isTab(qItem)) {
                        return (
                          <Tab key={qItem.linkId} label={qItem.text} value={(i + 1).toString()} />
                        );
                      }
                    })}
                  </TabList>
                </Grid>

                <Grid item xs={9}>
                  {qFormItems.map((qItem, i) => {
                    const qrItem = qrFormItemsByIndex[i];

                    if (isTab(qItem)) {
                      return (
                        <TabPanel key={qItem.linkId} value={(i + 1).toString()}>
                          <Container>
                            <QItemGroup
                              key={qItem.linkId}
                              qItem={qItem}
                              qrItem={qrItem}
                              repeats={qItem.repeats ?? false}
                              onQrItemChange={handleQrGroupChange}></QItemGroup>
                          </Container>
                        </TabPanel>
                      );
                    }
                  })}
                </Grid>
              </Grid>
            </Box>
          </TabContext>
        </Container>

        {/* render untabbed groups */}
        <Container sx={{ my: 2, p: 3, border: 1 }}>
          {qFormItems.map((qItem: QuestionnaireItem, i) => {
            if (!isTab(qItem)) {
              const qrItem = qrFormItemsByIndex[i];
              if (qItem.type === QItemType.Group) {
                return (
                  <QItemGroup
                    key={qItem.linkId}
                    qItem={qItem}
                    qrItem={qrItem}
                    repeats={qItem.repeats ?? false}
                    onQrItemChange={handleQrGroupChange}></QItemGroup>
                );
              } else {
                return (
                  <QItemSwitcher
                    key={qItem.linkId}
                    qItem={qItem}
                    qrItem={qrItem}
                    repeats={qItem.repeats ?? false}
                    onQrItemChange={handleQrGroupChange}></QItemSwitcher>
                );
              }
            }
          })}
        </Container>
      </div>
    );
  } else {
    return <div>Unable to load tab panel</div>;
  }
}

export default QItemBodyTabbed;
