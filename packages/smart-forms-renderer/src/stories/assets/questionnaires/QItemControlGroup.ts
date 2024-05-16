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

export const qItemControlGroupGridSingleRow: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlGroupGridSingleRow',
  name: 'ItemControlGroupGridSingleRow',
  title: 'Item Control Group Grid - Single Row',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-group-grid-1',
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

export const qItemControlGroupGridMultiRow: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemControlGroupGridMultiRow',
  name: 'ItemControlGroupGridMultiRow',
  title: 'Item Control Group Grid - Multi Row',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/item-control-group-grid-2',
  item: [
    {
      linkId: 'parent-container',
      text: '',
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
          linkId: 'grid-group',
          type: 'group',
          repeats: false,
          item: [
            {
              linkId: 'height-row',
              text: 'Height',
              type: 'group',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                      valueCoding: {
                        system: 'http://unitsofmeasure.org',
                        code: 'cm',
                        display: 'cm'
                      }
                    }
                  ],
                  linkId: 'height-value',
                  text: 'Value',
                  type: 'decimal',
                  repeats: false
                },
                {
                  linkId: 'height-date-performed',
                  text: 'Date performed',
                  type: 'date',
                  repeats: false
                }
              ]
            },
            {
              linkId: 'weight-row',
              text: 'Weight',
              type: 'group',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                      valueCoding: {
                        system: 'http://unitsofmeasure.org',
                        code: 'kg',
                        display: 'kg'
                      }
                    }
                  ],
                  linkId: 'weight-value',
                  text: 'Value',
                  type: 'decimal',
                  repeats: false
                },
                {
                  linkId: 'weight-date-performed',
                  text: 'Date performed',
                  type: 'date',
                  repeats: false
                }
              ]
            },
            {
              linkId: 'bmi-row',
              text: 'BMI',
              type: 'group',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
                      valueExpression: {
                        description: 'BMI calculation',
                        language: 'text/fhirpath',
                        expression: '(%weight/((%height/100).power(2))).round(1)'
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                      valueCoding: {
                        system: 'http://unitsofmeasure.org',
                        code: 'kg/m2',
                        display: 'kg/m2'
                      }
                    }
                  ],
                  linkId: 'bmi-value',
                  text: 'Value',
                  type: 'decimal',
                  repeats: false,
                  readOnly: false
                }
              ]
            },
            {
              linkId: 'heart-rate-row',
              text: 'Heart rate',
              type: 'group',
              repeats: false,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
                      valueCoding: {
                        system: 'http://unitsofmeasure.org',
                        code: '/min',
                        display: '/min'
                      }
                    }
                  ],
                  linkId: 'heart-rate-value',
                  text: 'Value',
                  type: 'integer',
                  repeats: false
                },
                {
                  linkId: 'heart-rate-date-performed',
                  text: 'Date performed',
                  type: 'date',
                  repeats: false
                }
              ]
            },
            {
              linkId: 'heart-rhythm-row',
              text: 'Heart rhythm',
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
                            code: 'radio-button'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: 'heart-rhythm-value',
                  text: 'Value',
                  type: 'choice',
                  repeats: false,
                  answerOption: [
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '271636001',
                        display: 'Pulse regular'
                      }
                    },
                    {
                      valueCoding: {
                        system: 'http://snomed.info/sct',
                        code: '61086009',
                        display: 'Pulse irregular'
                      }
                    }
                  ]
                },
                {
                  linkId: 'heart-rhythm-date-performed',
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
