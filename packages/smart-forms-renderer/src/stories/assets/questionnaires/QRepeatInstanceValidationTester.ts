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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

/**
 * Fixtures for issue #1985 — validation errors on repeating group items must be scoped to the
 * instance that is actually invalid, and must survive the rendered instance index diverging from
 * the QuestionnaireResponse instance index (unselected gtable rows are dropped from the QR).
 */

const gtableItemControl = {
  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
  valueCodeableConcept: {
    coding: [
      {
        system: 'http://hl7.org/fhir/questionnaire-item-control',
        code: 'gtable'
      }
    ]
  }
};

export const qRepeatGroupWithRequiredChild: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RepeatGroupRequiredChild',
  name: 'RepeatGroupRequiredChild',
  title: 'Repeat Group With Required Child',
  status: 'draft',
  item: [
    {
      linkId: 'contacts',
      text: 'Contacts',
      type: 'group',
      repeats: true,
      item: [
        {
          linkId: 'contact-nickname',
          text: 'Nickname',
          type: 'string'
        },
        {
          linkId: 'contact-name',
          text: 'Name',
          type: 'string',
          required: true
        }
      ]
    }
  ]
};

/** Second instance is missing its required `contact-name` */
export const qrRepeatGroupSecondInstanceInvalid: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'contacts',
      text: 'Contacts',
      item: [
        { linkId: 'contact-nickname', text: 'Nickname', answer: [{ valueString: 'Ally' }] },
        { linkId: 'contact-name', text: 'Name', answer: [{ valueString: 'Alice' }] }
      ]
    },
    {
      linkId: 'contacts',
      text: 'Contacts',
      item: [{ linkId: 'contact-nickname', text: 'Nickname', answer: [{ valueString: 'Bobby' }] }]
    }
  ]
};

export const qGTableWithRequiredColumn: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'GTableRequiredColumn',
  name: 'GTableRequiredColumn',
  title: 'GTable With Required Column',
  status: 'draft',
  item: [
    {
      linkId: 'people',
      text: 'People',
      type: 'group',
      repeats: true,
      extension: [gtableItemControl],
      item: [
        {
          linkId: 'given-name',
          text: 'Given name',
          type: 'string'
        },
        {
          linkId: 'family-name',
          text: 'Family name',
          type: 'string',
          required: true
        }
      ]
    }
  ]
};

/** Three rows, only the third is missing its required `family-name` */
export const qrGTableThirdRowInvalid: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'people',
      text: 'People',
      item: [
        { linkId: 'given-name', text: 'Given name', answer: [{ valueString: 'Alice' }] },
        { linkId: 'family-name', text: 'Family name', answer: [{ valueString: 'Anderson' }] }
      ]
    },
    {
      linkId: 'people',
      text: 'People',
      item: [
        { linkId: 'given-name', text: 'Given name', answer: [{ valueString: 'Bob' }] },
        { linkId: 'family-name', text: 'Family name', answer: [{ valueString: 'Brown' }] }
      ]
    },
    {
      linkId: 'people',
      text: 'People',
      item: [{ linkId: 'given-name', text: 'Given name', answer: [{ valueString: 'Carol' }] }]
    }
  ]
};
