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

import React, { useMemo } from 'react';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import FormTopLevelItem from './FormTopLevelItem';
import type { QuestionnaireResponseItem } from 'fhir/r4';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../stores';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { updateQrItemsInGroup } from '../../utils/qrItem';
import { everyIsPages } from '../../utils/page';
import type { QrRepeatGroup } from '../../interfaces/repeatGroup.interface';
import FormTopLevelPage from './FormTopLevelPage';
import cloneDeep from 'lodash.clonedeep';

/**
 * Main component of the form-rendering engine.
 * Renders the Questionnaire and QuestionnaireResponse defined in the state management stores QuestionnaireStore and QuestionnaireResponseStore respectively.
 * Use buildForm() in your wrapping component or in an event handler to initialise the form.
 *
 * @author Sean Fong
 */
function BaseRenderer() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updateExpressions = useQuestionnaireStore.use.updateExpressions();
  const readOnly = useQuestionnaireStore.use.readOnly();

  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const validateQuestionnaire = useQuestionnaireResponseStore.use.validateQuestionnaire();
  const updateResponse = useQuestionnaireResponseStore.use.updateResponse();

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(sourceQuestionnaire), [sourceQuestionnaire]);

  function handleTopLevelQRItemSingleChange(newTopLevelQRItem: QuestionnaireResponseItem) {
    const responseToUpdate = cloneDeep(updatableResponse);

    updateQrItemsInGroup(newTopLevelQRItem, null, responseToUpdate, qItemsIndexMap);

    updateExpressions(responseToUpdate);
    validateQuestionnaire(sourceQuestionnaire, responseToUpdate);
    updateResponse(responseToUpdate);
  }

  function handleTopLevelQRItemMultipleChange(newTopLevelQRItems: QrRepeatGroup) {
    const responseToUpdate = cloneDeep(updatableResponse);

    updateQrItemsInGroup(null, newTopLevelQRItems, responseToUpdate, qItemsIndexMap);

    updateExpressions(responseToUpdate);
    validateQuestionnaire(sourceQuestionnaire, responseToUpdate);
    updateResponse(responseToUpdate);
  }

  const topLevelQItems = sourceQuestionnaire.item;
  const topLevelQRItems = cloneDeep(updatableResponse.item) ?? [];

  if (!topLevelQItems) {
    return <>Questionnaire does not have any items</>;
  }

  // If an item has multiple answers, it is a repeat group
  const topLevelQRItemsByIndex = getQrItemsIndex(topLevelQItems, topLevelQRItems, qItemsIndexMap);

  const everyItemIsPage = everyIsPages(topLevelQItems);

  if (everyItemIsPage) {
    return (
      <Fade in={true} timeout={500}>
        <Container maxWidth="xl">
          <FormTopLevelPage
            topLevelQItems={topLevelQItems}
            topLevelQRItems={topLevelQRItemsByIndex}
            parentIsReadOnly={readOnly}
            onQrItemChange={(newTopLevelQRItem) =>
              handleTopLevelQRItemSingleChange(newTopLevelQRItem)
            }
          />
        </Container>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="xl">
        {topLevelQItems.map((qItem, index) => {
          const qrItemOrItems = topLevelQRItemsByIndex[index];

          return (
            <FormTopLevelItem
              key={qItem.linkId}
              topLevelQItem={qItem}
              topLevelQRItemOrItems={qrItemOrItems ?? null}
              parentIsReadOnly={readOnly}
              onQrItemChange={(newTopLevelQRItem) =>
                handleTopLevelQRItemSingleChange(newTopLevelQRItem)
              }
              onQrRepeatGroupChange={(newTopLevelQRItems) =>
                handleTopLevelQRItemMultipleChange(newTopLevelQRItems)
              }
            />
          );
        })}
      </Container>
    </Fade>
  );
}

export default BaseRenderer;
