import React, { useState } from 'react';
import { Box, Card, Grid, ListItemButton, Typography } from '@mui/material';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { PropsWithQrItemChangeHandler } from '../../interfaces/Interfaces';
import { TabContext, TabPanel } from '@mui/lab';
import { getQrItemsIndex, mapQItemsIndex } from '../../functions/IndexFunctions';
import QItemGroup from './QFormComponents/QItemGroup';
import { isTab } from '../../functions/TabFunctions';
import { updateLinkedItem } from '../../functions/QrItemFunctions';
import { getShortText } from '../../functions/ItemControlFunctions';
import { hideQItem } from '../../functions/QItemFunctions';
import ListItemText from '@mui/material/ListItemText';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
  indexOfFirstTab: number;
}

function FormBodyTabbed(props: Props) {
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
      <Grid container spacing={2}>
        <TabContext value={tabIndex}>
          <Grid item xs={12} md={3.5} lg={3} xl={2.75}>
            <Card sx={{ p: 1, mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <PrimarySelectableList dense disablePadding sx={{ my: 0.5 }}>
                  {qFormItems.map((qItem, index) => {
                    if (!isTab(qItem) || hideQItem(qItem)) return null;
                    return (
                      <ListItemButton
                        key={qItem.linkId}
                        selected={tabIndex === (index + 1).toString()}
                        sx={{ my: 0.5 }}
                        onClick={() => setTabIndex((index + 1).toString())}>
                        <ListItemText
                          primary={
                            <Typography fontSize={12} variant="h6">
                              {getShortText(qItem) ?? qItem.text}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    );
                  })}
                </PrimarySelectableList>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={8.5} lg={9} xl={9.25}>
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
        </TabContext>
      </Grid>
    );
  } else {
    return <>Unable to load form</>;
  }
}

export default FormBodyTabbed;
