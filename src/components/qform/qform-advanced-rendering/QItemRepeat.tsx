import React, { useEffect, useState } from 'react';
import { Button, FormControl, Grid, Stack, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { Add, Delete } from '@mui/icons-material';
import QItemSwitcher from '../qform-items/QItemSwitcher';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeat(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const cleanQrItem = QuestionnaireResponseService.createQrItem(qItem);
  const qrRepeat = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswers: (QuestionnaireResponseItemAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const [repeatAnswers, setRepeatAnswers] = useState(qrRepeatAnswers);

  useEffect(() => {
    setRepeatAnswers(qrRepeatAnswers);
  }, [qrItem]);

  function handleAnswersChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const answersTemp = [...repeatAnswers];
    if (newQrItem.answer) {
      answersTemp[index] = newQrItem.answer[0];
    }
    updateAnswers(answersTemp);
  }

  function deleteAnswer(index: number) {
    const answersTemp = [...repeatAnswers];
    if (answersTemp.length === 1) {
      answersTemp[0] = undefined;
    } else {
      answersTemp.splice(index, 1);
    }
    updateAnswers(answersTemp);
  }

  function updateAnswers(updatedAnswers: (QuestionnaireResponseItemAnswer | undefined)[]) {
    setRepeatAnswers(updatedAnswers);

    const answersWithValues = updatedAnswers.flatMap((answer) => (answer ? [answer] : []));
    onQrItemChange({ ...qrRepeat, answer: answersWithValues });
  }

  return (
    <div>
      <FormControl>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            {repeatAnswers.map((answer, index) => {
              const singleQrItem = answer
                ? { ...cleanQrItem, answer: [answer] }
                : { ...cleanQrItem };

              return (
                <Stack key={index} direction="row" sx={{ pb: 2 }}>
                  <QItemSwitcher
                    qItem={qItem}
                    qrItem={singleQrItem}
                    repeats={qItem.repeats ?? false}
                    onQrItemChange={(newQrItem) =>
                      handleAnswersChange(newQrItem, index)
                    }></QItemSwitcher>

                  <Button disabled={!answer} onClick={() => deleteAnswer(index)}>
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
          disabled={!repeatAnswers[repeatAnswers.length - 1]}
          onClick={() => setRepeatAnswers([...repeatAnswers, undefined])}>
          <Add sx={{ mr: 1 }} />
          Add Item
        </Button>
      </Stack>
    </div>
  );
}

export default QItemRepeat;
