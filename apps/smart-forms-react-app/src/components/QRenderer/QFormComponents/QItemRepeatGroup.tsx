import React, { useEffect, useState } from 'react';
import { Box, Button, Card, IconButton, Stack, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../interfaces/Interfaces';
import { Add, Delete } from '@mui/icons-material';
import QItemGroup from './QItemGroup';

import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { createQrItem } from '../../../functions/QrItemFunctions';
import { hideQItem } from '../../../functions/QItemFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
  groupCardElevation: number;
}

function QItemRepeatGroup(props: Props) {
  const { qItem, qrItem, groupCardElevation, onQrItemChange } = props;

  const cleanQrItem = createQrItem(qItem);
  const qrRepeat = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswerItems: (QuestionnaireResponseItemAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const [repeatAnswerItems, setRepeatAnswerItems] = useState(qrRepeatAnswerItems);

  useEffect(() => {
    setRepeatAnswerItems(qrRepeatAnswerItems);
  }, [qrItem]);

  if (hideQItem(qItem)) return null;

  function handleAnswerItemsChange(newQrGroup: QuestionnaireResponseItem, index: number) {
    const answerItemsTemp = [...repeatAnswerItems];

    if (newQrGroup.item) {
      answerItemsTemp[index] = { item: newQrGroup.item };
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

  function updateAnswerItems(updatedAnswerItems: (QuestionnaireResponseItemAnswer | undefined)[]) {
    setRepeatAnswerItems([...updatedAnswerItems]);

    const answersWithValues = updatedAnswerItems.flatMap((answerItems) =>
      answerItems ? [answerItems] : []
    );
    onQrItemChange({ ...qrRepeat, answer: answersWithValues });
  }

  return (
    <Card elevation={groupCardElevation} sx={{ mb: 6, p: 4 }}>
      <Typography variant="h6" sx={{ mb: 4 }}>
        {qItem.text}
      </Typography>
      {repeatAnswerItems.map((answerItem, index) => {
        const singleQrItem: QuestionnaireResponseItem = answerItem
          ? { ...cleanQrItem, item: answerItem.item }
          : { ...cleanQrItem };

        return (
          <Stack
            key={index}
            direction="row"
            justifyContent="end"
            alignItems="center"
            sx={{ pb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <QItemGroup
                qItem={qItem}
                qrItem={singleQrItem}
                repeats={true}
                groupCardElevation={groupCardElevation + 1}
                onQrItemChange={(newQrGroup) =>
                  handleAnswerItemsChange(newQrGroup, index)
                }></QItemGroup>
            </Box>

            <Box sx={{ ml: 1 }}>
              <IconButton
                size="small"
                color="error"
                disabled={!answerItem}
                onClick={() => deleteAnswerItem(index)}>
                <Delete />
              </IconButton>
            </Box>
          </Stack>
        );
      })}

      <Stack direction="row" justifyContent="end" sx={{ mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          disabled={!repeatAnswerItems[repeatAnswerItems.length - 1]}
          onClick={() => setRepeatAnswerItems([...repeatAnswerItems, undefined])}>
          Add Item
        </Button>
      </Stack>
    </Card>
  );
}

export default QItemRepeatGroup;
