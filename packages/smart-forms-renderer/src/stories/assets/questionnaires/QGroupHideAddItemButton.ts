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

import type { Questionnaire } from 'fhir/r4';

export const qGroupHideAddItemButton: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  item: [
    {
      linkId: 'normal-repeat-group',
      type: 'group',
      text: 'Normal Repeating Group (Add Item button visible)',
      repeats: true,
      item: [
        {
          linkId: 'normal-name',
          type: 'string',
          text: 'Name',
          required: true
        },
        {
          linkId: 'normal-age',
          type: 'integer',
          text: 'Age'
        }
      ]
    },
    {
      linkId: 'hidden-add-repeat-group',
      type: 'group',
      text: 'Repeating Group with Hidden Add Item Button',
      repeats: true,
      extension: [
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
          valueBoolean: true
        }
      ],
      item: [
        {
          linkId: 'hidden-name',
          type: 'string',
          text: 'Name',
          required: true
        },
        {
          linkId: 'hidden-title',
          type: 'string',
          text: 'Title'
        }
      ]
    },
    {
      linkId: 'normal-group-table',
      type: 'group',
      text: 'Normal Group Table (Add Row button visible)',
      repeats: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'gtable'
              }
            ]
          }
        }
      ],
      item: [
        {
          linkId: 'table-product',
          type: 'string',
          text: 'Product',
          required: true
        },
        {
          linkId: 'table-quantity',
          type: 'integer',
          text: 'Quantity'
        },
        {
          linkId: 'table-price',
          type: 'decimal',
          text: 'Price'
        }
      ]
    },
    {
      linkId: 'hidden-add-group-table',
      type: 'group',
      text: 'Group Table with Hidden Add Row Button',
      repeats: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'gtable'
              }
            ]
          }
        },
        {
          url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
          valueBoolean: true
        }
      ],
      item: [
        {
          linkId: 'static-item',
          type: 'string',
          text: 'Static Item',
          required: true
        },
        {
          linkId: 'static-value',
          type: 'string',
          text: 'Value'
        }
      ]
    }
  ]
};
