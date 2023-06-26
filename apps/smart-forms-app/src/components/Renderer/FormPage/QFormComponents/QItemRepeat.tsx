/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useState } from 'react';
import { Box, Button, Collapse, Grid, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import QItemSwitcher from './QItemSwitcher';
import type {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { createEmptyQrItem } from '../../../../features/renderer/utils/qrItem.ts';
import QItemDisplayInstructions from './QItemSimple/QItemDisplayInstructions';
import { RepeatDeleteTooltip, RepeatItemContainerStack } from './QItemRepeat.styles';
import QItemLabel from './QItemParts/QItemLabel';
import { TransitionGroup } from 'react-transition-group';
import { FullWidthFormComponentBox } from '../../../StyledComponents/Boxes.styles';
import { nanoid } from 'nanoid';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import useRenderingExtensions from '../../../../features/renderer/hooks/useRenderingExtensions.ts';
import type { PropsWithQrItemChangeHandler } from '../../../../features/renderer/types/renderProps.interface.ts';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemRepeat(props: Props) {
  const { qItem, qrItem, onQrItemChange } = props;

  const qrRepeat = qrItem ?? createEmptyQrItem(qItem);
  const qrRepeatAnswers: (QuestionnaireResponseItemAnswer | undefined)[] = qrRepeat['answer']
    ? qrRepeat.answer
    : [undefined];

  const initialRepeatAnswers = [...qrRepeatAnswers];
  if (initialRepeatAnswers[initialRepeatAnswers.length - 1] !== undefined) {
    initialRepeatAnswers.push(undefined);
  }

  const [repeatAnswers, setRepeatAnswers] = useState(initialRepeatAnswers);
  const [answerIds, setAnswerIds] = useState(initialRepeatAnswers.map(() => nanoid()));

  useEffect(
    () => {
      if (repeatAnswers.length === 0) {
        setRepeatAnswers([undefined]);
        setAnswerIds([nanoid()]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qrItem]
  );

  // Get additional rendering extensions
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Event Handlers
  function handleAnswersChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const answersTemp = [...repeatAnswers];
    answersTemp[index] = newQrItem.answer ? newQrItem.answer[0] : undefined;
    updateAnswers(answersTemp, [...answerIds]);
  }

  function deleteAnswer(index: number) {
    const answersTemp = [...repeatAnswers];
    const idsTemp = [...answerIds];
    if (answersTemp.length === 1) {
      answersTemp[0] = undefined;
      idsTemp[0] = nanoid();
    } else {
      answersTemp.splice(index, 1);
      idsTemp.splice(index, 1);
    }
    updateAnswers(answersTemp, idsTemp);
  }

  function updateAnswers(
    updatedAnswers: (QuestionnaireResponseItemAnswer | undefined)[],
    updatedIds: string[]
  ) {
    setRepeatAnswers(updatedAnswers);
    setAnswerIds(updatedIds);

    const answersWithValues = updatedAnswers.flatMap((answer) => (answer ? [answer] : []));
    onQrItemChange({ ...createEmptyQrItem(qItem), answer: answersWithValues });
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-repeat-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <TransitionGroup>
            {repeatAnswers.map((answer, index) => {
              const singleQrItem = answer
                ? { ...createEmptyQrItem(qItem), answer: [answer] }
                : createEmptyQrItem(qItem);

              return (
                <Collapse key={answerIds[index]} timeout={200}>
                  <RepeatItemContainerStack direction="row">
                    <Box sx={{ flexGrow: 1 }}>
                      <QItemSwitcher
                        qItem={qItem}
                        qrItem={singleQrItem}
                        isRepeated={qItem.repeats ?? false}
                        isTabled={false}
                        onQrItemChange={(newQrItem) =>
                          handleAnswersChange(newQrItem, index)
                        }></QItemSwitcher>
                    </Box>
                    <RepeatDeleteTooltip className="repeat-item-delete" title="Delete item">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!answer || repeatAnswers.length === 1}
                          onClick={() => deleteAnswer(index)}>
                          <RemoveCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </RepeatDeleteTooltip>
                  </RepeatItemContainerStack>
                </Collapse>
              );
            })}
          </TransitionGroup>
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="end" sx={{ mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled={!repeatAnswers[repeatAnswers.length - 1]}
          onClick={() => {
            setRepeatAnswers([...repeatAnswers, undefined]);
            setAnswerIds([...answerIds, nanoid()]);
          }}
          data-test="button-add-repeat-item">
          Add Item
        </Button>
      </Stack>
    </FullWidthFormComponentBox>
  );
}

export default QItemRepeat;
