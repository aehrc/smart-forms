import React, { useState } from 'react';
import { Button, Container, FormControl, Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseItem } from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import AddIcon from '@mui/icons-material/Add';
import QItemSwitcher from '../qform-items/QItemSwitcher';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeats(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const qrRepeats = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const [components, setComponents] = useState([
    {
      QItem: qItem,
      QRItem: qrRepeats
    }
  ]);

  return (
    <div>
      <FormControl fullWidth sx={{ m: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            Repeats
            <Container>
              {components.map((item, index) => {
                const QItem = item.QItem;
                const QRItem = item.QRItem;
                return (
                  <QItemSwitcher
                    key={index}
                    qItem={QItem}
                    qrItem={QRItem}
                    onQrItemChange={onQrItemChange}
                  />
                );
              })}
            </Container>
          </Grid>
        </Grid>
      </FormControl>
      <Stack direction="row" justifyContent="end">
        <Button
          onClick={() => {
            const newItem = {
              QItem: qItem,
              QRItem: QuestionnaireResponseService.createQrItem(qItem)
            };
            setComponents([...components, newItem]);
          }}>
          <AddIcon sx={{ mr: 1 }} />
          Add Item
        </Button>
      </Stack>
    </div>
  );
}

export default QItemRepeats;
