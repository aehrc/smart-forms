/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import React, { useState } from 'react';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type {
  QuestionnaireItem,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { answerHasValue } from '../../../utils/manageForm';
import { FullWidthFormComponentBox } from '../../Box.styles';
import AddItemButton from './AddItemButton';
import { TransitionGroup } from 'react-transition-group';
import Collapse from '@mui/material/Collapse';
import useInitialiseRepeatAnswers from '../../../hooks/useInitialiseRepeatAnswers';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import { generateExistingRepeatId, generateNewRepeatId } from '../../../utils/repeatId';
import ItemLabel from '../ItemParts/ItemLabel';
import Box from '@mui/material/Box';
import SingleItem from '../SingleItem/SingleItem';
import RemoveItemButton from './RemoveItemButton';

interface RepeatItemProps extends PropsWithQrItemChangeHandler, PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

/**
 * Main component to render a repeating, non-group Questionnaire item.
 * Repeat answer instances (including empty ones) are tracked in local state, similar to
 * RepeatGroup and GroupTable - only answers with values are emitted to the QuestionnaireResponse.
 *
 * @author Sean Fong
 */
function RepeatItem(props: RepeatItemProps) {
  const { qItem, qrItem, groupCardElevation, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const initialRepeatAnswers = useInitialiseRepeatAnswers(qItem.linkId, qrItem);

  const [repeatAnswers, setRepeatAnswers] = useState(initialRepeatAnswers);

  // Emit only answers with values - empty answer instances stay in local state so the
  // QuestionnaireResponse is not polluted with value-less stub answers e.g. { id: answerKey }
  function emitAnswersWithValues(updatedRepeatAnswers: (QuestionnaireResponseItemAnswer | null)[]) {
    onQrItemChange({
      ...createEmptyQrItem(qItem, undefined),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) =>
        repeatAnswer && answerHasValue(repeatAnswer) ? [repeatAnswer] : []
      )
    });
  }

  // Event Handlers
  function handleAnswerChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];
    updatedRepeatAnswers[index] = newQrItem.answer ? newQrItem.answer[0] : null;

    setRepeatAnswers(updatedRepeatAnswers);
    emitAnswersWithValues(updatedRepeatAnswers);
  }

  function handleRemoveItem(index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];

    updatedRepeatAnswers.splice(index, 1);

    if (updatedRepeatAnswers.length === 0) {
      updatedRepeatAnswers.push({ id: generateNewRepeatId(qItem.linkId) });
    }

    setRepeatAnswers(updatedRepeatAnswers);
    emitAnswersWithValues(updatedRepeatAnswers);
  }

  function handleAddItem() {
    // The new answer instance has no value yet, so the QuestionnaireResponse does not change
    setRepeatAnswers([...repeatAnswers, { id: generateNewRepeatId(qItem.linkId) }]);
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-repeat-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}
      sx={{ maxWidth: 'none' }}>
      <TransitionGroup>
        {repeatAnswers.map((answer, index) => {
          const repeatAnswerQrItem = createEmptyQrItem(qItem, answer?.id);
          if (answer) {
            repeatAnswerQrItem.answer = [answer];
          }

          return (
            <Collapse
              key={answer?.id ?? generateExistingRepeatId(qItem.linkId, index)}
              timeout={200}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box
                  sx={(theme) => ({
                    flex: '1 1 0',
                    minWidth: 0,
                    maxWidth: `calc(${theme.breakpoints.values.lg}px - 100px)`
                  })}>
                  <ItemFieldGrid
                    qItem={qItem}
                    readOnly={readOnly}
                    labelChildren={
                      index === 0 ? <ItemLabel qItem={qItem} readOnly={readOnly} /> : undefined
                    }
                    fieldChildren={
                      <SingleItem
                        qItem={qItem}
                        qrItem={repeatAnswerQrItem}
                        isRepeated={qItem.repeats ?? false}
                        isTabled={false}
                        groupCardElevation={groupCardElevation}
                        parentIsReadOnly={parentIsReadOnly}
                        onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
                      />
                    }
                  />
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <RemoveItemButton
                    answer={answer}
                    numOfRepeatAnswers={repeatAnswers.length}
                    readOnly={readOnly}
                    onRemoveAnswer={() => handleRemoveItem(index)}
                  />
                </Box>
              </Box>
            </Collapse>
          );
        })}
      </TransitionGroup>

      <AddItemButton repeatAnswers={repeatAnswers} readOnly={readOnly} onAddItem={handleAddItem} />
    </FullWidthFormComponentBox>
  );
}

export default RepeatItem;
