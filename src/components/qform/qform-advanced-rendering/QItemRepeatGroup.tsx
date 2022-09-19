import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { Add, Delete } from '@mui/icons-material';
import QItemGroup from '../qform-items/QItemGroup';

import {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeatGroup(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const cleanQrItem = QuestionnaireResponseService.createQrItem(qItem);
  const qrRepeat = qrItem ? qrItem : cleanQrItem;
  const qrRepeatAnswerItems: (QuestionnaireResponseItemAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const [repeatAnswerItems, setRepeatAnswerItems] = useState(qrRepeatAnswerItems);

  useEffect(() => {
    setRepeatAnswerItems(qrRepeatAnswerItems);
  }, [qrItem]);

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
    <div>
      <Card sx={{ mb: 2, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 4 }}>
          {qItem.text}
        </Typography>
        {repeatAnswerItems.map((answerItem, index) => {
          const singleQrItem: QuestionnaireResponseItem = answerItem
            ? { ...cleanQrItem, item: answerItem.item }
            : { ...cleanQrItem };

          return (
            <Stack key={index} direction="row" justifyContent="end" sx={{ pb: 2 }}>
              <Box sx={{ width: 1 }}>
                <QItemGroup
                  qItem={qItem}
                  qrItem={singleQrItem}
                  repeats={true}
                  onQrItemChange={(newQrGroup) =>
                    handleAnswerItemsChange(newQrGroup, index)
                  }></QItemGroup>
              </Box>

              <Button disabled={!answerItem} onClick={() => deleteAnswerItem(index)}>
                <Delete />
              </Button>
            </Stack>
          );
        })}

        <Stack direction="row" justifyContent="end">
          <Button
            disabled={!repeatAnswerItems[repeatAnswerItems.length - 1]}
            onClick={() => setRepeatAnswerItems([...repeatAnswerItems, undefined])}>
            <Add sx={{ mr: 1 }} />
            Add Item
          </Button>
        </Stack>
      </Card>
    </div>
  );
}

export default QItemRepeatGroup;
