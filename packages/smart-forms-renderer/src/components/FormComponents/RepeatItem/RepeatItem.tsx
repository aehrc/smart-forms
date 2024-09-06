/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import React from 'react';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { nanoid } from 'nanoid';
import { createEmptyQrItem } from '../../../utils/qrItem';
import { FullWidthFormComponentBox } from '../../Box.styles';
import AddItemButton from './AddItemButton';
import { TransitionGroup } from 'react-transition-group';
import RepeatField from './RepeatField';
import Collapse from '@mui/material/Collapse';
import useInitialiseRepeatAnswers from '../../../hooks/useInitialiseRepeatAnswers';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';

interface RepeatItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
  groupCardElevation: number;
}

/**
 * Main component to render a repeating, non-group Questionnaire item.
 *
 * @author Sean Fong
 */
function RepeatItem(props: RepeatItemProps) {
  const { qItem, qrItem, groupCardElevation, showMinimalView, parentIsReadOnly, onQrItemChange } =
    props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const repeatAnswers = useInitialiseRepeatAnswers(qrItem);

  // Event Handlers
  function handleAnswerChange(newQrItem: QuestionnaireResponseItem, index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];
    updatedRepeatAnswers[index] = newQrItem.answer ? newQrItem.answer[0] : null;

    onQrItemChange({
      ...createEmptyQrItem(qItem, undefined),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) => (repeatAnswer ? [repeatAnswer] : []))
    });
  }

  function handleDeleteItem(index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];

    updatedRepeatAnswers.splice(index, 1);

    onQrItemChange({
      ...createEmptyQrItem(qItem, undefined),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) => (repeatAnswer ? [repeatAnswer] : []))
    });
  }

  function handleAddItem() {
    const updatedRepeatAnswers = [...repeatAnswers, { id: nanoid() }];

    onQrItemChange({
      ...createEmptyQrItem(qItem, undefined),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) => (repeatAnswer ? [repeatAnswer] : []))
    });
  }

  if (showMinimalView) {
    return (
      <>
        {repeatAnswers.map((answer, index) => {
          const repeatAnswerQrItem = createEmptyQrItem(qItem, answer?.id);
          if (answer) {
            repeatAnswerQrItem.answer = [answer];
          }

          return (
            <RepeatField
              key={answer?.id ?? nanoid()}
              qItem={qItem}
              qrItem={repeatAnswerQrItem}
              answer={answer}
              numOfRepeatAnswers={repeatAnswers.length}
              groupCardElevation={groupCardElevation}
              parentIsReadOnly={parentIsReadOnly}
              showMinimalView={showMinimalView}
              onDeleteAnswer={() => handleDeleteItem(index)}
              onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
            />
          );
        })}
      </>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-repeat-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <TransitionGroup>
          {repeatAnswers.map((answer, index) => {
            const repeatAnswerQrItem = createEmptyQrItem(qItem, answer?.id);
            if (answer) {
              repeatAnswerQrItem.answer = [answer];
            }

            return (
              <Collapse key={answer?.id ?? nanoid()} timeout={200}>
                <RepeatField
                  qItem={qItem}
                  qrItem={repeatAnswerQrItem}
                  answer={answer}
                  numOfRepeatAnswers={repeatAnswers.length}
                  groupCardElevation={groupCardElevation}
                  parentIsReadOnly={parentIsReadOnly}
                  showMinimalView={showMinimalView}
                  onDeleteAnswer={() => handleDeleteItem(index)}
                  onQrItemChange={(newQrItem) => handleAnswerChange(newQrItem, index)}
                />
              </Collapse>
            );
          })}
        </TransitionGroup>
      </ItemFieldGrid>

      <AddItemButton repeatAnswers={repeatAnswers} readOnly={readOnly} onAddItem={handleAddItem} />
    </FullWidthFormComponentBox>
  );
}

export default RepeatItem;
