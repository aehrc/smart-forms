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

import type { Questionnaire } from 'fhir/r4';

export const qGTableWithBoolean: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'GTableWithBoolean',
  name: 'GTableWithBoolean',
  title: 'GTable with Boolean',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/gtable-1',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'MedicalHistory',
      url: 'https://smartforms.csiro.au/ig/ValueSet/MedicalHistory',
      name: 'MedicalHistory',
      title: 'Medical History',
      status: 'draft',
      experimental: false,
      description:
        'The Medical History value set includes values that may be used to represent medical history, operations and hospital admissions.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^32570581000036105|Problem/Diagnosis reference set| OR ^32570141000036105|Procedure foundation reference set|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'condition-clinical',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pc'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'trial-use'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 3
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/condition-clinical',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.164'
        }
      ],
      version: '4.0.1',
      name: 'ConditionClinicalStatusCodes',
      title: 'Condition Clinical Status Codes',
      status: 'draft',
      experimental: false,
      publisher: 'FHIR Project team',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            }
          ]
        }
      ],
      description: 'Preferred value set for Condition Clinical Status.',
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:79d21cca-9f34-4cfa-9020-17eee95eeed8',
        timestamp: '2024-04-02T14:17:12+10:00',
        total: 6,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'warning-draft',
            valueUri: 'http://hl7.org/fhir/ValueSet/condition-clinical|4.0.1'
          },
          {
            name: 'warning-trial-use',
            valueUri: 'http://hl7.org/fhir/ValueSet/condition-clinical|4.0.1'
          },
          {
            name: 'warning-trial-use',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'warning-draft',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'recurrence',
            display: 'Recurrence'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'relapse',
            display: 'Relapse'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'remission',
            display: 'Remission'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved',
            display: 'Resolved'
          }
        ]
      }
    }
  ],
  item: [
    {
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
      linkId: 'medical-history',
      text: 'Medical history and current problems list',
      type: 'group',
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ],
          linkId: 'medical-history-condition',
          text: 'Condition',
          type: 'open-choice',
          answerValueSet: '#MedicalHistory'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'drop-down'
                  }
                ]
              }
            }
          ],
          linkId: 'medical-history-status',
          text: 'Clinical Status',
          type: 'choice',
          answerValueSet: '#condition-clinical'
        },
        {
          linkId: 'medical-history-onset',
          text: 'Onset Date',
          type: 'date'
        },
        {
          linkId: 'medical-history-boolean-tester',
          text: 'Boolean tester',
          type: 'boolean'
        }
      ]
    }
  ]
};

export const qGTableWithChoice: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'GTableWithChoice',
  name: 'GTableWithChoice',
  title: 'GTable with Choice',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/tester/gtable-2',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'MedicalHistory',
      url: 'https://smartforms.csiro.au/ig/ValueSet/MedicalHistory',
      name: 'MedicalHistory',
      title: 'Medical History',
      status: 'draft',
      experimental: false,
      description:
        'The Medical History value set includes values that may be used to represent medical history, operations and hospital admissions.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^32570581000036105|Problem/Diagnosis reference set| OR ^32570141000036105|Procedure foundation reference set|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'condition-clinical',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pc'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'trial-use'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 3
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/condition-clinical',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.164'
        }
      ],
      version: '4.0.1',
      name: 'ConditionClinicalStatusCodes',
      title: 'Condition Clinical Status Codes',
      status: 'draft',
      experimental: false,
      publisher: 'FHIR Project team',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            }
          ]
        }
      ],
      description: 'Preferred value set for Condition Clinical Status.',
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:79d21cca-9f34-4cfa-9020-17eee95eeed8',
        timestamp: '2024-04-02T14:17:12+10:00',
        total: 6,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'warning-draft',
            valueUri: 'http://hl7.org/fhir/ValueSet/condition-clinical|4.0.1'
          },
          {
            name: 'warning-trial-use',
            valueUri: 'http://hl7.org/fhir/ValueSet/condition-clinical|4.0.1'
          },
          {
            name: 'warning-trial-use',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          },
          {
            name: 'warning-draft',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'recurrence',
            display: 'Recurrence'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'relapse',
            display: 'Relapse'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'remission',
            display: 'Remission'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'resolved',
            display: 'Resolved'
          }
        ]
      }
    }
  ],
  item: [
    {
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
      linkId: 'medical-history',
      text: 'Medical history and current problems list',
      type: 'group',
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ],
          linkId: 'medical-history-condition',
          text: 'Condition',
          type: 'open-choice',
          answerValueSet: '#MedicalHistory'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'drop-down'
                  }
                ]
              }
            }
          ],
          linkId: 'medical-history-status',
          text: 'Clinical Status',
          type: 'choice',
          answerValueSet: '#condition-clinical'
        },
        {
          linkId: 'medical-history-onset',
          text: 'Onset Date',
          type: 'date'
        }
      ]
    }
  ]
};
