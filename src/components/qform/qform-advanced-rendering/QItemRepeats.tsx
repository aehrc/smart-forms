import React, { useState } from 'react';
import { Button, FormControl, Grid, Stack, Typography } from '@mui/material';
import { QuestionnaireItem } from '../../questionnaire/QuestionnaireModel';
import { PropsWithQrItemChangeHandler, QItemType } from '../FormModel';
import {
  QuestionnaireResponseAnswer,
  QuestionnaireResponseItem
} from '../../questionnaireResponse/QuestionnaireResponseModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { Add, Delete } from '@mui/icons-material';
import QItemSwitcher from '../qform-items/QItemSwitcher';
import QItemGroup from '../qform-items/QItemGroup';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeats(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;
  const cleanQrItem = QuestionnaireResponseService.createQrItem(qItem);

  let qrRepeats = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswers: (QuestionnaireResponseAnswer | undefined)[] = qrRepeats['answer']
    ? qrRepeats['answer']
    : [undefined];

  const [repeatAnswers, setRepeatAnswers] = useState(qrRepeatAnswers);

  function handleAnswersChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const answersTemp = [...repeatAnswers];
    if (newQrItem.answer) {
      answersTemp[index] = newQrItem.answer[0];
    }
    setRepeatAnswers(answersTemp);

    const answersWithoutUndefined = answersTemp.flatMap((answer) => (answer ? [answer] : []));
    qrRepeats = { ...qrRepeats, answer: answersWithoutUndefined };
    // onQrItemChange(qrRepeats);
  }

  // TODO disable add button if answer is undefined
  // TODO disable delete button if only a single answer left
  return (
    <div>
      <FormControl fullWidth sx={{ m: 1, p: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            {repeatAnswers.map((answer, index) => {
              const singleQrItem = answer ? { ...qrRepeats, answer: [answer] } : { ...qrRepeats };

              return (
                <Stack key={index} direction="row" sx={{ pb: 2 }}>
                  {qItem.type === QItemType.Group ? (
                    <QItemGroup
                      qItem={qItem}
                      qrItem={singleQrItem}
                      repeats={true}
                      onQrItemChange={(newQrItem) =>
                        handleAnswersChange(newQrItem, index)
                      }></QItemGroup>
                  ) : (
                    <QItemSwitcher
                      qItem={qItem}
                      qrItem={singleQrItem}
                      repeats={true}
                      onQrItemChange={(newQrItem) =>
                        handleAnswersChange(newQrItem, index)
                      }></QItemSwitcher>
                  )}
                  <Button>
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
          onClick={() => {
            setRepeatAnswers([...repeatAnswers, undefined]);
          }}>
          <Add sx={{ mr: 1 }} />
          Add Item
        </Button>
      </Stack>
    </div>
  );
}

export default QItemRepeats;
