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

import React, { useMemo } from 'react';
import Fade from '@mui/material/Fade';
import FormTopLevelItem from './FormTopLevelItem';
import type { QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import { useQuestionnaireResponseStore, useQuestionnaireStore } from '../../stores';
import { getQrItemsIndex, mapQItemsIndex } from '../../utils/mapItem';
import { updateQrItemsInGroup } from '../../utils/qrItem';
import { isPaginatedForm } from '../../utils/page';
import type { QrRepeatGroup } from '../../interfaces/repeatGroup.interface';
import FormBodyPaginated from './FormBodyPaginated';
import { Container } from '@mui/material';
import { useFormUpdateQueueStore } from '../../stores/formUpdateQueueStore';
import type { ItemPath } from '../../interfaces/itemPath.interface';
import { createSingleItemPath } from '../../utils/itemPath';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  silenceAutocompleteTextareaWarning,
  silenceReactBeautifulDndError
} from '../../utils/silenceWarnings';

// Setup DayJs extensions when BaseRenderer.tsx is called
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);

// Silence warnings for MUI Autocomplete with Textarea and react-beautiful-dnd Droppable error
silenceAutocompleteTextareaWarning();
silenceReactBeautifulDndError();

/**
 * Main component of the form-rendering engine.
 * Renders the Questionnaire and QuestionnaireResponse defined in the state management stores QuestionnaireStore and QuestionnaireResponseStore respectively.
 * Use buildForm() in your wrapping component or in an event handler to initialise the form.
 *
 * @author Sean Fong
 */
function BaseRenderer() {
  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const readOnly = useQuestionnaireStore.use.readOnly();

  const responseKey = useQuestionnaireResponseStore.use.key();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();
  const enqueueFormUpdate = useFormUpdateQueueStore.use.enqueueFormUpdate();

  const qItemsIndexMap = useMemo(() => mapQItemsIndex(sourceQuestionnaire), [sourceQuestionnaire]);

  function handleTopLevelQRItemSingleChange(
    newTopLevelQRItem: QuestionnaireResponseItem,
    targetItemPath?: ItemPath
  ) {
    const updatedResponse: QuestionnaireResponse = structuredClone(updatableResponse);

    updateQrItemsInGroup(newTopLevelQRItem, null, updatedResponse, qItemsIndexMap);

    enqueueFormUpdate({
      questionnaireResponse: updatedResponse,
      targetItemPath: targetItemPath
    });
  }

  function handleTopLevelQRItemMultipleChange(
    newTopLevelQRItems: QrRepeatGroup,
    targetItemPath?: ItemPath
  ) {
    const updatedResponse: QuestionnaireResponse = structuredClone(updatableResponse);

    updateQrItemsInGroup(null, newTopLevelQRItems, updatedResponse, qItemsIndexMap);

    enqueueFormUpdate({
      questionnaireResponse: updatedResponse,
      targetItemPath: targetItemPath
    });
  }

  const topLevelQItems = sourceQuestionnaire.item;
  const topLevelQRItems = structuredClone(updatableResponse.item) ?? [];

  if (!topLevelQItems) {
    return (
      <>
        Questionnaire does not have any items or something has gone wrong. Try rebuilding the form.
      </>
    );
  }

  // If an item has multiple answers, it is a repeat group
  const topLevelQRItemsByIndex = getQrItemsIndex(topLevelQItems, topLevelQRItems, qItemsIndexMap);

  const wholeFormIsPaginated = isPaginatedForm(topLevelQItems);
  if (wholeFormIsPaginated) {
    return (
      <Fade in={true} timeout={500}>
        <Container disableGutters maxWidth="xl" key={responseKey}>
          <FormBodyPaginated
            topLevelQItems={topLevelQItems}
            topLevelQRItems={topLevelQRItemsByIndex}
            itemPath={[]}
            parentIsReadOnly={readOnly}
            onQrItemChange={(newTopLevelQRItem, targetItemPath) =>
              handleTopLevelQRItemSingleChange(newTopLevelQRItem, targetItemPath)
            }
          />
        </Container>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Container disableGutters maxWidth="xl" key={responseKey}>
        {topLevelQItems.map((qItem, index) => {
          const qrItemOrItems = topLevelQRItemsByIndex[index];

          return (
            <FormTopLevelItem
              key={qItem.linkId}
              topLevelQItem={qItem}
              topLevelQRItemOrItems={qrItemOrItems ?? null}
              parentIsReadOnly={readOnly}
              wholeFormIsPaginated={wholeFormIsPaginated}
              itemPath={createSingleItemPath(qItem.linkId)}
              onQrItemChange={(newTopLevelQRItem, targetItemPath) =>
                handleTopLevelQRItemSingleChange(newTopLevelQRItem, targetItemPath)
              }
              onQrRepeatGroupChange={(newTopLevelQRItems, targetItemPath) =>
                handleTopLevelQRItemMultipleChange(newTopLevelQRItems, targetItemPath)
              }
            />
          );
        })}
      </Container>
    </Fade>
  );
}

export default BaseRenderer;
