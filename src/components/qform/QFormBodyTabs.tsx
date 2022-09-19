import React, { useState } from 'react';
import { Box, Card, Grid, Tab, Typography } from '@mui/material';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { PropsWithQrItemChangeHandler } from './FormModel';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';
import { getQrItemsIndex, mapQItemsIndex } from './IndexFunctions';
import QItemGroup from './qform-items/QItemGroup';
import { isTab } from './TabFunctions';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
  indexOfFirstTab: number;
}

function QItemBodyTabbed(props: Props) {
  const { qForm, qrForm, indexOfFirstTab, onQrItemChange } = props;

  const indexMap: Record<string, number> = mapQItemsIndex(qForm);
  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  const [tabIndex, setTabIndex] = useState(indexOfFirstTab.toString());

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    QuestionnaireResponseService.updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <div>
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          {qForm.text}
        </Typography>
        <Card sx={{ p: 2 }}>
          <TabContext value={tabIndex}>
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex'
              }}>
              <Grid container spacing={2}>
                <Grid item xs={3.5}>
                  <Card>
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
                  </Card>
                </Grid>

                <Grid item xs={8.5}>
                  {qFormItems.map((qItem, i) => {
                    const qrItem = qrFormItemsByIndex[i];

                    if (isTab(qItem)) {
                      return (
                        <TabPanel key={qItem.linkId} sx={{ p: 0 }} value={(i + 1).toString()}>
                          <QItemGroup
                            key={qItem.linkId}
                            qItem={qItem}
                            qrItem={qrItem}
                            repeats={qItem.repeats ?? false}
                            onQrItemChange={handleQrGroupChange}></QItemGroup>
                        </TabPanel>
                      );
                    }
                  })}
                </Grid>
              </Grid>
            </Box>
          </TabContext>
        </Card>
      </div>
    );
  } else {
    return <div>Unable to load tab panel</div>;
  }
}

export default QItemBodyTabbed;
