import React from 'react';
import { Box, Card, Grid, ListItemButton, Typography } from '@mui/material';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { PropsWithQrItemChangeHandler } from '../../interfaces/Interfaces';
import { TabContext, TabPanel } from '@mui/lab';
import { getQrItemsIndex, mapQItemsIndex } from '../../functions/IndexFunctions';
import QItemGroup from './QFormComponents/QItemGroup';
import { isTab } from '../../functions/TabFunctions';
import { updateLinkedItem } from '../../functions/QrItemFunctions';
import { getShortText } from '../../functions/ItemControlFunctions';
import { isHidden } from '../../functions/QItemFunctions';
import ListItemText from '@mui/material/ListItemText';
import { PrimarySelectableList } from '../StyledComponents/Lists.styles';
import { EnableWhenContext } from '../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from './Form';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
  tabIndex: number;
  setTabIndex: (newTabIndex: number) => unknown;
}

function FormBodyTabbed(props: Props) {
  const { qForm, qrForm, tabIndex, setTabIndex, onQrItemChange } = props;

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  const indexMap: Record<string, number> = mapQItemsIndex(qForm);
  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    updateLinkedItem(qrItem, null, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems, indexMap);

    return (
      <Grid container spacing={2}>
        <TabContext value={tabIndex.toString()}>
          <Grid item xs={12} md={3.5} lg={3} xl={2.75}>
            <Card sx={{ p: 0.75, mb: 2 }}>
              <Box sx={{ flexGrow: 1 }}>
                <PrimarySelectableList dense disablePadding sx={{ my: 0.5 }}>
                  {qFormItems.map((qItem, index) => {
                    if (
                      !isTab(qItem) ||
                      isHidden(qItem, enableWhenContext, enableWhenChecksContext)
                    )
                      return null;
                    return (
                      <ListItemButton
                        key={qItem.linkId}
                        selected={tabIndex.toString() === (index + 1).toString()}
                        sx={{ my: 0.5 }}
                        onClick={() => setTabIndex(index + 1)}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2">
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

              if (isTab(qItem) && !Array.isArray(qrItem)) {
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
