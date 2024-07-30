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

// FIX choice autocomplete

export const QAuCoreAllergyIntolerance: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCoreAllergyIntolerance',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'AllergyIntolerance',
        language: 'application/x-fhir-query',
        expression: 'AllergyIntolerance?patient={{%patient.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core AllergyIntolerance',
  title: 'AU Core AllergyIntolerance',
  status: 'draft',
  date: '2024-07-15',
  item: [
    {
      linkId: 'allergy-intolerance',
      text: 'AU Core AllergyIntolerance',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-resource-note',
          text: 'This questionnaire only uses the first AllergyTolerance resource of a reference patient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom: 8px;">\r\n  <b>This questionnaire only uses the first AllergyIntolerance resource of a reference patient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%AllergyIntolerance.entry[0].resource.clinicalStatus.coding'
              }
            }
          ],
          linkId: 'clinical-status',
          text: 'Clinical Status',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/allergyintolerance-clinical'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%AllergyIntolerance.entry[0].resource.verificationStatus.coding'
              }
            }
          ],
          linkId: 'verification-status',
          text: 'Verification Status',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/allergyintolerance-verification'
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
                expression: '%AllergyIntolerance.entry[0].resource.code.coding'
              }
            }
          ],
          linkId: 'code',
          text: 'Code',
          type: 'open-choice',
          required: true,
          answerValueSet:
            'https://healthterminologies.gov.au/fhir/ValueSet/indicator-hypersensitivity-intolerance-to-substance-2'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%AllergyIntolerance.entry[0].resource.onset'
              }
            }
          ],
          linkId: 'onset',
          text: 'Onset[x]',
          type: 'string'
        },
        {
          linkId: 'reaction',
          text: 'Reaction',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      '%AllergyIntolerance.entry[0].resource.reaction.manifestation[0].coding'
                  }
                }
              ],
              linkId: 'reaction-manifestation',
              text: 'Reaction Manifestation',
              type: 'choice',
              answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/clinical-finding-1'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%AllergyIntolerance.entry[0].resource.reaction.severity'
                  }
                }
              ],
              linkId: 'reaction-severity',
              text: 'Reaction Severity',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/reaction-event-severity'
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreCondition: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCoreCondition',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core Condition',
  title: 'AU Core Condition',
  status: 'draft',
  date: '2024-07-15',
  item: [
    {
      linkId: 'condition',
      text: 'AU Core Condition',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-condition-note',
          text: 'This questionnaire only uses the first Condition resource of a referenced patient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n  <b>This questionnaire only uses the first Condition resource of a referenced patient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'clinical-status',
          text: 'Clinical Status',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-clinical',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.clinicalStatus.coding'
              }
            }
          ]
        },
        {
          linkId: 'verification-status',
          text: 'Verification Status',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-ver-status',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.verificationStatus.coding'
              }
            }
          ]
        },
        {
          linkId: 'category',
          text: 'Category',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'severity',
          text: 'Severity',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-severity',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.severity.coding'
              }
            }
          ]
        },
        {
          linkId: 'code',
          text: 'Code',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-code',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.code.coding'
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
                expression: '%Condition.entry[0].resource.onset.value'
              }
            }
          ],
          linkId: 'onset',
          text: 'Onset[x]',
          type: 'string'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.abatement.value'
              }
            }
          ],
          linkId: 'abatement',
          text: 'Abatement[x]',
          type: 'string'
        },
        {
          linkId: 'note',
          text: 'Note',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Condition.entry[0].resource.note.text'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreEncounter: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCoreEncounter',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Encounter',
        language: 'application/x-fhir-query',
        expression: 'Encounter?patient={{%patient.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core Encounter',
  title: 'AU Core Encounter',
  status: 'draft',
  date: '2024-07-15',
  item: [
    {
      linkId: 'encounter',
      text: 'AU Core Encounter',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-encounter-note',
          text: 'This questionnaire only uses the first Encounter resource of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This questionnaire only uses the first Encounter resource\nof a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'status',
          text: 'Status',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/encounter-status',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Encounter.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'class',
          text: 'Class',
          type: 'choice',
          required: true,
          answerValueSet: 'http://terminology.hl7.org.au/ValueSet/v3-ActEncounterCode-extended',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Encounter.entry[0].resource.class'
              }
            }
          ]
        },
        {
          linkId: 'service-type',
          text: 'Service Type',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/service-type',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Encounter.entry[0].resource.serviceType.coding'
              }
            }
          ]
        },
        {
          linkId: 'participant',
          text: 'Participant',
          type: 'group',
          item: [
            {
              linkId: 'participant-type',
              text: 'Participant Type',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/encounter-participant-type',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%Encounter.entry[0].resource.participant.type.coding'
                  }
                }
              ]
            },
            {
              linkId: 'participant-individual',
              text: 'Participant Individual',
              type: 'reference',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/participant-individual',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%Encounter.entry[0].resource.participant.individual.reference'
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'period',
          text: 'Period',
          type: 'group',
          item: [
            {
              linkId: 'period-start',
              text: 'Period Start',
              type: 'dateTime',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%Encounter.entry[0].resource.period.start'
                  }
                }
              ]
            },
            {
              linkId: 'period-end',
              text: 'Period End',
              type: 'dateTime',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%Encounter.entry[0].resource.period.end'
                  }
                }
              ]
            }
          ]
        },

        {
          linkId: 'reason-code',
          text: 'Reason Code',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/encounter-reason',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Encounter.entry[0].resource.reasonCode.coding'
              }
            },
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
          ]
        },
        {
          linkId: 'reason-reference',
          text: 'Reason Reference',
          type: 'reference',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/reason-reference',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Encounter.entry[0].resource.reasonReference.reference'
              }
            }
          ]
        },
        {
          linkId: 'location',
          text: 'Location',
          type: 'group',
          item: [
            {
              linkId: 'location-location',
              text: 'Location',
              type: 'reference',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/location',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%Encounter.entry[0].resource.location.location.reference'
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'service-provider',
          text: 'Service Provider',
          type: 'reference',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/service-provider',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Encounter.entry[0].resource.serviceProvider.reference'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreImmunization: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCoreImmunization',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Immunization',
        language: 'application/x-fhir-query',
        expression: 'Immunization?patient={{%patient.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core Immunization',
  title: 'AU Core Immunization',
  status: 'draft',
  date: '2024-07-24',
  item: [
    {
      linkId: 'immunization',
      text: 'AU Core Immunization',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-immunization-note',
          text: 'This questionnaire only uses the first Immunization resource of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This questionnaire only uses the first Immunization resource\nof a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'status',
          text: 'Status',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/immunization-status',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Immunization.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'vaccineCode',
          text: 'Vaccine Code',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/vaccine-code',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Immunization.entry[0].resource.vaccineCode.coding'
              }
            }
          ]
        },
        {
          linkId: 'occurrenceDateTime',
          text: 'Occurrence DateTime',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Immunization.entry[0].resource.occurrenceDateTime'
              }
            }
          ]
        },
        {
          linkId: 'primarySource',
          text: 'Primary Source',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Immunization.entry[0].resource.primarySource'
              }
            }
          ]
        },
        {
          linkId: 'note',
          text: 'Note',
          type: 'text',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Immunization.entry[0].resource.note.text'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreMedicationRequest: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCoreMedicationRequest',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'MedicationRequest',
        language: 'application/x-fhir-query',
        expression: 'MedicationRequest?patient={{%patient.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core Medication Request',
  title: 'AU Core Medication Request',
  status: 'draft',
  date: '2024-07-24',
  item: [
    {
      linkId: 'medication-request',
      text: 'AU Core Medication Request',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-medication-request-note',
          text: 'This questionnaire only uses the first MedicationRequest resource of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This questionnaire only uses the first MedicationRequest resource\nof a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'status',
          text: 'Status',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/medicationrequest-status',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'intent',
          text: 'Intent',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/medicationrequest-intent',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.intent'
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
                expression: '%MedicationRequest.entry[0].resource.medicationCodeableConcept.coding'
              }
            }
          ],
          linkId: 'medication-codeableconcept',
          text: 'Medication CodeableConcept',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/medication-codes'
        },
        {
          linkId: 'encounter',
          text: 'Encounter',
          type: 'reference',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/encounter-reference',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.encounter.reference'
              }
            }
          ]
        },
        {
          linkId: 'authored-on',
          text: 'Authored On',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.authoredOn'
              }
            }
          ]
        },
        {
          linkId: 'requester',
          text: 'Requester',
          type: 'reference',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.requester.reference'
              }
            }
          ]
        },
        {
          linkId: 'reason-code',
          text: 'Reason Code',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/reason-for-request-1',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.reasonCode.coding'
              }
            },
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
          ]
        },
        {
          linkId: 'dosage-instruction',
          text: 'Dosage Instruction',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%MedicationRequest.entry[0].resource.dosageInstruction.text'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCorePatient: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCorePatient',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    }
  ],
  version: '0.1.0',
  name: 'AU Core Patient',
  title: 'AU Core Patient',
  status: 'draft',
  date: '2024-07-24',
  item: [
    {
      linkId: 'patient',
      text: 'AU Core Patient',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.id'
              }
            }
          ],
          linkId: 'patient-id',
          text: 'Patient ID',
          type: 'string'
        },
        {
          linkId: 'extensions',
          text: 'Extensions',
          type: 'group',
          item: [
            {
              linkId: 'extension-indigenous-status',
              text: 'Indigenous Status',
              type: 'choice',
              answerValueSet:
                'https://healthterminologies.gov.au/fhir/ValueSet/australian-indigenous-status-1',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.extension.where(url='http://hl7.org.au/fhir/StructureDefinition/indigenous-status').value"
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
                    expression:
                      "%patient.extension.where(exists(url='http://hl7.org/fhir/StructureDefinition/individual-genderIdentity') and extension.where(url='period').value.end.empty()).extension.where(url='value').value.coding"
                  }
                },
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
              linkId: 'f669a4fe-4818-429a-8847-d20da88d2bb3',
              text: 'Gender identity',
              type: 'choice',
              repeats: false,
              answerValueSet:
                'https://healthterminologies.gov.au/fhir/ValueSet/gender-identity-response-1'
            },
            {
              linkId: 'extension-individual-pronouns',
              text: 'Individual Pronouns',
              type: 'choice',
              answerValueSet:
                'https://healthterminologies.gov.au/fhir/ValueSet/australian-pronouns-1',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.extension.where(exists(url='http://hl7.org/fhir/StructureDefinition/individual-pronouns') and extension.where(url='period').value.end.empty()).extension.where(url='value').value.coding"
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'identifiers',
          text: 'Identifiers',
          type: 'group',
          item: [
            {
              linkId: 'identifier-ihi',
              text: 'IHI',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='NI')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-medicare-number',
              text: 'Medicare Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='MC')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-dva-number',
              text: 'DVA Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='DVAU')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-healthcare-card-number',
              text: 'Healthcare Card Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='HC')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-pensioner-consession-card-number',
              text: 'Pensioner Concession Card Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='PEN')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-senior-health-card-number',
              text: 'Seniors Health Card Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='SEN')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-medical-record-number',
              text: 'Medical Record Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='MR')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-au-insurance-member-number',
              text: ' AU Insurance Member Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%patient.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='MB')).value"
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'name',
          text: 'Name',
          type: 'group',
          item: [
            {
              linkId: 'name-use',
              text: 'Name Use',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/name-use',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.name.use'
                  }
                }
              ]
            },
            {
              linkId: 'name-text',
              text: 'Name Text',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.name.text'
                  }
                }
              ]
            },
            {
              linkId: 'name-family',
              text: 'Family Name',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.name.family'
                  }
                }
              ]
            },
            {
              linkId: 'name-given',
              text: 'Given Name',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.name.given'
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'telecom',
          text: 'Telecom',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: "%patient.telecom.where(system = 'phone' and use = 'home').value"
                  }
                }
              ],
              linkId: '9541f0b0-f5ba-4fe7-a8e9-ad003cef897b',
              text: 'Home phone',
              type: 'string'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: "%patient.telecom.where(system = 'phone' and use = 'mobile').value"
                  }
                }
              ],
              linkId: '4037a02b-4a85-40e0-9be6-5b17df1aac56',
              text: 'Mobile phone',
              type: 'string'
            }
          ]
        },
        {
          linkId: 'gender',
          text: 'Gender',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.gender'
              }
            }
          ]
        },
        {
          linkId: 'birth-date',
          text: 'Birth Date',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.birthDate'
              }
            }
          ]
        },
        {
          linkId: 'address',
          text: 'Address',
          type: 'group',
          item: [
            {
              linkId: 'address-use',
              text: 'Address Use',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/address-use',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.address.use'
                  }
                }
              ]
            },
            {
              linkId: 'address-text',
              text: 'Address Text',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.address.text'
                  }
                }
              ]
            },
            {
              linkId: 'address-line',
              text: 'Address Line',
              type: 'string',
              repeats: true,
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.address.line'
                  }
                }
              ]
            },
            {
              linkId: 'address-city',
              text: 'City',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.address.city'
                  }
                }
              ]
            },
            {
              linkId: 'address-state',
              text: 'State',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.address.state'
                  }
                }
              ]
            },
            {
              linkId: 'address-postal-code',
              text: 'Postal Code',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.address.postalCode'
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'communication',
          text: 'Communication',
          type: 'group',
          item: [
            {
              linkId: 'communication-language',
              text: 'Communication Language',
              type: 'choice',
              answerValueSet:
                'https://healthterminologies.gov.au/fhir/ValueSet/common-languages-australia-2',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.communication.language.coding'
                  }
                }
              ]
            },
            {
              linkId: 'communication-preferred',
              text: 'Communication Preferred',
              type: 'boolean',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.communication.preferred'
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

export const QAuCorePractitioner: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCorePractitioner',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'user'
          }
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner that is to be used to pre-populate the form'
        }
      ]
    }
  ],
  version: '0.1.0',
  name: 'AU Core Practitioner',
  title: 'AU Core Practitioner',
  status: 'draft',
  date: '2024-07-24',
  item: [
    {
      linkId: 'practitioner',
      text: 'AU Core Practitioner',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'identifiers',
          text: 'Identifiers',
          type: 'group',
          item: [
            {
              linkId: 'identifier-au-hpi-i',
              text: 'Healthcare Provider Identifier – Individual',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%user.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='NPI')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-pbs-presciber-number',
              text: 'PBS Prescriber Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%user.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='PRES')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-cae-identifier',
              text: 'Care Agency Employee (CAE) Identifier',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%user.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='CAEI')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-ahpra-number',
              text: 'Australian Health Practitioner Regulation Agency (Ahpra) Registration Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%user.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='AHPRA')).value"
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'name',
          text: 'Name',
          type: 'group',
          item: [
            {
              linkId: 'name-family',
              text: 'Family Name',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%user.name.family'
                  }
                }
              ]
            },
            {
              linkId: 'name-given',
              text: 'Given Name',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%user.name.given'
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

export const QAuCorePractitionerRole: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCorePractitionerRole',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'user'
          }
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'PractitionerRole',
        language: 'application/x-fhir-query',
        expression: 'PractitionerRole?practitioner={{%user.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core PractitionerRole',
  title: 'AU Core PractitionerRole',
  status: 'draft',
  date: '2024-07-24',
  item: [
    {
      linkId: 'practitionerRole',
      text: 'AU Core PractitionerRole',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'practitioner-details',
          text: 'Practitioner Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%user.id'
                  }
                }
              ],
              linkId: 'practitioner-id',
              text: 'Practitioner ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%user.name.select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'practitioner-name',
              text: 'Practitioner Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'identifiers',
          text: 'Identifiers',
          type: 'group',
          item: [
            {
              linkId: 'identifier-medicare-provider-number',
              text: 'Medicare Provider Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%PractitionerRole.entry[0].resource.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='UPIN')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-national-provider-identifier',
              text: 'National Provider Identifier at Organisation (NPIO)',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%PractitionerRole.entry[0].resource.identifier.where(type.coding.exists(system='http://terminology.hl7.org.au/CodeSystem/v2-0203' and code='NPIO')).value"
                  }
                }
              ]
            },
            {
              linkId: 'identifier-employee-number',
              text: 'Employee Number',
              type: 'string',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%PractitionerRole.entry[0].resource.identifier.where(type.coding.exists(system='http://terminology.hl7.org/CodeSystem/v2-0203' and code='EI')).value"
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'organization',
          text: 'Organization',
          type: 'reference',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PractitionerRole.entry[0].resource.organization.reference'
              }
            }
          ]
        },
        {
          linkId: 'code',
          text: 'Code',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/practitioner-role-1',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PractitionerRole.entry[0].resource.code.coding'
              }
            }
          ]
        },
        {
          linkId: 'specialty',
          text: 'Specialty',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/clinical-specialty-1',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PractitionerRole.entry[0].resource.specialty.coding'
              }
            }
          ]
        },
        {
          linkId: 'telecom',
          text: 'Telecom',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%PractitionerRole.entry[0].resource.telecom.where(system = 'phone' and use = 'work').value"
                  }
                }
              ],
              linkId: '9541f0b0-f5ba-4fe7-a8e9-ad003cef897b',
              text: 'Home phone',
              type: 'string'
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%PractitionerRole.entry[0].resource.telecom.where(system = 'email' and use = 'work').value"
                  }
                }
              ],
              linkId: '4037a02b-4a85-40e0-9be6-5b17df1aac56',
              text: 'Mobile phone',
              type: 'string'
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreProcedure: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AuCoreProcedure',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The procedure that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Procedure',
        language: 'application/x-fhir-query',
        expression: 'Procedure?patient={{%patient.id}}'
      }
    }
  ],
  version: '0.1.0',
  name: 'AU Core Procedure',
  title: 'AU Core Procedure',
  status: 'draft',
  date: '2024-07-24',
  item: [
    {
      linkId: 'procedure',
      text: 'AU Core Procedure',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-procedure-note',
          text: 'This questionnaire only uses the first Procedure resource of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This questionnaire only uses the first Procedure resource\nof a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'status',
          text: 'Status',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/event-status',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Procedure.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'code',
          text: 'Code',
          type: 'choice',
          required: true,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/procedure-code',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Procedure.entry[0].resource.code.coding'
              }
            },
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
          ]
        },

        {
          linkId: 'encounter',
          text: 'Encounter',
          type: 'reference',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Procedure.entry[0].resource.encounter.reference'
              }
            }
          ]
        },
        {
          linkId: 'performed',
          text: 'Performed[x]',
          type: 'string',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Procedure.entry[0].resource.performed'
              }
            }
          ]
        },
        {
          linkId: 'reasonCode',
          text: 'Reason Code',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/procedure-reason',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%Procedure.entry[0].resource.reasonCode.coding'
              }
            },
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
          ]
        }
      ]
    }
  ]
};

