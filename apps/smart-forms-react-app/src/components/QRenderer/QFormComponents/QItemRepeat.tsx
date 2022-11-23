import React, { useEffect, useState } from 'react';
import { Box, Button, Grid, IconButton, Stack } from '@mui/material';
import { PropsWithQrItemChangeHandler } from '../../../interfaces/Interfaces';
import { Add, Delete } from '@mui/icons-material';
import QItemSwitcher from './QItemSwitcher';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { createQrItem } from '../../../functions/QrItemFunctions';
import { hideQItem } from '../../../functions/QItemFunctions';
import { QItemTypography } from '../../StyledComponents/Item.styles';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeat(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const cleanQrItem = createQrItem(qItem);
  const qrRepeat = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswers: (QuestionnaireResponseItemAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const [repeatAnswers, setRepeatAnswers] = useState([...qrRepeatAnswers, undefined]);

  useEffect(() => {
    const firstRepeatItem = repeatAnswers[0];
    const lastRepeatItem = repeatAnswers[repeatAnswers.length - 1];
    if (lastRepeatItem === undefined && firstRepeatItem !== undefined) {
      setRepeatAnswers([...qrRepeatAnswers, undefined]);
    } else {
      setRepeatAnswers(qrRepeatAnswers);
    }
  }, [qrItem]);

  if (hideQItem(qItem)) return null;

  function handleAnswersChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const answersTemp = [...repeatAnswers];
    answersTemp[index] = newQrItem.answer ? newQrItem.answer[0] : undefined;
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
    const answersWithValues = updatedAnswers.flatMap((answer) => (answer ? [answer] : []));
    setRepeatAnswers(answersWithValues);
    onQrItemChange({ ...qrRepeat, answer: answersWithValues });
  }

  return (
    <>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemTypography>{qItem.text}</QItemTypography>
        </Grid>
        <Grid item xs={7}>
          {repeatAnswers.map((answer, index) => {
            const singleQrItem = answer ? { ...cleanQrItem, answer: [answer] } : { ...cleanQrItem };

            return (
              <React.Fragment key={index}>
                <Stack direction="row" sx={{ pb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <QItemSwitcher
                      qItem={qItem}
                      qrItem={singleQrItem}
                      repeats={qItem.repeats ?? false}
                      onQrItemChange={(newQrItem) =>
                        handleAnswersChange(newQrItem, index)
                      }></QItemSwitcher>
                  </Box>
                  <IconButton disabled={!answer} onClick={() => deleteAnswer(index)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </React.Fragment>
            );
          })}
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="end" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          disabled={!repeatAnswers[repeatAnswers.length - 1]}
          onClick={() => setRepeatAnswers([...repeatAnswers, undefined])}>
          Add Item
        </Button>
      </Stack>
    </>
  );
}

export default QItemRepeat;
