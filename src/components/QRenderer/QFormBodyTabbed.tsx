import React, { useState } from 'react';
import { Box, Card, Grid, Tab, Typography } from '@mui/material';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { PropsWithQrItemChangeHandler } from '../../interfaces/Interfaces';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { getQrItemsIndex, mapQItemsIndex } from '../../functions/IndexFunctions';
import QItemGroup from './QFormComponents/QItemGroup';
import { isTab } from '../../functions/TabFunctions';
import { updateLinkedItem } from '../../functions/QrItemFunctions';
import { getShortText } from '../../functions/QItemFunctions';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
  indexOfFirstTab: number;
}

function QFormBodyTabbed(props: Props) {
  const { qForm, qrForm, indexOfFirstTab, onQrItemChange } = props;

  const indexMap: Record<string, number> = mapQItemsIndex(qForm);
  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  const [tabIndex, setTabIndex] = useState(indexOfFirstTab.toString());

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {qForm.text}
        </Typography>
        <TabContext value={tabIndex}>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex'
            }}>
            <Grid container columnSpacing={2.5}>
              <Grid item xs={3.5}>
                <Card sx={{ py: 1 }}>
                  <TabList
                    orientation="vertical"
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}>
                    {qFormItems.map((qItem, i) => {
                      if (isTab(qItem)) {
                        return (
                          <Tab
                            key={qItem.linkId}
                            label={getShortText(qItem) ?? qItem.text}
                            value={(i + 1).toString()}
                          />
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
                          qItem={qItem}
                          qrItem={qrItem}
                          repeats={qItem.repeats ?? false}
                          groupCardElevation={2}
                          onQrItemChange={handleQrGroupChange}></QItemGroup>
                      </TabPanel>
                    );
                  }
                })}
              </Grid>
            </Grid>
          </Box>
        </TabContext>
      </>
    );
  } else {
    return <>Unable to load form</>;
  }
}

export default QFormBodyTabbed;
