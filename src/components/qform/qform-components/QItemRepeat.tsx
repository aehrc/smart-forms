import React, { useEffect, useState } from 'react';
import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler } from '../FormModel';
import { Add, Delete } from '@mui/icons-material';
import QItemSwitcher from './QItemSwitcher';
import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { createQrItem } from '../functions/QrItemFunctions';
import { isHidden } from '../functions/QItemFunctions';
import { EnableWhenContext } from '../functions/EnableWhenContext';
import { EnableWhenChecksContext } from '../QForm';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeat(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;
  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

  if (isHidden(qItem)) return null;

  // only for testing
  if (enableWhenChecksContext) {
    if (!enableWhenContext.checkItemIsEnabled(qItem.linkId)) return null; // preserve this line in final build
  }

  const cleanQrItem = createQrItem(qItem);
  const qrRepeat = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswers: (QuestionnaireResponseItemAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const [repeatAnswers, setRepeatAnswers] = useState([...qrRepeatAnswers, undefined]);

  useEffect(() => {
    const lastRepeatItem = repeatAnswers[repeatAnswers.length - 1];
    if (lastRepeatItem === undefined) {
      setRepeatAnswers([...qrRepeatAnswers, undefined]);
    } else {
      setRepeatAnswers(qrRepeatAnswers);
    }
  }, [qrItem]);

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
    <div>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {repeatAnswers.map((answer, index) => {
            const singleQrItem = answer ? { ...cleanQrItem, answer: [answer] } : { ...cleanQrItem };

            return (
              <div key={index}>
                {index !== 0 ? <Divider light sx={{ mb: 2, mt: 1 }} /> : null}
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
                  <Button disabled={!answer} onClick={() => deleteAnswer(index)}>
                    <Delete />
                  </Button>
                </Stack>
              </div>
            );
          })}
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="end" sx={{ mt: 2, mb: 5 }}>
        <Button
          variant="contained"
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
