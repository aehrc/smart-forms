import type { Questionnaire } from 'fhir/r4';

export const qItemControlGroupGTable: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlGroupGTable',
  name: 'ItemControlGroupGTable',
  title: 'Item Control Group GTable',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-group-gtable',
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
          linkId: 'medical-history-recorded',
          text: 'Recorded Date',
          type: 'date'
        }
      ]
    }
  ]
};

// FIXME at the moment, itemControl grid does not work without a parent container
export const qItemControlGroupGrid: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlGroupGrid',
  name: 'ItemControlGroupGrid',
  title: 'Item Control Group Grid',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-group-grid',
  item: [
    {
      linkId: 'parent-container',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    version: '1.0.0',
                    code: 'grid'
                  }
                ]
              }
            }
          ],
          linkId: 'blood-pressure-grid',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'blood-pressure-group',
              text: 'Blood pressure',
              type: 'group',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                      valueCoding: {
                        system: 'http://unitsofmeasure.org',
                        code: 'mm[Hg]',
                        display: 'mm Hg'
                      }
                    }
                  ],
                  linkId: 'blood-pressure-systolic',
                  text: 'Systolic',
                  type: 'integer',
                  repeats: false
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                      valueCoding: {
                        system: 'http://unitsofmeasure.org',
                        code: 'mm[Hg]',
                        display: 'mm Hg'
                      }
                    }
                  ],
                  linkId: 'blood-pressure-diastolic',
                  text: 'Diastolic',
                  type: 'integer',
                  repeats: false
                },
                {
                  linkId: 'blood-pressure-date',
                  text: 'Date performed',
                  type: 'date',
                  repeats: false
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const qItemControlDisplayTabContainer: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlGroupTabContainer',
  name: 'ItemControlGroupTabContainer',
  title: 'Item Control Group Tab Container',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-group-tab-container',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                version: '1.0.0',
                code: 'tab-container'
              }
            ]
          }
        }
      ],
      linkId: 'tab-container',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'tab-about-health-check',
          text: 'About the health check',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'health-check-eligible',
              text: 'Eligible for health check',
              type: 'boolean',
              repeats: false
            },
            {
              linkId: 'health-check-in-progress',
              text: 'Health check already in progress?',
              type: 'boolean',
              repeats: false
            },
            {
              linkId: 'health-check-last-completed',
              text: 'Date of last completed health check',
              type: 'date',
              repeats: false
            },
            {
              linkId: 'health-check-this-commenced',
              text: 'Date and time this health check commenced',
              type: 'dateTime',
              repeats: false
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Current priorities'
            }
          ],
          linkId: 'tab-current-priorities',
          text: 'Current health/patient priorities',
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
                  valueString: 'Enter details'
                }
              ],
              linkId: 'current-priorities-important-things',
              text: 'What are the important things for you in this health check today?',
              type: 'text',
              repeats: false
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
                  valueString: 'Enter details'
                }
              ],
              linkId: 'current-priorities-worried-things',
              text: 'Is there anything you are worried about?',
              type: 'text',
              repeats: false
            }
          ]
        }
      ]
    }
  ]
};

export const qItemControlDisplayLowerAndUpper: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlDisplayLowerAndUpper',
  name: 'ItemControlDisplayLowerAndUpper',
  title: 'Item Control Display Lower & Upper',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-display-lower-and-upper',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'slider'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/minValue',
          valueInteger: 0
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/maxValue',
          valueInteger: 10
        }
      ],
      linkId: 'pain-measure',
      text: 'Pain measure',
      type: 'integer',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'lower'
                  }
                ]
              }
            }
          ],
          linkId: 'pain-measure-lower',
          text: 'No pain',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'upper'
                  }
                ]
              }
            }
          ],
          linkId: 'pain-measure-upper',
          text: 'Unbearable pain',
          type: 'display'
        }
      ]
    }
  ]
};

export const qItemControlQuestionAutocomplete: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlQuestionAutocomplete',
  name: 'ItemControlQuestionAutocomplete',
  title: 'Item Control Question Autocomplete',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-question-autocomplete',
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
                code: 'autocomplete'
              }
            ]
          }
        }
      ],
      linkId: 'medical-history-condition',
      text: 'Medical History Condition',
      type: 'open-choice',
      answerValueSet: '#MedicalHistory'
    }
  ]
};

