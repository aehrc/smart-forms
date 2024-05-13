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

export const qOpenChoiceAutocomplete: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceAutocomplete',
  name: 'OpenChoiceAutocomplete',
  title: 'Open-choice Autocomplete',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-autocomplete',
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

export const qChoiceDropDownAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceDropDownAO',
  name: 'ChoiceDropDownAO',
  title: 'Choice DropDown - Answer Option',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/choice-drop-down-ao',
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
      linkId: 'smoking-status',
      text: 'Smoking status',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '266919005',
            display: 'Never smoked'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '77176002',
            display: 'Smoker'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '8517006',
            display: 'Ex-smoker'
          }
        },
        {
          valueCoding: {
            system: 'http://snomed.info/sct',
            code: '16090371000119103',
            display: 'Exposure to second hand tobacco smoke'
          }
        },
        {
          valueString: 'Wants to quit'
        },
        {
          valueString: 'Other tobacco use'
        }
      ]
    }
  ]
};

export const qChoiceDropDownAnswerValueSet: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceDropDownAVS',
  name: 'ChoiceDropDownAVS',
  title: 'Choice DropDown - Answer Value Set',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/choice-drop-down-avs',
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

export const qChoiceCheckboxAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceCheckboxAO',
  name: 'ChoiceCheckboxAO',
  title: 'Choice Checkbox - Answer Option',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/choice-checkbox-ao',
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
      linkId: 'red-flags-any-age-single',
      text: 'Red flags at any age (single-select)',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueString: 'Strong parental concerns'
        },
        {
          valueString: 'Significant loss of skills'
        },
        {
          valueString: 'Lack of response to sound or visual stimuli'
        },
        {
          valueString: 'Poor interaction with adults or other children'
        },
        {
          valueString: 'Lack of, or limited eye contact'
        },
        {
          valueString:
            'Differences between right and left sides of body in strength, movement or tone'
        },
        {
          valueString:
            'Marked low tone (floppy) or high tone (stiff and tense) and significantly impacting on development and functional motor skills'
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
                code: 'check-box'
              }
            ]
          }
        }
      ],
      linkId: 'red-flags-any-age-multi',
      text: 'Red flags at any age (multi-select)',
      type: 'choice',
      repeats: true,
      answerOption: [
        {
          valueString: 'Strong parental concerns'
        },
        {
          valueString: 'Significant loss of skills'
        },
        {
          valueString: 'Lack of response to sound or visual stimuli'
        },
        {
          valueString: 'Poor interaction with adults or other children'
        },
        {
          valueString: 'Lack of, or limited eye contact'
        },
        {
          valueString:
            'Differences between right and left sides of body in strength, movement or tone'
        },
        {
          valueString:
            'Marked low tone (floppy) or high tone (stiff and tense) and significantly impacting on development and functional motor skills'
        }
      ]
    }
  ]
};

export const qChoiceCheckboxAnswerValueSet: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceCheckboxAVS',
  name: 'ChoiceCheckboxAVS',
  title: 'Choice Checkbox - Answer Value Set',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/choice-checkbox-avs',
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
      linkId: 'primary-carers-single',
      text: 'Primary carers (single-select)',
      type: 'choice',
      repeats: false,
      answerValueSet: '#PrimaryCarerParentGrandparent'
    },
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

export const qOpenChoiceCheckboxAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceCheckboxAO',
  name: 'OpenChoiceCheckboxAO',
  title: 'Open-choice Checkbox AO',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-checkbox-ao',
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
      linkId: 'otoscopic-findings-left-single',
      text: 'Otoscopy findings - left ear (single-select)',
      type: 'open-choice',
      repeats: false,
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
    },
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
      linkId: 'otoscopic-findings-left-multi',
      text: 'Otoscopy findings - left ear (multi-select)',
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

export const qOpenChoiceCheckboxAnswerValueSet: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceCheckboxAVS',
  name: 'OpenChoiceCheckboxAVS',
  title: 'Open Choice Checkbox - Answer Value Set',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-checkbox-avs',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'australian-states-territories-2',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10026'
        }
      ],
      version: '2.0.2',
      name: 'AustralianStatesAndTerritories',
      title: 'Australian States and Territories',
      status: 'active',
      experimental: false,
      date: '2020-05-31',
      publisher: 'Australian Digital Health Agency',
      contact: [
        {
          telecom: [
            {
              system: 'email',
              value: 'help@digitalhealth.gov.au'
            }
          ]
        }
      ],
      description:
        'The Australian States and Territories value set includes values that represent the Australian states and territories.',
      copyright:
        'Copyright © 2018 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes material that is based on Australian Institute of Health and Welfare material. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            concept: [
              {
                code: 'ACT'
              },
              {
                code: 'NSW'
              },
              {
                code: 'NT'
              },
              {
                code: 'OTHER'
              },
              {
                code: 'QLD'
              },
              {
                code: 'SA'
              },
              {
                code: 'TAS'
              },
              {
                code: 'VIC'
              },
              {
                code: 'WA'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'e9439195-c1d8-4069-a349-98c1d552a351',
        timestamp: '2023-06-20T04:20:58+00:00',
        total: 9,
        offset: 0,
        parameter: [
          {
            name: 'version',
            valueUri:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1|1.1.3'
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
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'ACT',
            display: 'Australian Capital Territory'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NSW',
            display: 'New South Wales'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'NT',
            display: 'Northern Territory'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'OTHER',
            display: 'Other territories'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'QLD',
            display: 'Queensland'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'SA',
            display: 'South Australia'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'TAS',
            display: 'Tasmania'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'VIC',
            display: 'Victoria'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1',
            code: 'WA',
            display: 'Western Australia'
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
                code: 'check-box'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'Overseas state, please specify'
        }
      ],
      linkId: 'state-single',
      text: 'State (single-selection)',
      type: 'open-choice',
      repeats: false,
      answerValueSet: '#australian-states-territories-2'
    },
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
          valueString: 'Overseas state, please specify'
        }
      ],
      linkId: 'state-multi',
      text: 'State (multi-selection)',
      type: 'open-choice',
      repeats: true,
      answerValueSet: '#australian-states-territories-2'
    }
  ]
};

