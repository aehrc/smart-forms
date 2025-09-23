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

import React from 'react';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
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
import { generateExistingRepeatId, generateNewRepeatId } from '../../../utils/repeatId';
import ItemLabel from '../ItemParts/ItemLabel';
import { appendRepeatIndexToLastSegment } from '../../../utils/itemPath';
import type { ItemPath } from '../../../interfaces/itemPath.interface';

interface RepeatItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithItemPathAttribute,
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
  const { qItem, qrItem, itemPath, groupCardElevation, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  const repeatAnswers = useInitialiseRepeatAnswers(qItem.linkId, qrItem);

  // Event Handlers
  function handleAnswerChange(
    newQrItem: QuestionnaireResponseItem,
    index: number,
    targetItemPath?: ItemPath
  ) {
    const updatedRepeatAnswers = [...repeatAnswers];
    updatedRepeatAnswers[index] = newQrItem.answer ? newQrItem.answer[0] : null;

    // Include targetItemPath because an answer is changed
    onQrItemChange(
      {
        ...createEmptyQrItem(qItem, undefined),
        answer: updatedRepeatAnswers.flatMap((repeatAnswer) => (repeatAnswer ? [repeatAnswer] : []))
      },
      targetItemPath
    );
  }

  function handleRemoveItem(index: number) {
    const updatedRepeatAnswers = [...repeatAnswers];

    updatedRepeatAnswers.splice(index, 1);

    // Don't need to include targetItemPath, only include targetItemPath if an answer is changed
    onQrItemChange({
      ...createEmptyQrItem(qItem, undefined),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) => (repeatAnswer ? [repeatAnswer] : []))
    });
  }

  function handleAddItem() {
    const updatedRepeatAnswers = [...repeatAnswers, { id: generateNewRepeatId(qItem.linkId) }];

    // Don't need to include targetItemPath, only include targetItemPath if an answer is changed
    onQrItemChange({
      ...createEmptyQrItem(qItem, undefined),
      answer: updatedRepeatAnswers.flatMap((repeatAnswer) => (repeatAnswer ? [repeatAnswer] : []))
    });
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-repeat-box"
      data-linkid={qItem.linkId}
      data-label={qItem.text}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
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
                  <RepeatField
                    qItem={qItem}
                    qrItem={repeatAnswerQrItem}
                    answer={answer}
                    numOfRepeatAnswers={repeatAnswers.length}
                    itemPath={appendRepeatIndexToLastSegment(itemPath, index)}
                    groupCardElevation={groupCardElevation}
                    parentIsReadOnly={parentIsReadOnly}
                    onRemoveAnswer={() => handleRemoveItem(index)}
                    onQrItemChange={(newQrItem, targetItemPath) =>
                      handleAnswerChange(newQrItem, index, targetItemPath)
                    }
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        }
      />

      <AddItemButton repeatAnswers={repeatAnswers} readOnly={readOnly} onAddItem={handleAddItem} />
    </FullWidthFormComponentBox>
  );
}

export default RepeatItem;