export const QAuCoreObservationBP: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BloodPressureObservation',
  version: '0.1.0',
  name: 'BloodPressureObservation',
  title: 'Blood Pressure Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationBP',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=75367002&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Blood Pressure',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 85354-9 (Blood pressure) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This questionnaire only uses the first Observation resource with  LOINC code 85354-9 (Blood pressure) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationBP.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationBP.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-category-vscat-boolean',
          text: 'Observation Category is VSCat?',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: "%ObservationBP.entry[0].resource.category.coding.code = 'vital-signs'"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationBP.entry[0].resource.code.coding.where(system='http://loinc.org' and code='85354-9')"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-snomed',
          text: 'Observation Code (SNOMED)',
          type: 'choice',
          answerValueSet: 'http://snomed.info/sct/32506021000036107',
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
                  "%ObservationBP.entry[0].resource.code.coding.where(system='http://snomed.info/sct' and code='75367002')"
              }
            }
          ]
        },
        {
          linkId: 'Observation.effectivedateTime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationBP.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'component-systolic-bp',
          text: 'SystolicBP Component',
          type: 'group',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
              valueExpression: {
                name: 'ComponentSystolic',
                language: 'text/fhirpath',
                expression: '%ObservationBP.entry[0].resource.component[0]'
              }
            }
          ],
          item: [
            {
              linkId: 'component-systolic-bp-code-loinc',
              text: 'Code (LOINC)',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%ComponentSystolic.code.coding.where(system='http://loinc.org' and code='8480-6')"
                  }
                }
              ]
            },
            {
              linkId: 'component-systolic-bp-code-snomed',
              text: 'Code (SNOMED)',
              type: 'choice',
              answerValueSet: 'http://snomed.info/sct/32506021000036107',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%ComponentSystolic.code.coding.where(system='http://snomed.info/sct' and code='271649006')"
                  }
                },
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
              ]
            },
            {
              linkId: 'component-systolic-bp-value',
              text: 'Value',
              type: 'decimal',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ComponentSystolic.value.value'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                  valueCoding: {
                    system: 'http://unitsofmeasure.org',
                    code: 'mm[Hg]',
                    display: 'mmHg'
                  }
                }
              ]
            }
          ]
        },
        {
          linkId: 'component-diastolic-bp',
          text: 'DiastolicBP Component',
          type: 'group',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
              valueExpression: {
                name: 'ComponentDiastolic',
                language: 'text/fhirpath',
                expression: '%ObservationBP.entry[0].resource.component[1]'
              }
            }
          ],
          item: [
            {
              linkId: 'component-diastolic-bp-code-loinc',
              text: 'Code (LOINC)',
              type: 'choice',
              answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%ComponentDiastolic.code.coding.where(system='http://loinc.org' and code='8462-4')"
                  }
                }
              ]
            },
            {
              linkId: 'component-diastolic-bp-code-snomed',
              text: 'Code (SNOMED)',
              type: 'choice',
              answerValueSet: 'http://snomed.info/sct/32506021000036107',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "%ComponentDiastolic.code.coding.where(system='http://snomed.info/sct' and code='271650006')"
                  }
                },
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
              ]
            },
            {
              linkId: 'component-diastolic-bp-value',
              text: 'Value',
              type: 'decimal',
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%ComponentDiastolic.value.value'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                  valueCoding: {
                    system: 'http://unitsofmeasure.org',
                    code: 'mm[Hg]',
                    display: 'mmHg'
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

export const QAuCoreObservationBodyHeight: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BodyHeightObservation',
  version: '0.1.0',
  name: 'BodyHeightObservation',
  title: 'Body Height Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Body Height',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given\n| prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 8302-2 (Body height) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n\n <b>This questionnaire only uses the first Observation resource with LOINC code 8302-2 (Body height) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeight.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeight.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-category-vscat-boolean',
          text: 'Observation Category is VSCat?',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationHeight.entry[0].resource.category.coding.code = 'vital-signs'"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationHeight.entry[0].resource.code.coding.where(system='http://loinc.org' and code='8302-2')"
              }
            }
          ]
        },
        {
          linkId: 'Observation.effectivedateTime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeight.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'observation-value',
          text: 'Observation Value',
          type: 'decimal',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeight.entry[0].resource.valueQuantity.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'cm',
                display: 'cm'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreObservationBodyWeight: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'BodyWeightObservation',
  version: '0.1.0',
  name: 'BodyWeightObservation',
  title: 'Body Weight Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Body Weight',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 29463-7 (Body weight) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n <b>This questionnaire only uses the first Observation resource with  LOINC code 29463-7 (Body weight) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWeight.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWeight.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-category-vscat-boolean',
          text: 'Observation Category is VSCat?',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationWeight.entry[0].resource.category.coding.code = 'vital-signs'"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationWeight.entry[0].resource.code.coding.where(system='http://loinc.org' and code='29463-7')"
              }
            }
          ]
        },
        {
          linkId: 'Observation.effectivedateTime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWeight.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'observation-value',
          text: 'Observation Value',
          type: 'decimal',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWeight.entry[0].resource.valueQuantity.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'kg',
                display: 'kg'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreObservationHeartRate: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'HeartRateObservation',
  version: '0.1.0',
  name: 'HeartRateObservation',
  title: 'Heart Rate Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationHeartRate',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8867-4&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Heart Rate',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 8867-4 (Heart rate) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n <b>This questionnaire only uses the first Observation resource with  LOINC code 8867-4 (Heart rate) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeartRate.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeartRate.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-category-vscat-boolean',
          text: 'Observation Category is VSCat?',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationHeartRate.entry[0].resource.category.coding.code = 'vital-signs'"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationHeartRate.entry[0].resource.code.coding.where(system='http://loinc.org' and code='8867-4')"
              }
            }
          ]
        },
        {
          linkId: 'Observation.effectiveDateTime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeartRate.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'observation-value',
          text: 'Observation Value',
          type: 'decimal',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationHeartRate.entry[0].resource.valueQuantity.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'beats/min',
                display: 'beats/min'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreObservationRespirationRate: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RespirationRateObservation',
  version: '0.1.0',
  name: 'RespirationRateObservation',
  title: 'Respiration Rate Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationRespirationRate',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=9279-1&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Respiration Rate',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 9279-1 (Respiration rate) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n <b>This questionnaire only uses the first Observation resource with LOINC code 9279-1 (Respiration rate) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationRespirationRate.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationRespirationRate.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-category-vscat-boolean',
          text: 'Observation Category is VSCat?',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationRespirationRate.entry[0].resource.category.coding.code = 'vital-signs'"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationRespirationRate.entry[0].resource.code.coding.where(system='http://loinc.org' and code='9279-1')"
              }
            }
          ]
        },
        {
          linkId: 'Observation.effectiveDateTime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationRespirationRate.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'observation-value',
          text: 'Observation Value',
          type: 'decimal',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationRespirationRate.entry[0].resource.valueQuantity.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'breaths/min',
                display: 'breaths/min'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreObservationSmokingStatus: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'SmokingStatusObservation',
  version: '0.1.0',
  name: 'SmokingStatusObservation',
  title: 'Smoking Status Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationSmokingStatus',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=72166-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Smoking Status',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 72166-2 (Smoking status) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n <b>This questionnaire only uses the first Observation resource with LOINC code 72166-2 (Smoking status) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationSmokingStatus.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationSmokingStatus.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationSmokingStatus.entry[0].resource.code.coding.where(system='http://loinc.org' and code='72166-2')"
              }
            }
          ]
        },
        {
          linkId: 'observation-effective-datetime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationSmokingStatus.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'observation-value',
          text: 'Observation Value',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/smoking-status-1',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%ObservationSmokingStatus.entry[0].resource.valueCodeableConcept.coding'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const QAuCoreObservationWaistCircumference: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'WaistCircumferenceObservation',
  version: '0.1.0',
  name: 'WaistCircumferenceObservation',
  title: 'Waist Circumference Observation',
  status: 'draft',
  date: '2024-07-15',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObservationWaistCircumference',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8280-0&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  ],
  item: [
    {
      linkId: 'observation',
      text: 'AU Core Observation - Waist Circumference',
      type: 'group',
      item: [
        {
          linkId: 'patient-details',
          text: 'Patient Details',
          type: 'group',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%patient.id'
                  }
                }
              ],
              linkId: 'patient-id',
              text: 'Patient ID',
              type: 'string',
              required: true,
              readOnly: true
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression:
                      "(%patient.name.where(use='official').select((family | (given | prefix).join(' ')).join(', ').where($this != '') | text)).first()"
                  }
                }
              ],
              linkId: 'patient-name',
              text: 'Patient Name',
              type: 'string',
              required: true,
              readOnly: true
            }
          ]
        },
        {
          linkId: 'first-observation-note',
          text: 'This questionnaire only uses the first Observation resource with LOINC code 8280-0 (Waist circumference) of a referenced\npatient.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml" style="padding-bottom:\n8px;">\r\n <b>This questionnaire only uses the first Observation resource with LOINC code 8280-0 (Waist circumference) of a referenced\npatient.</b>\r\n</div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'observation-status',
          text: 'Observation Status',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-status',
          type: 'choice',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWaistCircumference.entry[0].resource.status'
              }
            }
          ]
        },
        {
          linkId: 'observation-category',
          text: 'Observation Category',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-category',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWaistCircumference.entry[0].resource.category.coding'
              }
            }
          ]
        },
        {
          linkId: 'observation-category-vscat-boolean',
          text: 'Observation Category is VSCat?',
          type: 'boolean',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationWaistCircumference.entry[0].resource.category.coding.code = 'vital-signs'"
              }
            }
          ]
        },
        {
          linkId: 'observation-code-loinc',
          text: 'Observation Code (LOINC)',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/observation-vitalsignresult',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObservationWaistCircumference.entry[0].resource.code.coding.where(system='http://loinc.org' and code='8280-0')"
              }
            }
          ]
        },
        {
          linkId: 'Observation.effectiveDateTime',
          text: 'Effective Date Time',
          type: 'dateTime',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWaistCircumference.entry[0].resource.effectiveDateTime'
              }
            }
          ]
        },
        {
          linkId: 'observation-value',
          text: 'Observation Value',
          type: 'decimal',
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObservationWaistCircumference.entry[0].resource.valueQuantity.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'cm',
                display: 'cm'
              }
            }
          ]
        }
      ]
    }
  ]
};