export const qChoiceRadioAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceRadioAO',
  name: 'ChoiceRadioAO',
  title: 'Choice Radio - Answer Option',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/choice-radio-ao',
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
      linkId: 'puberty-worries',
      text: 'Is there anything that you are worried about in relation to puberty/your sexual health?',
      type: 'choice',
      repeats: false,
      answerOption: [
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'Y',
            display: 'Yes'
          }
        },
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          }
        },
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'NASK',
            display: 'Not Asked'
          }
        },
        {
          valueCoding: {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'asked-declined',
            display: 'Asked But Declined'
          }
        }
      ]
    }
  ]
};

export const qChoiceRadioAnswerValueSet: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ChoiceRadioAVS',
  name: 'ChoiceRadioAVS',
  title: 'Choice Radio - Answer Value Set',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/choice-radio-avs',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'YesNoNA',
      url: 'https://smartforms.csiro.au/ig/ValueSet/YesNoNA',
      name: 'YesNoNA',
      title: 'Yes/No/NA',
      status: 'draft',
      experimental: false,
      description: 'Concepts for Yes, No and Not applicable',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            concept: [
              {
                code: 'Y',
                display: 'Yes'
              },
              {
                code: 'N',
                display: 'No'
              },
              {
                code: 'NA',
                display: 'N/A'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:5baa5444-e553-4412-a08c-9ce93d3271e0',
        timestamp: '2023-09-01T11:16:50+10:00',
        total: 3,
        parameter: [
          {
            name: 'version',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.1.0'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.1.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'Y',
            display: 'Yes'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'NA',
            display: 'N/A'
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
                code: 'radio-button'
              }
            ]
          }
        }
      ],
      linkId: 'registered-for-my-aged-care',
      text: 'Registered for My Aged Care',
      type: 'choice',
      repeats: false,
      answerValueSet: '#YesNoNA'
    }
  ]
};

export const qOpenChoiceRadioAnswerOption: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceRadioAO',
  name: 'OpenChoiceRadioAO',
  title: 'Open Choice Radio - Answer Option',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-radio-ao',
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
      linkId: 'location-of-health-check',
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

export const qOpenChoiceRadioAnswerValueSet: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'OpenChoiceRadioAVS',
  name: 'OpenChoiceRadioAVS',
  title: 'Open Choice Radio - Answer Value Set',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/advanced/control/itemcontrol/question/open-choice-radio-avs',
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'SmokingQuitStatus-1',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/valueset-supplement',
          valueCanonical: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement'
        }
      ],
      url: 'https://smartforms.csiro.au/ig/ValueSet/SmokingQuitStatus-1',
      name: 'SmokingQuitStatus',
      title: 'Smoking Quit Status',
      status: 'draft',
      experimental: false,
      description:
        'The Smoking Quit Status value set includes values that can indicate how long ago an individual quit smoking.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            concept: [
              {
                code: '48031000119106',
                display: 'Quit >12 months'
              },
              {
                code: '735128000',
                display: 'Quit <12 months'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:86b4329d-aca5-4e54-9b5e-67296c7ce9db',
        timestamp: '2024-04-08T12:56:59+10:00',
        total: 2,
        parameter: [
          {
            name: 'version',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20240331'
          },
          {
            name: 'used-codesystem',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20240331'
          }
        ],
        contains: [
          {
            system: 'http://snomed.info/sct',
            code: '48031000119106',
            display: 'Quit >12 months'
          },
          {
            system: 'http://snomed.info/sct',
            code: '735128000',
            display: 'Quit <12 months'
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
                code: 'radio-button'
              }
            ]
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-openLabel',
          valueString: 'If there is a more precise duration, please specify'
        }
      ],
      linkId: 'quit-status',
      text: 'Quit status',
      type: 'open-choice',
      repeats: false,
      answerValueSet: '#SmokingQuitStatus-1'
    }
  ]
};
