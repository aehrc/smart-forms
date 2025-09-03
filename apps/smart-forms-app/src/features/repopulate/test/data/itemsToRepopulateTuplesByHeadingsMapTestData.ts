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

import type { ItemsToRepopulateTuplesByHeadings } from '../../utils/itemsToRepopulateSelector.ts';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';

export const itemsToRepopulateTestData: Record<string, ItemToRepopulate> = {
  '63fe14f3-2374-4382-bce7-180e2747c97f': {
    qItem: {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: 'today()'
          }
        }
      ],
      linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
      text: 'Date this health check commenced',
      type: 'date',
      repeats: false
    },
    sectionItemText: 'About the health check',
    parentItemText: 'About the health check',
    isInGrid: false,
    serverQRItem: {
      linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
      text: 'Date this health check commenced',
      answer: [
        {
          valueDate: '2025-07-28'
        }
      ]
    },
    serverQRItems: [],
    currentQRItem: {
      linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
      text: 'Date this health check commenced',
      answer: [
        {
          valueDate: '2025-07-04'
        }
      ]
    }
  },
  '92bd7d05-9b5e-4cf9-900b-703f361dad9d': {
    qItem: {
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
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'ConditionRepeat',
            language: 'text/fhirpath',
            expression:
              "%Condition.entry.resource.where(verificationStatus.coding.all(code.empty() or code='confirmed'))"
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#ConditionPatchTemplate'
              }
            },
            {
              url: 'resourceId',
              valueString: "item.where(linkId='conditionId').answer.value"
            },
            {
              url: 'type',
              valueCode: 'Condition'
            }
          ]
        }
      ],
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
      text: 'Medical history summary',
      _text: {
        extension: [
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
            valueBoolean: true
          }
        ]
      },
      type: 'group',
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.id'
              }
            }
          ],
          linkId: 'conditionId',
          type: 'string'
        },
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
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ConditionRepeat.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
              }
            }
          ],
          linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
          text: 'Condition',
          type: 'open-choice',
          readOnly: true,
          answerValueSet: '#clinical-condition-1'
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
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.clinicalStatus.coding'
              }
            }
          ],
          linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
          text: 'Clinical status',
          type: 'choice',
          answerValueSet: '#condition-clinical'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.onset.ofType(dateTime).toDate()'
              }
            }
          ],
          linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
          text: 'Onset date',
          type: 'date',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.abatement.ofType(dateTime).toDate()'
              }
            }
          ],
          linkId: 'e4524654-f6de-4717-b288-34919394d46b',
          text: 'Abatement date',
          type: 'date'
        }
      ]
    },
    sectionItemText: 'Medical history and current problems',
    parentItemText: 'Medical history summary',
    isInGrid: false,
    serverQRItem: {
      linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d'
    },
    serverQRItems: [
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'fever-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '63993003',
                  display: 'Remittent fever'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'ckd-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '700379002',
                  display: 'Chronic kidney disease stage 3B (disorder)'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'coronary-syndrome-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '394659003',
                  display: 'Acute coronary syndrome'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'uti-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '68566005',
                  display: 'Urinary tract infection'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          },
          {
            linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
            text: 'Onset date',
            answer: [
              {
                valueDate: '2020-05-10'
              }
            ]
          },
          {
            linkId: 'e4524654-f6de-4717-b288-34919394d46b',
            text: 'Abatement date',
            answer: [
              {
                valueDate: '2025-06-04'
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'diabetes-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '44054006',
                  display: 'Type 2 diabetes mellitus'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          },
          {
            linkId: 'e4524654-f6de-4717-b288-34919394d46b',
            text: 'Abatement date',
            answer: [
              {
                valueDate: '2025-06-30'
              }
            ]
          }
        ]
      }
    ],
    currentQRItems: [
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'fever-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '63993003',
                  display: 'Remittent fever'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'ckd-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '700379002',
                  display: 'Chronic kidney disease stage 3B (disorder)'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'coronary-syndrome-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '394659003',
                  display: 'Acute coronary syndrome'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'uti-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '68566005',
                  display: 'Urinary tract infection'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'inactive',
                  display: 'Inactive'
                }
              }
            ]
          },
          {
            linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
            text: 'Onset date',
            answer: [
              {
                valueDate: '2020-05-10'
              }
            ]
          },
          {
            linkId: 'e4524654-f6de-4717-b288-34919394d46b',
            text: 'Abatement date',
            answer: [
              {
                valueDate: '2025-06-06'
              }
            ]
          }
        ]
      },
      {
        linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
        text: 'Medical history summary',
        item: [
          {
            linkId: 'conditionId',
            answer: [
              {
                valueString: 'diabetes-pat-sf'
              }
            ]
          },
          {
            linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
            text: 'Condition',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '44054006',
                  display: 'Type 2 diabetes mellitus'
                }
              }
            ]
          },
          {
            linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
            text: 'Clinical status',
            answer: [
              {
                valueCoding: {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                  code: 'active',
                  display: 'Active'
                }
              }
            ]
          },
          {
            linkId: 'e4524654-f6de-4717-b288-34919394d46b',
            text: 'Abatement date',
            answer: [
              {
                valueDate: '2025-06-30'
              }
            ]
          }
        ]
      }
    ]
  },
  'regularmedications-summary-current': {
    qItem: {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'MedicationStatementRepeat',
            language: 'text/fhirpath',
            expression: '%MedicationStatement.entry.resource.ofType(MedicationStatement)'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#MedicationStatementPatchTemplate'
              }
            },
            {
              url: 'resourceId',
              valueString: "item.where(linkId='medicationStatementId').answer.value"
            },
            {
              url: 'type',
              valueCode: 'MedicationStatement'
            }
          ]
        }
      ],
      linkId: 'regularmedications-summary-current',
      text: 'Current medications',
      _text: {
        extension: [
          {
            url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
            valueBoolean: true
          }
        ]
      },
      type: 'group',
      repeats: true,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
              valueBoolean: true
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationStatementRepeat.id'
              }
            }
          ],
          linkId: 'medicationStatementId',
          type: 'string'
        },
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
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "iif(%MedicationStatementRepeat.medication.reference.replace('#', '') in %medicationsFromContained.id, %medicationsFromContained.where(id = %MedicationStatementRepeat.medication.reference.replace('#', '')).code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()), iif(%MedicationStatementRepeat.medication.reference.replace('Medication/', '') in %medicationsFromRef.id , %medicationsFromRef.where(id = %MedicationStatementRepeat.medication.reference.replace('Medication/', '')).code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()) ,%MedicationStatementRepeat.medication.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())))"
              }
            }
          ],
          linkId: 'regularmedications-summary-current-medication',
          text: 'Medication',
          type: 'open-choice',
          repeats: false,
          readOnly: true,
          answerValueSet: '#smart-health-checks-medicine-products'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationStatementRepeat.status'
              }
            }
          ],
          linkId: 'regularmedications-summary-current-status',
          text: 'Status',
          type: 'choice',
          repeats: false,
          answerOption: [
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                code: 'active',
                display: 'Active'
              }
            },
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                code: 'completed',
                display: 'Completed'
              }
            },
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                code: 'stopped',
                display: 'Stopped'
              }
            },
            {
              valueCoding: {
                system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                code: 'on-hold',
                display: 'On Hold'
              }
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationStatementRepeat.dosage.text'
              }
            }
          ],
          linkId: 'regularmedications-summary-current-dosage',
          text: 'Dosage',
          type: 'text',
          repeats: false
        },
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
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%MedicationStatementRepeat.reasonCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
              }
            }
          ],
          linkId: 'regularmedications-summary-current-reasoncode',
          text: 'Clinical indication',
          type: 'open-choice',
          repeats: true,
          readOnly: true,
          answerValueSet: '#medication-reason-taken-1'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationStatementRepeat.note.text'
              }
            }
          ],
          linkId: 'regularmedications-summary-current-comment',
          text: 'Comment',
          type: 'text',
          repeats: false
        }
      ]
    },
    sectionItemText: 'Regular medications',
    parentItemText: 'Medication summary',
    isInGrid: false,
    serverQRItem: {
      linkId: 'regularmedications-summary-current'
    },
    serverQRItems: [
      {
        linkId: 'regularmedications-summary-current',
        text: 'Current medications',
        item: [
          {
            linkId: 'medicationStatementId',
            answer: [
              {
                valueString: 'chloramphenicol-pat-sf'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-medication',
            text: 'Medication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '22717011000036101',
                  display: 'Chloramphenicol 1% eye ointment'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-status',
            text: 'Status',
            answer: [
              {
                valueCoding: {
                  system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                  code: 'active',
                  display: 'Active'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-dosage',
            text: 'Dosage',
            answer: [
              {
                valueString: 'Apply 1 drop to each eye every 2 hours for 7 days'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-reasoncode',
            text: 'Clinical indication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '128350005',
                  display: 'Bacterial conjunctivitis'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: 'regularmedications-summary-current',
        text: 'Current medications',
        item: [
          {
            linkId: 'medicationStatementId',
            answer: [
              {
                valueString: 'karvezide-pat-sf'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-medication',
            text: 'Medication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '6554011000036100',
                  display: 'Karvezide 300/12.5 tablet'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-status',
            text: 'Status',
            answer: [
              {
                valueCoding: {
                  system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                  code: 'active',
                  display: 'Active'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-dosage',
            text: 'Dosage',
            answer: [
              {
                valueString: 'Take one tablet per day.'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-reasoncode',
            text: 'Clinical indication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '38341003',
                  display: 'Hypertension'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-comment',
            text: 'Comment',
            answer: [
              {
                valueString: 'Review regularly for blood pressure control and side effects.'
              }
            ]
          }
        ]
      }
    ],
    currentQRItems: [
      {
        linkId: 'regularmedications-summary-current',
        text: 'Current medications',
        item: [
          {
            linkId: 'medicationStatementId',
            answer: [
              {
                valueString: 'chloramphenicol-pat-sf'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-medication',
            text: 'Medication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '22717011000036101',
                  display: 'Chloramphenicol 1% eye ointment'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-status',
            text: 'Status',
            answer: [
              {
                valueCoding: {
                  system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                  code: 'completed',
                  display: 'Completed'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-dosage',
            text: 'Dosage',
            answer: [
              {
                valueString: 'Apply 1 drop to each eye every 2 hours for 7 days'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-reasoncode',
            text: 'Clinical indication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '128350005',
                  display: 'Bacterial conjunctivitis'
                }
              }
            ]
          }
        ]
      },
      {
        linkId: 'regularmedications-summary-current',
        text: 'Current medications',
        item: [
          {
            linkId: 'medicationStatementId',
            answer: [
              {
                valueString: 'karvezide-pat-sf'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-medication',
            text: 'Medication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '6554011000036100',
                  display: 'Karvezide 300/12.5 tablet'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-status',
            text: 'Status',
            answer: [
              {
                valueCoding: {
                  system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                  code: 'active',
                  display: 'Active'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-dosage',
            text: 'Dosage',
            answer: [
              {
                valueString: 'Take one tablet per day.'
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-reasoncode',
            text: 'Clinical indication',
            answer: [
              {
                valueCoding: {
                  system: 'http://snomed.info/sct',
                  code: '38341003',
                  display: 'Hypertension'
                }
              }
            ]
          },
          {
            linkId: 'regularmedications-summary-current-comment',
            text: 'Comment',
            answer: [
              {
                valueString: 'Review regularly for blood pressure control and side effects.'
              }
            ]
          }
        ]
      }
    ]
  }
};

export const itemsToRepopulateTuplesByHeadingsMapTestData: ItemsToRepopulateTuplesByHeadings =
  new Map(
    Object.entries({
      'About the health check': [
        [
          '63fe14f3-2374-4382-bce7-180e2747c97f',
          {
            qItem: {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: 'today()'
                  }
                }
              ],
              linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
              text: 'Date this health check commenced',
              type: 'date',
              repeats: false
            },
            sectionItemText: 'About the health check',
            parentItemText: 'About the health check',
            isInGrid: false,
            serverQRItem: {
              linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
              text: 'Date this health check commenced',
              answer: [
                {
                  valueDate: '2025-07-28'
                }
              ]
            },
            serverQRItems: [],
            currentQRItem: {
              linkId: '63fe14f3-2374-4382-bce7-180e2747c97f',
              text: 'Date this health check commenced',
              answer: [
                {
                  valueDate: '2025-07-04'
                }
              ]
            }
          }
        ]
      ],
      'Medical history and current problems': [
        [
          '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
          {
            qItem: {
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
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
                  valueExpression: {
                    name: 'ConditionRepeat',
                    language: 'text/fhirpath',
                    expression:
                      "%Condition.entry.resource.where(verificationStatus.coding.all(code.empty() or code='confirmed'))"
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
                  extension: [
                    {
                      url: 'template',
                      valueReference: {
                        reference: '#ConditionPatchTemplate'
                      }
                    },
                    {
                      url: 'resourceId',
                      valueString: "item.where(linkId='conditionId').answer.value"
                    },
                    {
                      url: 'type',
                      valueCode: 'Condition'
                    }
                  ]
                }
              ],
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
              text: 'Medical history summary',
              _text: {
                extension: [
                  {
                    url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                    valueBoolean: true
                  }
                ]
              },
              type: 'group',
              repeats: true,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                      valueBoolean: true
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.id'
                      }
                    }
                  ],
                  linkId: 'conditionId',
                  type: 'string'
                },
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
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression:
                          "%ConditionRepeat.code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                  text: 'Condition',
                  type: 'open-choice',
                  readOnly: true,
                  answerValueSet: '#clinical-condition-1'
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
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.clinicalStatus.coding'
                      }
                    }
                  ],
                  linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                  text: 'Clinical status',
                  type: 'choice',
                  answerValueSet: '#condition-clinical'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.onset.ofType(dateTime).toDate()'
                      }
                    }
                  ],
                  linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                  text: 'Onset date',
                  type: 'date',
                  readOnly: true
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%ConditionRepeat.abatement.ofType(dateTime).toDate()'
                      }
                    }
                  ],
                  linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                  text: 'Abatement date',
                  type: 'date'
                }
              ]
            },
            sectionItemText: 'Medical history and current problems',
            parentItemText: 'Medical history summary',
            isInGrid: false,
            serverQRItem: {
              linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d'
            },
            serverQRItems: [
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'fever-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '63993003',
                          display: 'Remittent fever'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'ckd-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '700379002',
                          display: 'Chronic kidney disease stage 3B (disorder)'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'coronary-syndrome-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '394659003',
                          display: 'Acute coronary syndrome'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'uti-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '68566005',
                          display: 'Urinary tract infection'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                    text: 'Onset date',
                    answer: [
                      {
                        valueDate: '2020-05-10'
                      }
                    ]
                  },
                  {
                    linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                    text: 'Abatement date',
                    answer: [
                      {
                        valueDate: '2025-06-04'
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'diabetes-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '44054006',
                          display: 'Type 2 diabetes mellitus'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                    text: 'Abatement date',
                    answer: [
                      {
                        valueDate: '2025-06-30'
                      }
                    ]
                  }
                ]
              }
            ],
            currentQRItems: [
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'fever-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '63993003',
                          display: 'Remittent fever'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'ckd-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '700379002',
                          display: 'Chronic kidney disease stage 3B (disorder)'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'coronary-syndrome-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '394659003',
                          display: 'Acute coronary syndrome'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'uti-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '68566005',
                          display: 'Urinary tract infection'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'inactive',
                          display: 'Inactive'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '6ae641ad-95bb-4cdc-8910-5a52077e492c',
                    text: 'Onset date',
                    answer: [
                      {
                        valueDate: '2020-05-10'
                      }
                    ]
                  },
                  {
                    linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                    text: 'Abatement date',
                    answer: [
                      {
                        valueDate: '2025-06-06'
                      }
                    ]
                  }
                ]
              },
              {
                linkId: '92bd7d05-9b5e-4cf9-900b-703f361dad9d',
                text: 'Medical history summary',
                item: [
                  {
                    linkId: 'conditionId',
                    answer: [
                      {
                        valueString: 'diabetes-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: '59b1900a-4f85-4a8c-b9cd-3fe2fd76f27e',
                    text: 'Condition',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '44054006',
                          display: 'Type 2 diabetes mellitus'
                        }
                      }
                    ]
                  },
                  {
                    linkId: '88bcfad7-386b-4d87-b34b-2e50482e4d2c',
                    text: 'Clinical status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                          code: 'active',
                          display: 'Active'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'e4524654-f6de-4717-b288-34919394d46b',
                    text: 'Abatement date',
                    answer: [
                      {
                        valueDate: '2025-06-30'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      ],
      'Regular medications': [
        [
          'regularmedications-summary-current',
          {
            qItem: {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
                  valueExpression: {
                    name: 'MedicationStatementRepeat',
                    language: 'text/fhirpath',
                    expression: '%MedicationStatement.entry.resource.ofType(MedicationStatement)'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
                  extension: [
                    {
                      url: 'template',
                      valueReference: {
                        reference: '#MedicationStatementPatchTemplate'
                      }
                    },
                    {
                      url: 'resourceId',
                      valueString: "item.where(linkId='medicationStatementId').answer.value"
                    },
                    {
                      url: 'type',
                      valueCode: 'MedicationStatement'
                    }
                  ]
                }
              ],
              linkId: 'regularmedications-summary-current',
              text: 'Current medications',
              _text: {
                extension: [
                  {
                    url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                    valueBoolean: true
                  }
                ]
              },
              type: 'group',
              repeats: true,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                      valueBoolean: true
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.id'
                      }
                    }
                  ],
                  linkId: 'medicationStatementId',
                  type: 'string'
                },
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
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression:
                          "iif(%MedicationStatementRepeat.medication.reference.replace('#', '') in %medicationsFromContained.id, %medicationsFromContained.where(id = %MedicationStatementRepeat.medication.reference.replace('#', '')).code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()), iif(%MedicationStatementRepeat.medication.reference.replace('Medication/', '') in %medicationsFromRef.id , %medicationsFromRef.where(id = %MedicationStatementRepeat.medication.reference.replace('Medication/', '')).code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()) ,%MedicationStatementRepeat.medication.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())))"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  type: 'open-choice',
                  repeats: false,
                  readOnly: true,
                  answerValueSet: '#smart-health-checks-medicine-products'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.status'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  type: 'choice',
                  repeats: false,
                  answerOption: [
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'active',
                        display: 'Active'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'completed',
                        display: 'Completed'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'stopped',
                        display: 'Stopped'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                        code: 'on-hold',
                        display: 'On Hold'
                      }
                    }
                  ]
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.dosage.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  type: 'text',
                  repeats: false
                },
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
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression:
                          "%MedicationStatementRepeat.reasonCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-reasoncode',
                  text: 'Clinical indication',
                  type: 'open-choice',
                  repeats: true,
                  readOnly: true,
                  answerValueSet: '#medication-reason-taken-1'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.note.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  type: 'text',
                  repeats: false
                }
              ]
            },
            sectionItemText: 'Regular medications',
            parentItemText: 'Medication summary',
            isInGrid: false,
            serverQRItem: {
              linkId: 'regularmedications-summary-current'
            },
            serverQRItems: [
              {
                linkId: 'regularmedications-summary-current',
                text: 'Current medications',
                item: [
                  {
                    linkId: 'medicationStatementId',
                    answer: [
                      {
                        valueString: 'chloramphenicol-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-medication',
                    text: 'Medication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '22717011000036101',
                          display: 'Chloramphenicol 1% eye ointment'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-status',
                    text: 'Status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                          code: 'active',
                          display: 'Active'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-dosage',
                    text: 'Dosage',
                    answer: [
                      {
                        valueString: 'Apply 1 drop to each eye every 2 hours for 7 days'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-reasoncode',
                    text: 'Clinical indication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '128350005',
                          display: 'Bacterial conjunctivitis'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: 'regularmedications-summary-current',
                text: 'Current medications',
                item: [
                  {
                    linkId: 'medicationStatementId',
                    answer: [
                      {
                        valueString: 'karvezide-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-medication',
                    text: 'Medication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '6554011000036100',
                          display: 'Karvezide 300/12.5 tablet'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-status',
                    text: 'Status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                          code: 'active',
                          display: 'Active'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-dosage',
                    text: 'Dosage',
                    answer: [
                      {
                        valueString: 'Take one tablet per day.'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-reasoncode',
                    text: 'Clinical indication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '38341003',
                          display: 'Hypertension'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-comment',
                    text: 'Comment',
                    answer: [
                      {
                        valueString: 'Review regularly for blood pressure control and side effects.'
                      }
                    ]
                  }
                ]
              }
            ],
            currentQRItems: [
              {
                linkId: 'regularmedications-summary-current',
                text: 'Current medications',
                item: [
                  {
                    linkId: 'medicationStatementId',
                    answer: [
                      {
                        valueString: 'chloramphenicol-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-medication',
                    text: 'Medication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '22717011000036101',
                          display: 'Chloramphenicol 1% eye ointment'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-status',
                    text: 'Status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                          code: 'completed',
                          display: 'Completed'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-dosage',
                    text: 'Dosage',
                    answer: [
                      {
                        valueString: 'Apply 1 drop to each eye every 2 hours for 7 days'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-reasoncode',
                    text: 'Clinical indication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '128350005',
                          display: 'Bacterial conjunctivitis'
                        }
                      }
                    ]
                  }
                ]
              },
              {
                linkId: 'regularmedications-summary-current',
                text: 'Current medications',
                item: [
                  {
                    linkId: 'medicationStatementId',
                    answer: [
                      {
                        valueString: 'karvezide-pat-sf'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-medication',
                    text: 'Medication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '6554011000036100',
                          display: 'Karvezide 300/12.5 tablet'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-status',
                    text: 'Status',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
                          code: 'active',
                          display: 'Active'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-dosage',
                    text: 'Dosage',
                    answer: [
                      {
                        valueString: 'Take one tablet per day.'
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-reasoncode',
                    text: 'Clinical indication',
                    answer: [
                      {
                        valueCoding: {
                          system: 'http://snomed.info/sct',
                          code: '38341003',
                          display: 'Hypertension'
                        }
                      }
                    ]
                  },
                  {
                    linkId: 'regularmedications-summary-current-comment',
                    text: 'Comment',
                    answer: [
                      {
                        valueString: 'Review regularly for blood pressure control and side effects.'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      ]
    })
  );
