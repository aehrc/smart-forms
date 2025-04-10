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

import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';

export const qOpenChoiceAnswerOptionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceAnswerOptionBasic',
  name: 'OpenChoiceAnswerOptionBasic',
  title: 'Open Choice AnswerOption Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/open-choice/answeroption-basic',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Other, please specify'
        }
      ],
      linkId: 'health-check-location',
      text: 'Location of health check',
      type: 'open-choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '257585005',
            display: 'Clinic'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '264362003',
            display: 'Home'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '257698009',
            display: 'School'
          }
        }
      ]
    }
  ]
};

export const qrOpenChoiceAnswerOptionBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'health-check-location',
      text: 'Location of health check',
      answer: [
        {
          valueString: 'Pharmacy'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/open-choice/answeroption-basic'
};

export const qOpenChoiceAnswerValueSetBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceAnswerValueSetBasic',
  name: 'OpenChoiceAnswerValueSetBasic',
  title: 'Open Choice AnswerValueSet Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/components/display/open-choice/answervalueset-basic',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Overseas state, please specify'
        }
      ],
      linkId: 'state',
      text: 'State',
      type: 'open-choice',
      repeats: false,
      answerValueSet:
        'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
    }
  ]
};

export const qrOpenChoiceAnswerValueSetBasicResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  item: [
    {
      linkId: 'state',
      text: 'State',
      answer: [
        {
          valueString: 'Branbendurg'
        }
      ]
    }
  ],
  questionnaire: 'https://smartforms.csiro.au/docs/components/open-choice/answervalueset-basic'
};


// Questionaire with open-choice answer value set and auto-complete using the value set from terminology and valueset from embedded valueset in Tabs


export const qOpenChoiceAnswerAutoCompleteFromValueSet: Questionnaire = {
  "resourceType": "Questionnaire",
  "id": "OpenChoiceAutocomplete",
  "language": "en-AU",
  "contained": [
    {
      "resourceType": "ValueSet",
      "id": "AboriginalTorresStraitIslander",
      "url": "https://smartforms.csiro.au/ig/ValueSet/AboriginalTorresStraitIslander",
      "name": "AboriginalTorresStraitIslander",
      "title": "Aboriginal and/or Torres Strait Islander",
      "status": "draft",
      "experimental": false,
      "description": "The Aboriginal and/or Torres Strait Islander value set includes the Australian Indigenous statuses for Indigenous people.",
      "compose": {
        "include": [
          {
            "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
            "concept": [
              {
                "code": "1",
                "display": "Aboriginal"
              },
              {
                "code": "2",
                "display": "Torres Strait Islander"
              },
              {
                "code": "3",
                "display": "Aboriginal and Torres Strait Islander"
              }
            ]
          }
        ]
      },
      "expansion": {
        "identifier": "e2b013bd-1725-4299-a7a5-53635d42f1be",
        "timestamp": "2022-10-20T11:38:45+10:00",
        "total": 3,
        "offset": 0,
        "parameter": [
          {
            "name": "version",
            "valueUri": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1|1.0.3"
          },
          {
            "name": "count",
            "valueInteger": 2147483647
          },
          {
            "name": "offset",
            "valueInteger": 0
          }
        ],
        "contains": [
          {
            "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
            "code": "1",
            "display": "Aboriginal but not Torres Strait Islander origin"
          },
          {
            "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
            "code": "2",
            "display": "Torres Strait Islander but not Aboriginal origin"
          },
          {
            "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
            "code": "3",
            "display": "Both Aboriginal and Torres Strait Islander origin"
          }
        ]
      }
    },

    {
      "resourceType": "ValueSet",
      "id": "MedicalHistory",
      "url": "https://smartforms.csiro.au/ig/ValueSet/MedicalHistory",
      "name": "MedicalHistory",
      "title": "Medical History",
      "status": "draft",
      "experimental": false,
      "description": "The Medical History value set includes values that may be used to represent medical history, operations and hospital admissions.",
      "compose": {
        "include": [
          {
            "system": "http://snomed.info/sct",
            "filter": [
              {
                "property": "constraint",
                "op": "=",
                "value": "^32570581000036105|Problem/Diagnosis reference set| OR ^32570141000036105|Procedure foundation reference set|"
              }
            ]
          }
        ]
      }
    }
 
 
 
 
  ],
  "url": "http://ns.electronichealth.net.au/fhir/Questionnaire/variation-tester",
  "version": "0.1.0",
  "name": "OpenChoiceAutocomplete",
  "title": "Open-choice Autocomplete",
  "status": "draft",
  "publisher": "AEHRC CSIRO",
  
  "subjectType": [
    "Patient"
  ],
  "description": "This Questionnaire instance includes a variety of topical tests, experiments and variations.",
  "item": [
    {
      "extension": [
        {
          "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
          "valueCodeableConcept": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/questionnaire-item-control",
                "code": "tab-container"
              }
            ]
          }
        }
      ],
      "linkId": "tab-container",
      "type": "group",
      "item": [
        {
          "linkId": "group-tab-1",
          "text": "Tab 1",
          "type": "group",
          "item": [
            {
              "linkId": "tab-1-q1",
              "text": "Pulse rate",
              "type": "integer"
            },
            {
              "linkId": "vitalscheck-actionplan",
              "text": "Vitals action plan",
              "type": "text"
            },
            {
              "linkId": "weight-control-action2",
              "type": "text",
              "text": "Weight control"
            },
            {
              "linkId": "hypertension-action2",
              "type": "text",
              "text": "Hypertension"
            },
            {
              "linkId": "1-Background-PtGivenname",
              "text": "Patient's first name",
              "type": "string"
            },

                {
      "extension": [
        {
          "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl",
          "valueCodeableConcept": {
            "coding": [
              {
                "system": "http://hl7.org/fhir/questionnaire-item-control",
                "code": "autocomplete"
              }
            ]
          }
        }
      ],
      "linkId": "medical-history-condition",
      "text": "Medical History Condition",
      "type": "open-choice",
      "answerValueSet": "#MedicalHistory"
    }

          ]
        },
        {
          "linkId": "group-tab-2",
          "text": "Tab 2",
          "type": "group",
          "item": [
            {
              "linkId": "intro-text",
              "text": "Two questions of type 'open-choice':",
              "type": "display"
            },
            {
              "linkId": "tab2-q1",
              "text": "Indigenous status (options via contained VS)",
              "type": "open-choice",
              "answerValueSet": "#AboriginalTorresStraitIslander"
            },
            {
              "linkId": "tab2-q2",
              "text": "Indigenous status (options via embedded answerOption list)",
              "type": "open-choice",
              "answerOption": [
                {
                  "valueCoding": {
                    "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
                    "code": "1",
                    "display": "Aboriginal but not Torres Strait Islander origin"
                  }
                },
                {
                  "valueCoding": {
                    "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
                    "code": "2",
                    "display": "Torres Strait Islander but not Aboriginal origin"
                  }
                },
                {
                  "valueCoding": {
                    "system": "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
                    "code": "3",
                    "display": "Both Aboriginal and Torres Strait Islander origin"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};


