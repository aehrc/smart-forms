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
import type { PropsWithQrItemChangeHandler } from '../../../../types/renderProps.interface.ts';
import type {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { nanoid } from 'nanoid';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import FieldGrid from '../FieldGrid.tsx';
import AddItemButton from './AddItemButton.tsx';
import { TransitionGroup } from 'react-transition-group';
import RepeatField from './RepeatField.tsx';
import { Collapse } from '@mui/material';

interface RepeatItemProps extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function RepeatItem(props: RepeatItemProps) {
  const { qItem, qrItem, onQrItemChange } = props;

  // Get additional rendering extensions
  const { displayInstructions } = useRenderingExtensions(qItem);

  // Init repeat answers and answer ids
  let initialRepeatAnswers: (QuestionnaireResponseItemAnswer | null)[] = [null];
  if (qrItem?.answer) {
    initialRepeatAnswers = qrItem.answer;
  }

  if (initialRepeatAnswers[initialRepeatAnswers.length - 1] !== null) {
    initialRepeatAnswers.push(null);
  }
  const [repeatAnswers, setRepeatAnswers] = useState(initialRepeatAnswers);

  const initialAnswerIds = initialRepeatAnswers.map(() => nanoid());
  const [answerIds, setAnswerIds] = useState(initialAnswerIds);

  useEffect(
    () => {
      if (repeatAnswers.length === 0) {
        setRepeatAnswers([null]);
        setAnswerIds([nanoid()]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qrItem]
  );

  // Event Handlers
  function handleAnswersChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const answersTemp = [...repeatAnswers];
    answersTemp[index] = newQrItem.answer ? newQrItem.answer[0] : null;
    updateAnswers(answersTemp, [...answerIds]);
  }

  function handleDeleteAnswer(index: number) {
    const answersTemp = [...repeatAnswers];
    const idsTemp = [...answerIds];

    if (answersTemp.length === 1) {
      answersTemp[0] = null;
      idsTemp[0] = nanoid();
    } else {
      answersTemp.splice(index, 1);
      idsTemp.splice(index, 1);
    }
    updateAnswers(answersTemp, idsTemp);
  }

  function updateAnswers(
    updatedAnswers: (QuestionnaireResponseItemAnswer | null)[],
    updatedIds: string[]
  ) {
    setRepeatAnswers(updatedAnswers);
    setAnswerIds(updatedIds);

    const answersWithValues = updatedAnswers.flatMap((answer) => (answer ? [answer] : []));
    onQrItemChange({ ...createEmptyQrItem(qItem), answer: answersWithValues });
  }

  function handleAddItem() {
    setRepeatAnswers([...repeatAnswers, null]);
    setAnswerIds([...answerIds, nanoid()]);
  }

  return (
    <FullWidthFormComponentBox data-test="q-item-repeat-box">
      <FieldGrid qItem={qItem} displayInstructions={displayInstructions}>
        <TransitionGroup>
          {repeatAnswers.map((answer, index) => {
            const repeatAnswerQrItem = createEmptyQrItem(qItem);
            if (answer) {
              repeatAnswerQrItem.answer = [answer];
            }

            return (
              <Collapse key={answerIds[index]} timeout={200}>
                <RepeatField
                  qItem={qItem}
                  qrItem={repeatAnswerQrItem}
                  answer={answer}
                  numOfRepeatAnswers={repeatAnswers.length}
                  onDeleteAnswer={() => handleDeleteAnswer(index)}
                  onQrItemChange={(newQrItem) => handleAnswersChange(newQrItem, index)}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>
      </FieldGrid>

      <AddItemButton repeatAnswers={repeatAnswers} onAddItem={handleAddItem} />
    </FullWidthFormComponentBox>
  );
}

export default RepeatItem;
