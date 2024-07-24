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

import { Questionnaire } from 'fhir/r4';

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
