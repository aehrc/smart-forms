import React, { useEffect, useState } from 'react';
import { Button, FormControl, Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem
} from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { Add, Delete } from '@mui/icons-material';
import QItemGroup from '../qform-items/QItemGroup';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeatGroup(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const cleanQrItem = QuestionnaireResponseService.createQrItem(qItem);
  const qrRepeat = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswerItems: (QuestionnaireResponseAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const [repeatAnswerItems, setRepeatAnswerItems] = useState(qrRepeatAnswerItems);

  useEffect(() => {
    setRepeatAnswerItems(qrRepeatAnswerItems);
  }, [qrItem]);

  function handleAnswerItemsChange(newQrItem: QuestionnaireResponseItem, index: number) {
    // TODO only one answer is registered
    // TODO handle disappearing field
    const answerItemsTemp = [...repeatAnswerItems];
    if (newQrItem.item) {
      answerItemsTemp[index] = { item: [...newQrItem.item] };
    }
    updateAnswerItems(answerItemsTemp);
  }

  function deleteAnswerItem(index: number) {
    const answerItemsTemp = [...repeatAnswerItems];
    if (answerItemsTemp.length === 1) {
      answerItemsTemp[0] = undefined;
    } else {
      answerItemsTemp.splice(index, 1);
    }
    updateAnswerItems(answerItemsTemp);
  }

  function updateAnswerItems(updatedAnswerItems: (QuestionnaireResponseAnswer | undefined)[]) {
    setRepeatAnswerItems(updatedAnswerItems);

    const answerItemsWithValues = updatedAnswerItems.flatMap((answerItem) =>
      answerItem ? [answerItem] : []
    );
    onQrItemChange({ ...qrRepeat, answer: answerItemsWithValues });
  }

  return (
    <div>
      <FormControl fullWidth sx={{ m: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            {repeatAnswerItems.map((answerItem, index) => {
              const singleQrItem: QuestionnaireResponseItem = answerItem
                ? {
                    ...cleanQrItem,
                    answer: [answerItem]
                  }
                : { ...cleanQrItem };

              return (
                <Stack key={index} direction="row" sx={{ pb: 2 }}>
                  something
                  <QItemGroup
                    qItem={qItem}
                    qrItem={singleQrItem}
                    repeats={true}
                    onQrItemChange={(newQrItem) =>
                      handleAnswerItemsChange(newQrItem, index)
                    }></QItemGroup>
                  <Button disabled={!answerItem} onClick={() => deleteAnswerItem(index)}>
                    <Delete />
                  </Button>
                </Stack>
              );
            })}
          </Grid>
        </Grid>
      </FormControl>
      <Stack direction="row" justifyContent="end">
        <Button
          disabled={!repeatAnswerItems[repeatAnswerItems.length - 1]}
          onClick={() => setRepeatAnswerItems([...repeatAnswerItems, undefined])}>
          <Add sx={{ mr: 1 }} />
          Add Item
        </Button>
      </Stack>
    </div>
  );
}

export default QItemRepeatGroup;