export const qItemControlQuestionDropDown: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlQuestionDropDown',
  name: 'ItemControlQuestionDropDown',
  title: 'Item Control Question DropDown',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-question-dropdown',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'australian-pronouns-1',
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/australian-pronouns-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10284'
        }
      ],
      version: '1.0.0',
      name: 'AustralianPronouns',
      title: 'Australian Pronouns',
      status: 'active',
      experimental: false,
      description:
        'The Australian Pronouns value set includes values that indicate the pronouns to be used when communicating with or about an individual.',
      copyright:
        'Copyright © 2024 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis material contains content from LOINC (http://loinc.org). LOINC is copyright 1995-2024, Regenstrief Institute, Inc. and the Logical Observation Identifiers Names and Codes (LOINC) Committee and is available at no cost under the license at http://loinc.org/license. LOINC® is a registered United States trademark of Regenstrief Institute, Inc.\n\nThis material contains information which is protected by copyright. You may download, display, print and reproduce any material for your personal, non-commercial use or use within your organisation subject to the following terms and conditions: \n\nThis resource also includes all or a portion of material from the HL7 Terminology (THO). THO is copyright ©1989+ Health Level Seven International and is made available under the CC0 designation. For more licensing information see: https://terminology.hl7.org/license.',
      compose: {
        include: [
          {
            system: 'http://loinc.org',
            concept: [
              {
                code: 'LA29518-0',
                display: 'he/him/his/his/himself'
              },
              {
                code: 'LA29519-8',
                display: 'she/her/her/hers/herself'
              },
              {
                code: 'LA29520-6',
                display: 'they/them/their/theirs/themselves'
              }
            ]
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            concept: [
              {
                code: 'unknown'
              },
              {
                code: 'asked-declined'
              },
              {
                code: 'not-asked'
              },
              {
                code: 'asked-unknown'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:ca145c1c-4915-4957-888a-39e69de8b1ad',
        timestamp: '2024-04-02T14:25:01+10:00',
        total: 7,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://loinc.org|2.77'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://loinc.org|2.77'
          },
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/data-absent-reason|5.0.0-ballot'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/data-absent-reason|5.0.0-ballot'
          }
        ],
        contains: [
          {
            system: 'http://loinc.org',
            version: '2.77',
            code: 'LA29518-0',
            display: 'he/him/his/his/himself'
          },
          {
            system: 'http://loinc.org',
            version: '2.77',
            code: 'LA29519-8',
            display: 'she/her/her/hers/herself'
          },
          {
            system: 'http://loinc.org',
            version: '2.77',
            code: 'LA29520-6',
            display: 'they/them/their/theirs/themselves'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            version: '5.0.0-ballot',
            code: 'asked-declined',
            display: 'Asked But Declined'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            version: '5.0.0-ballot',
            code: 'asked-unknown',
            display: 'Asked But Unknown'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            version: '5.0.0-ballot',
            code: 'not-asked',
            display: 'Not Asked'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            version: '5.0.0-ballot',
            code: 'unknown',
            display: 'Unknown'
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
                code: 'drop-down'
              }
            ]
          }
        }
      ],
      linkId: 'preferred-pronouns',
      text: 'Preferred pronouns',
      type: 'choice',
      answerValueSet: '#australian-pronouns-1'
    }
  ]
};

// FIXME repeat checkbox does not work :(
export const qItemControlQuestionCheckbox: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlQuestionCheckbox',
  name: 'ItemControlQuestionCheckbox',
  title: 'Item Control Question Checkbox',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-question-checkbox',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
          valueCodeableConcept: {
            coding: [
              {
                system: 'http://hl7.org/fhir/questionnaire-item-control',
                code: 'check-box'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Other, please specify'
        }
      ],
      linkId: 'dedfc83e-7451-404d-bd24-97b1254304eb',
      text: 'Left ear',
      type: 'open-choice',
      repeats: true,
      answerOption: [
        {
          valueString: 'Clear and intact'
        },
        {
          valueString: 'Dull and intact'
        },
        {
          valueString: 'Discharge'
        },
        {
          valueString: 'Retracted'
        },
        {
          valueString: 'Unable to view eardrum'
        },
        {
          valueString: 'Wax'
        },
        {
          valueString: 'Grommet in canal'
        },
        {
          valueString: 'Grommet in eardrum'
        },
        {
          valueString: 'Perforation'
        },
        {
          valueString: 'Red/bulging'
        }
      ]
    }
  ]
};
