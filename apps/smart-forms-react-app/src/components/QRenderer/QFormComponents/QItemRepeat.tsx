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
import { isHidden } from '../../../functions/QItemFunctions';
import QItemDisplayInstructions from './QItemSimple/QItemDisplayInstructions';
import { RepeatDeleteTooltip, RepeatItemContainerStack } from './QItemRepeat.styles';
import QItemLabel from './QItemParts/QItemLabel';
import { EnableWhenContext } from '../../../custom-contexts/EnableWhenContext';
import { EnableWhenChecksContext } from '../Form';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeat(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const enableWhenContext = React.useContext(EnableWhenContext);
  const enableWhenChecksContext = React.useContext(EnableWhenChecksContext);

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

  if (isHidden(qItem, enableWhenContext, enableWhenChecksContext)) return null;

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
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          {repeatAnswers.map((answer, index) => {
            const singleQrItem = answer ? { ...cleanQrItem, answer: [answer] } : { ...cleanQrItem };

            return (
              <React.Fragment key={index}>
                <RepeatItemContainerStack direction="row">
                  <Box sx={{ flexGrow: 1 }}>
                    <QItemSwitcher
                      qItem={qItem}
                      qrItem={singleQrItem}
                      repeats={qItem.repeats ?? false}
                      onQrItemChange={(newQrItem) =>
                        handleAnswersChange(newQrItem, index)
                      }></QItemSwitcher>
                  </Box>
                  <RepeatDeleteTooltip className="repeat-item-delete" title="Delete item">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={!answer}
                        onClick={() => deleteAnswer(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </span>
                  </RepeatDeleteTooltip>
                </RepeatItemContainerStack>
              </React.Fragment>
            );
          })}
          <QItemDisplayInstructions qItem={qItem} />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="end" sx={{ mt: 1, mb: 3 }}>
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
