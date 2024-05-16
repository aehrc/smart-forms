import type { Questionnaire } from 'fhir/r4';

export const qRequired: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'Required',
  name: 'Required',
  title: 'Required',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/other/required',
  item: [
    {
      linkId: 'required-question',
      text: 'Consent for sharing of health information',
      type: 'boolean',
      repeats: false,
      required: true
    }
  ]
};

export const qRepeatsAutocomplete: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RepeatsAutocomplete',
  name: 'RepeatsAutocomplete',
  title: 'Repeats Autocomplete',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/other/repeats-autocomplete',
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
                    code: 'autocomplete'
                  }
                ]
              }
            }
          ],
          linkId: 'medical-history-repeat',
          text: 'Medical history and current problems',
          type: 'open-choice',
          repeats: true,
          answerValueSet: 'https://smartforms.csiro.au/ig/ValueSet/MedicalHistory'
        }
      ]
    }
  ]
};

export const qRepeatsCheckbox: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RepeatsCheckbox',
  name: 'RepeatsCheckbox',
  title: 'Repeats Checkbox',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/other/repeats-checkbox',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'PrimaryCarerParentGrandparent',
      url: 'https://smartforms.csiro.au/ig/ValueSet/PrimaryCarerParentGrandparent',
      name: 'PrimaryCarerParentGrandparent',
      title: 'Primary Carer Of Parent Or Grandparent',
      status: 'draft',
      experimental: false,
      description:
        'The Primary Carer Of Parent Or Grandparent value set includes values that can indicate whether a primary carer is one of the parents or a grandparent.',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            concept: [
              {
                code: 'MTH'
              },
              {
                code: 'FTH'
              },
              {
                code: 'GRPRN'
              }
            ]
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-NullFlavor',
            concept: [
              {
                code: 'NA'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: '2809c2fa-28ec-4def-9b16-93a611d29da3',
        timestamp: '2022-10-20T11:42:30+10:00',
        total: 4,
        offset: 0,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode|2018-08-12'
          },
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v3-NullFlavor|2018-08-12'
          },
          {
            name: 'count',
            valueInteger: 2147483647
          },
          {
            name: 'offset',
            valueInteger: 0
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            version: '2018-08-12',
            code: 'MTH',
            display: 'Mother'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            version: '2018-08-12',
            code: 'FTH',
            display: 'Father'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            version: '2018-08-12',
            code: 'GRPRN',
            display: 'Grandparent'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-NullFlavor',
            version: '2018-08-12',
            code: 'NA',
            display: 'N/A'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'administrative-gender',
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/shareablevalueset']
      },
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-wg',
          valueCode: 'pa'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status',
          valueCode: 'normative'
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm',
          valueInteger: 5
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/structuredefinition-normative-version',
          valueCode: '4.0.0'
        }
      ],
      url: 'http://hl7.org/fhir/ValueSet/administrative-gender',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:2.16.840.1.113883.4.642.3.1'
        }
      ],
      version: '4.0.1',
      name: 'AdministrativeGender',
      title: 'AdministrativeGender',
      status: 'active',
      experimental: false,
      date: '2019-11-01T09:29:23+11:00',
      publisher: 'HL7 (FHIR Project)',
      contact: [
        {
          telecom: [
            {
              system: 'url',
              value: 'http://hl7.org/fhir'
            },
            {
              system: 'email',
              value: 'fhir@lists.hl7.org'
            }
          ]
        }
      ]
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
                code: 'check-box'
              }
            ]
          }
        }
      ],
      linkId: 'primary-carers-repeat',
      text: 'Primary carers (multi-select)',
      type: 'choice',
      repeats: true,
      answerValueSet: '#PrimaryCarerParentGrandparent'
    }
  ]
};

export const qRepeatsGroup: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RepeatsGroup',
  name: 'RepeatsGroup',
  title: 'Repeats Group',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/other/repeats-group',
  item: [
    {
      linkId: 'home-address-group',
      text: 'Home address',
      type: 'group',
      repeats: true,
      item: [
        {
          linkId: 'home-address-street',
          definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.line',
          text: 'Street address',
          type: 'string',
          repeats: false
        },
        {
          linkId: 'home-address-city',
          definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.city',
          text: 'City',
          type: 'string',
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
                    code: 'drop-down'
                  }
                ]
              }
            }
          ],
          linkId: 'home-address-state',
          definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.state',
          text: 'State',
          type: 'choice',
          repeats: false,
          answerValueSet:
            'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/regex',
              valueString: "matches('^[0-9]{4}$')"
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
              valueString: '####'
            }
          ],
          linkId: 'home-address-postcode',
          definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
          text: 'Postcode',
          type: 'string',
          repeats: false
        }
      ]
    }
  ]
};

export const qRepeatsGroupNested: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RepeatsGroupNested',
  name: 'RepeatsGroupNested',
  title: 'Repeats Group with Nested Repeats',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/other/repeats-group-nested',
  item: [
    {
      linkId: 'restrictive-practice',
      text: 'Restrictive practice',
      type: 'group',
      repeats: false,
      item: [
        {
          linkId: 'restrictive-practice-intervention',
          text: 'Restrictive practice intervention',
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
                        code: 'drop-down'
                      }
                    ]
                  }
                }
              ],
              linkId: 'restrictive-practice-intervention-code',
              text: 'Code',
              type: 'choice',
              repeats: false,
              answerOption: [
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '386423001',
                    display: 'Physical restraint'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '90278001',
                    display: 'Secluding patient'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '386517008',
                    display: 'Area restriction (Environmental)'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '68894007',
                    display: 'Placing restraint (Mechanical)'
                  }
                }
              ]
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
              linkId: 'restrictive-practice-intervention-status',
              text: 'Status',
              type: 'choice',
              repeats: false,
              answerOption: [
                {
                  valueCoding: {
                    system: 'http://hl7.org/fhir/event-status',
                    code: 'in-progress',
                    display: 'In Progress'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://hl7.org/fhir/event-status',
                    code: 'on-hold',
                    display: 'On Hold'
                  }
                },
                {
                  valueCoding: {
                    system: 'http://hl7.org/fhir/event-status',
                    code: 'completed',
                    display: 'Completed'
                  }
                }
              ]
            },
            {
              linkId: 'restrictive-practice-intervention-performedstartdate',
              text: 'Performed start date',
              type: 'dateTime',
              repeats: false
            },
            {
              linkId: 'restrictive-practice-intervention-performedenddate',
              text: 'Performed end date',
              type: 'dateTime',
              repeats: false
            },
            {
              linkId: 'restrictive-practice-intervention-note',
              text: 'Note',
              type: 'group',
              repeats: true,
              item: [
                {
                  linkId: 'restrictive-practice-intervention-note-time',
                  text: 'Date and time',
                  type: 'dateTime',
                  repeats: false
                },
                {
                  linkId: 'restrictive-practice-intervention-note-text',
                  text: 'Text',
                  type: 'text',
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

export const qReadOnly: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ReadOnly',
  name: 'ReadOnly',
  title: 'Read Only Question',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/other/read-only',
  item: [
    {
      linkId: 'read-only',
      text: 'Age',
      type: 'integer',
      initial: [
        {
          valueInteger: 50
        }
      ],
      repeats: false,
      readOnly: true
    }
  ]
};
