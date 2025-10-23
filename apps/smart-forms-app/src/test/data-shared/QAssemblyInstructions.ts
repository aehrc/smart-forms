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

export const QAssemblyInstructions: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'AssemblyInstructions',
  meta: {
    versionId: '8',
    lastUpdated: '2025-07-24T05:16:24.316+00:00',
    source: '#LvlwhCOMVtUecNGB',
    profile: ['http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular']
  },
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'YesNo',
      url: 'https://smartforms.csiro.au/ig/ValueSet/YesNo',
      name: 'YesNo',
      title: 'Yes/No',
      status: 'draft',
      experimental: false,
      description: 'Concepts for Yes and No',
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
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:41cccc66-fd57-4bc4-bab1-8c5c878d95f7',
        timestamp: '2025-05-01T10:00:50+10:00',
        total: 2,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
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
          }
        ]
      }
    },
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
        identifier: 'urn:uuid:7fce8cc7-b936-4258-921d-923629b04439',
        timestamp: '2025-05-01T10:00:47+10:00',
        total: 3,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
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
    },
    {
      resourceType: 'ValueSet',
      id: 'YesNoNotAskedDeclined',
      url: 'https://smartforms.csiro.au/ig/ValueSet/YesNoNotAskedDeclined',
      name: 'YesNoNotAskedDeclined',
      title: 'Yes/No/Not Asked/Asked But Declined',
      status: 'draft',
      experimental: false,
      description: 'Concepts for Yes, No, Not Asked and Asked But Declined',
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
                code: 'NASK',
                display: 'Not Asked'
              }
            ]
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            concept: [
              {
                code: 'asked-declined',
                display: 'Asked But Declined'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:20552db7-8def-4e55-a0d2-cb446651929c',
        timestamp: '2025-05-01T10:00:51+10:00',
        total: 4,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.1.0'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/data-absent-reason|1.0.0'
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
            code: 'NASK',
            display: 'Not Asked'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'asked-declined',
            display: 'Asked But Declined'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'clinical-condition-1',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/clinical-condition-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10035'
        }
      ],
      version: '1.0.2',
      name: 'ClinicalCondition',
      title: 'Clinical Condition',
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
        'The Clinical Condition value set includes values that cover a broad range of clinical concepts to support the representation of conditions, including problems, diagnoses and disorders.',
      copyright:
        'Copyright © 2018 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'concept',
                op: 'in',
                value: '32570581000036105'
              }
            ]
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
      ],
      description: 'The gender of a person used for administrative purposes.',
      immutable: true,
      copyright: 'Copyright © 2011+ HL7. Licensed under Creative Commons "No Rights Reserved".',
      compose: {
        include: [
          {
            system: 'http://hl7.org/fhir/administrative-gender'
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:31c9098a-778c-4de6-9c2b-4f1e2db26179',
        timestamp: '2025-05-01T10:00:55+10:00',
        total: 4,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://hl7.org/fhir/administrative-gender|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'male',
            display: 'Male'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'female',
            display: 'Female'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'other',
            display: 'Other'
          },
          {
            system: 'http://hl7.org/fhir/administrative-gender',
            code: 'unknown',
            display: 'Unknown'
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
      date: '2019-11-01T09:29:23+11:00',
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
        identifier: 'urn:uuid:7b100d21-fde9-4fd8-bded-80f345db777d',
        timestamp: '2025-05-01T10:00:56+10:00',
        total: 7,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/condition-clinical|3.0.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active',
            contains: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'recurrence',
                display: 'Recurrence'
              },
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'relapse',
                display: 'Relapse'
              }
            ]
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'inactive',
            display: 'Inactive',
            contains: [
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
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'unknown',
            display: 'Unknown'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'AboriginalTorresStraitIslander',
      url: 'https://smartforms.csiro.au/ig/ValueSet/AboriginalTorresStraitIslander',
      name: 'AboriginalTorresStraitIslander',
      title: 'Aboriginal and/or Torres Strait Islander',
      status: 'draft',
      experimental: false,
      description:
        'The Aboriginal and/or Torres Strait Islander value set includes the Australian Indigenous statuses for Indigenous people.',
      compose: {
        include: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            concept: [
              {
                code: '1',
                display: 'Aboriginal'
              },
              {
                code: '2',
                display: 'Torres Strait Islander'
              },
              {
                code: '3',
                display: 'Aboriginal and Torres Strait Islander'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:eb422e76-71e8-48b0-a191-73285ddb91cc',
        timestamp: '2025-05-01T10:00:56+10:00',
        total: 3,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1|1.0.3'
          }
        ],
        contains: [
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            code: '1',
            display: 'Aboriginal'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            code: '2',
            display: 'Torres Strait Islander'
          },
          {
            system:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1',
            code: '3',
            display: 'Aboriginal and Torres Strait Islander'
          }
        ]
      }
    },
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
        identifier: 'urn:uuid:f8e7efc2-94d6-403e-9e40-3a3a4e9fffb4',
        timestamp: '2025-05-01T10:00:56+10:00',
        total: 4,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode|3.0.0'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v3-NullFlavor|3.0.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            code: 'MTH',
            display: 'mother'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            code: 'FTH',
            display: 'father'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
            code: 'GRPRN',
            display: 'grandparent'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-NullFlavor',
            code: 'NA',
            display: 'not applicable'
          }
        ]
      }
    },
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
      date: '2024-02-29',
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
        'The Australian Pronouns value set includes values that indicate the pronouns to be used when communicating with or about an individual.',
      copyright:
        'Copyright © 2025 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis material contains content from LOINC (http://loinc.org). LOINC is copyright 1995-2024, Regenstrief Institute, Inc. and the Logical Observation Identifiers Names and Codes (LOINC) Committee and is available at no cost under the license at http://loinc.org/license. LOINC® is a registered United States trademark of Regenstrief Institute, Inc.\n\nThis material contains information which is protected by copyright. You may download, display, print and reproduce any material for your personal, non-commercial use or use within your organisation subject to the following terms and conditions: \n\nThis resource also includes all or a portion of material from the HL7 Terminology (THO). THO is copyright ©1989+ Health Level Seven International and is made available under the CC0 designation. For more licensing information see: https://terminology.hl7.org/license.',
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
        identifier: 'urn:uuid:1bc98e8c-511f-4014-a4d9-a48a8db0923d',
        timestamp: '2025-05-01T10:00:56+10:00',
        total: 7,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-valueset',
            valueUri: 'null'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://loinc.org|2.80'
          },
          {
            name: 'version',
            valueUri: 'http://loinc.org|2.80'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/data-absent-reason|1.0.0'
          }
        ],
        contains: [
          {
            system: 'http://loinc.org',
            code: 'LA29518-0',
            display: 'he/him/his/his/himself'
          },
          {
            system: 'http://loinc.org',
            code: 'LA29519-8',
            display: 'she/her/her/hers/herself'
          },
          {
            system: 'http://loinc.org',
            code: 'LA29520-6',
            display: 'they/them/their/theirs/themselves'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'unknown',
            display: 'Unknown'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'asked-declined',
            display: 'Asked But Declined'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'not-asked',
            display: 'Not Asked'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'asked-unknown',
            display: 'Asked But Unknown'
          }
        ]
      }
    },
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
        identifier: 'urn:uuid:148e9412-a321-4a6f-b911-7e7908be82af',
        timestamp: '2025-05-01T10:00:57+10:00',
        total: 9,
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri:
              'https://healthterminologies.gov.au/fhir/CodeSystem/australian-states-territories-1|1.1.3'
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
    },
    {
      resourceType: 'ValueSet',
      id: 'gender-identity-response-1',
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/gender-identity-response-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10271'
        }
      ],
      version: '1.1.0',
      name: 'GenderIdentityResponse',
      title: 'Gender Identity Response',
      status: 'active',
      experimental: false,
      date: '2024-02-29',
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
        "The Gender Identity Response value set includes values that may be used to represent a response for an individual's gender. A person's gender is a social and cultural identity, expression and experience.",
      copyright:
        'Copyright © 2022 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/.\n\n"This resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted. \n\nThis resource includes material that is based on Australian Institute of Health and Welfare material. This resource includes material that is based on Australian Bureau of Statistics data. \n\nThis resource also includes all or a portion of material from the HL7 Terminology (THO). THO is copyright ©1989+ Health Level Seven International and is made available under the CC0 designation. For more licensing information see: https://terminology.hl7.org/license.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            concept: [
              {
                code: '446151000124109'
              },
              {
                code: '446141000124107'
              },
              {
                code: '33791000087105'
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
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:81810018-2ec2-4e42-adcc-6aab69e7750c',
        timestamp: '2025-05-01T10:00:58+10:00',
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-valueset',
            valueUri: 'null'
          },
          {
            name: 'used-codesystem',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'version',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/data-absent-reason|1.0.0'
          }
        ],
        contains: [
          {
            system: 'http://snomed.info/sct',
            code: '446151000124109',
            display: 'Identifies as male gender'
          },
          {
            system: 'http://snomed.info/sct',
            code: '446141000124107',
            display: 'Identifies as female gender'
          },
          {
            system: 'http://snomed.info/sct',
            code: '33791000087105',
            display: 'Identifies as nonbinary gender'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'unknown',
            display: 'Unknown'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'asked-declined',
            display: 'Asked But Declined'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
            code: 'not-asked',
            display: 'Not Asked'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'biological-sex-1',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/biological-sex-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10198'
        }
      ],
      version: '1.0.0',
      name: 'BiologicalSex',
      title: 'Biological Sex',
      status: 'active',
      experimental: false,
      date: '2020-12-31',
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
        'The Biological Sex value set includes values that represent the biological sex of an individual.',
      copyright:
        'Copyright © 2020 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted. \n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value: '^ 32570631000036107|Sex reference set|'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:9a0c2291-6dd8-4778-9099-4622f64fa897',
        timestamp: '2025-05-01T10:00:49+10:00',
        offset: 0,
        parameter: [
          {
            name: 'displayLanguage',
            valueCode: 'en-US'
          },
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-valueset',
            valueUri: 'null'
          },
          {
            name: 'used-codesystem',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'version',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          }
        ],
        contains: [
          {
            system: 'http://snomed.info/sct',
            code: '248152002',
            display: 'Female'
          },
          {
            system: 'http://snomed.info/sct',
            code: '32570681000036106',
            display: 'Indeterminate sex'
          },
          {
            system: 'http://snomed.info/sct',
            code: '32570691000036108',
            display: 'Intersex'
          },
          {
            system: 'http://snomed.info/sct',
            code: '248153007',
            display: 'Male'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'SmokingQuitStatus-1',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/valueset-supplement',
          valueCanonical:
            'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
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
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
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
        identifier: 'urn:uuid:93600010-14a0-4d6e-a82f-15283d13a2cb',
        timestamp: '2025-05-01T11:41:24+10:00',
        parameter: [
          {
            name: 'used-supplement',
            valueUri: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
          },
          {
            name: 'used-codesystem',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'version',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'warning-draft',
            valueUri: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
          },
          {
            name: 'warning-draft',
            valueUri: 'https://smartforms.csiro.au/ig/ValueSet/SmokingQuitStatus-1|0.3.0'
          }
        ],
        contains: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '48031000119106',
            display: 'Quit >12 months'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '735128000',
            display: 'Quit <12 months'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'TobaccoUseStatus-1',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/valueset-supplement',
          valueCanonical:
            'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
        }
      ],
      url: 'https://smartforms.csiro.au/ig/ValueSet/TobaccoUseStatus-1',
      name: 'TobaccoUseStatus',
      title: 'Tobacco Use Status',
      status: 'draft',
      experimental: false,
      description:
        "The Tobacco Use Status value set includes values that may be used to represent an individual's current tobacco use and exposure status.",
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            concept: [
              {
                code: '266919005',
                display: 'Never smoked'
              },
              {
                code: '77176002',
                display: 'Current smoker'
              },
              {
                code: '8517006',
                display: 'Ex-smoker'
              },
              {
                code: '16090371000119103',
                display: 'Exposure to second hand tobacco smoke'
              },
              {
                code: '394872000',
                display: 'Wants to quit'
              },
              {
                code: '713914004',
                display: 'Other tobacco use'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:e7e976ca-5eb9-41da-9ca8-2c795c5e2dd2',
        timestamp: '2025-05-01T11:43:41+10:00',
        parameter: [
          {
            name: 'used-supplement',
            valueUri: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
          },
          {
            name: 'used-codesystem',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'version',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'warning-draft',
            valueUri: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
          },
          {
            name: 'warning-draft',
            valueUri: 'https://smartforms.csiro.au/ig/ValueSet/TobaccoUseStatus-1|0.3.0'
          }
        ],
        contains: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '266919005',
            display: 'Never smoked'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '77176002',
            display: 'Current smoker'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '8517006',
            display: 'Ex-smoker'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '16090371000119103',
            display: 'Exposure to second hand tobacco smoke'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '394872000',
            display: 'Wants to quit'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '713914004',
            display: 'Other tobacco use'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'CervicalScreeningStatus-1',
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/valueset-supplement',
          valueCanonical:
            'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
        }
      ],
      url: 'https://smartforms.csiro.au/ig/ValueSet/CervicalScreeningStatus-1',
      name: 'CervicalScreeningStatus',
      title: 'Cervical Screening Status',
      status: 'draft',
      experimental: false,
      description:
        "The Cervical Screening Status value set includes values that can be used to represent the status of an individual's participation in a cervical screening program.",
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            concept: [
              {
                code: '736595007',
                display: 'Declined'
              },
              {
                code: '410527000',
                display: 'Offered'
              },
              {
                code: '171154002',
                display: 'Not required'
              },
              {
                code: '171155001',
                display: 'Up to date'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:3657ae6f-b206-482f-a745-0ff9c99358ef',
        timestamp: '2025-06-05T13:50:47+10:00',
        parameter: [
          {
            name: 'used-supplement',
            valueUri: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
          },
          {
            name: 'used-codesystem',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'version',
            valueUri:
              'http://snomed.info/sct|http://snomed.info/sct/32506021000036107/version/20250430'
          },
          {
            name: 'warning-draft',
            valueUri: 'https://smartforms.csiro.au/ig/CodeSystem/HealthChecksSCTSupplement|0.3.0'
          },
          {
            name: 'warning-draft',
            valueUri: 'https://smartforms.csiro.au/ig/ValueSet/CervicalScreeningStatus-1|0.3.0'
          }
        ],
        contains: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '736595007',
            display: 'Declined'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '410527000',
            display: 'Offered'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '171154002',
            display: 'Not required'
          },
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107/version/20250430',
            code: '171155001',
            display: 'Up to date'
          }
        ]
      }
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
      valueCode: 'assemble-root'
    },
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
          valueString: 'The practitioner user that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'encounter'
          }
        },
        {
          url: 'type',
          valueCode: 'Encounter'
        },
        {
          url: 'description',
          valueString: 'The encounter that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression:
          'Condition?patient={{%patient.id}}&category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBloodPressure',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=85354-9&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTobaccoSmokingStatus',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=72166-2&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'SexAtBirthCoding',
        language: 'text/fhirpath',
        expression:
          "%patient.extension.where(exists(url='http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender' and extension.where(exists(url='type' and value.coding.code='1515311000168102')) and extension.where(url='effectivePeriod').value.end.empty())).extension.where(url='value').value.coding"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBloodPressureLatest',
        language: 'text/fhirpath',
        expression:
          "%ObsBloodPressure.entry.resource.where(status = 'final' or status = 'amended' or status = 'corrected').first()"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTobaccoSmokingStatusLatest',
        language: 'text/fhirpath',
        expression:
          "%ObsTobaccoSmokingStatus.entry.resource.where(status = 'final' or status = 'amended' or status = 'corrected').first()"
      }
    },
    {
      url: 'http://hl7.org/fhir/5.0/StructureDefinition/extension-Questionnaire.versionAlgorithm[x]',
      valueCoding: {
        system: 'http://hl7.org/fhir/version-algorithm',
        code: 'semver'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#YesNoNA'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#YesNo'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#YesNoNotAskedDeclined'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#clinical-condition-1'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#administrative-gender'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#condition-clinical'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#AboriginalTorresStraitIslander'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#PrimaryCarerParentGrandparent'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#australian-pronouns-1'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#australian-states-territories-2'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#gender-identity-response-1'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#biological-sex-1'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#SmokingQuitStatus-1'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#TobaccoUseStatus-1'
      }
    },
    {
      url: 'https://smartforms.csiro.au/ig/StructureDefinition/ContainedResourceReference',
      valueReference: {
        reference: '#CervicalScreeningStatus-1'
      }
    }
  ],
  url: 'http://www.health.gov.au/assessments/mbs/715',
  version: '0.3.0',
  name: 'AboriginalTorresStraitIslanderHealthCheck',
  title: 'Aboriginal and Torres Strait Islander Health Check',
  status: 'draft',
  experimental: false,
  subjectType: ['Patient'],
  date: '2025-03-14',
  publisher: 'AEHRC CSIRO',
  contact: [
    {
      name: 'AEHRC CSIRO',
      telecom: [
        {
          system: 'url',
          value:
            'https://confluence.csiro.au/display/PCDQFPhase2/Primary+Care+Data+Quality+Foundations+-+Phase+2'
        }
      ]
    }
  ],
  jurisdiction: [
    {
      coding: [
        {
          system: 'urn:iso:std:iso:3166',
          code: 'AU',
          display: 'Australia'
        }
      ]
    }
  ],
  copyright:
    'Copyright © 2022+ Australian Government Department of Health and Aged Care - All rights reserved.\nThis content is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.\nSee https://creativecommons.org/licenses/by-sa/4.0/.\n',
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
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'age',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='5b224753-9365-44e3-823b-9c17e7394005').item.where(linkId='e2a16e4d-2765-4b61-b286-82cfc6356b30').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'postcode',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='5b224753-9365-44e3-823b-9c17e7394005').item.where(linkId='f1262ade-843c-4eba-a86d-51a9c97d134b').item.where(linkId='4e0dc185-f83e-4027-b7a8-ecb543d42c6d').item.where(linkId='3f61a1ea-1c74-4f52-8519-432ce861a74f').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryCurrentPriorities',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='b3a3eee2-f340-452e-9d05-d1f54f677b81').item.where(linkId='7cd424e5-7672-4e99-8a99-30b1fb3043fd').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryMedicalHistory',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='28d5dbe4-1e65-487c-847a-847f544a6a91').item.where(linkId='62774152-8a6e-4449-af9f-87bdce8b9bf5').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryRegularMedications',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a').item.where(linkId='aa9ff2ed-bcd2-406d-a9ff-89c201df2605').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryAllergiesAdverseReactions',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='d4e4db07-a795-4a30-bd0f-9c109f96a22b').item.where(linkId='3e689aeb-69a1-4a9b-93bd-50377511dd9b').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryFamilyHistory',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='01f67f0b-e3be-48d8-a2ad-4c54f469cd13').item.where(linkId='49ee4583-c608-41d4-a1e9-c06cf4292369').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySocialEmotionalWellbeing',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='0a3c9c93-5836-4a5b-93e5-d7de559e053a').item.where(linkId='b5a00aad-2a8b-4ac3-87b2-4a5920ca22ee').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySocialHistory',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='a5cc8a8f-89cf-470c-a6bd-ce9da2f64ee9').item.where(linkId='76d51512-b94a-4092-b3ae-a656fbb9c360').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryHomeFamily',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='819b3305-bf93-4502-9986-242ea2ae5f43').item.where(linkId='08d2e80e-3bb4-4f67-8b1c-090b1ace225a').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryLearningDevelopment',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='3e7d7246-98f8-4803-b063-8405ac30b086').item.where(linkId='5ab80929-5901-431d-bf68-67d532f5fa58').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryLearningWorkAdults',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='5437e30d-8a0a-4785-974e-00a10d2a1df0').item.where(linkId='3569e514-a74b-4343-b31b-3395e58d991a').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryLearningWorkOlder',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='dec713ae-246a-4961-95c9-0626bfebfed2').item.where(linkId='ed6f7800-e22a-4639-9d11-faf845513500').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryMood',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='9559242e-9ffe-4e1f-a9fc-86d1fa62c4b9').item.where(linkId='db9a8650-42a2-4bd3-8066-7e09394120d5').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryMemoryThinking',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='1bd58e7b-2cb7-45fb-965f-d5fa33d0bb4c').item.where(linkId='1f0e7fde-e964-4f36-9151-dbdc5e145f94').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryChronicDiseaseAgeing',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='c5da020c-c4f3-437c-b658-ea7e7667514d').item.where(linkId='7292070b-8944-4a40-bcf6-9aaf1721e986').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryScreeningPrograms',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='9674ffa0-2ad9-4ca3-80e6-e8bb0670a802').item.where(linkId='70f82c4b-d1f9-44d5-9903-bd7097799c05').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryHealthyEating',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='ae7a3801-9491-4b1f-820c-678236d18f56').item.where(linkId='301789b0-8c6a-470d-8787-0ac6597e3bea').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryPhysicalActivityScreenTimeNotOlder',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='74736baa-455b-41d2-af98-fb65cd463e97').item.where(linkId='ccbd7fbf-0d40-4cb3-82b3-ad2c7cc7bba2').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryPhysicalActivityScreenTimeOlder',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='d56234a0-aafd-4c22-96c9-00ead8424f0b').item.where(linkId='25b8b8fd-adb1-48ab-aeae-528603668c4b').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySubstanceUse',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='14a9fb5f-5b0e-4862-b143-08a11cd3ebf0').item.where(linkId='f8e1cc1f-f1a1-4eb3-8255-77d600f52831').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryGambling',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='a7bb0dd2-4b2d-49c2-9da6-3cb0a4dd9240').item.where(linkId='2ab74c97-55d9-4fd9-968f-8962d62ea573').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySexualHealthAdolescents',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='4b49c291-6e93-4b7e-be3b-15ef8bc207ad').item.where(linkId='b41572ba-cf36-4cec-addf-cb0b47fea63f').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySexualHealthAdults',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='589b53a4-ceb2-41c0-850a-69438f9fd1cc').item.where(linkId='efd0735c-c379-471f-83bb-93b0392093aa').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySexualHealthOlder',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='02048954-e9d7-424e-8c7b-6a3c495d7ce4').item.where(linkId='e9936322-e6fe-4cf7-ab61-22846a8fbb95').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryEyeHealth',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='961da481-1698-4a1d-962b-a9c2185e335a').item.where(linkId='8dcdc04c-7655-4b47-88eb-8425f0cdc0d0').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryEarHealthHearing',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='de71bbd0-178c-4974-9c75-55d5a48c66f7').item.where(linkId='ac87b23a-b022-4d62-9e82-1c56583bca34').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryOralDentalHealth',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='bde9ab00-a20f-4a7c-9266-11f53f60c65f').item.where(linkId='875574fa-9769-42ca-8381-9e80c3e5233d').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummarySkin',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='7d4772cb-a1cd-49d9-853f-883ccd8343a6').item.where(linkId='88d23fa4-df88-43ab-a1d0-69315d55c3bf').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryImmunisation',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='205677d6-17c7-4285-a7c4-61aa02b6c816').item.where(linkId='bcd1c9f2-889e-41e5-8c2b-a70221c5cec5').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryExamination',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='c587e3b6-b91a-40dc-9a16-179342d001e9').item.where(linkId='fcbfa6e1-c101-4675-969d-aa11027859c2').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryAbsoluteCVDRisk',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='d95abe99-8ef2-4b97-bc88-a2901e2ebc9c').item.where(linkId='f8022f3f-21fe-42c0-8abd-95f24e2e37e5').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'HealthPrioritiesSummaryInvestigations',
            language: 'text/fhirpath',
            expression:
              "item.where(linkId='918f7f32-cdaf-4742-b33a-8254eda2d8bd').item.where(linkId='96a8d946-6078-4c85-9de8-3bf18d2c8150').answer.value"
          }
        }
      ],
      linkId: 'fd5af92e-c248-497a-8007-ee0952ccd4d9',
      type: 'group',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/AboutTheHealthCheck|0.3.0'
            }
          ],
          linkId: 'cd3303a6-e3b6-4732-80e8-54d2bd740beb',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/AboutTheHealthCheck|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Consent|0.3.0'
            }
          ],
          linkId: 'fab52f87-22a6-4a54-9797-0bb6b0f5d2a2',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Consent|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/PatientDetails|0.3.0'
            }
          ],
          linkId: '1d10910d-c195-4964-bdc6-98310a44719e',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/PatientDetails|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/CurrentPriorities|0.3.0'
            }
          ],
          linkId: '7692f28c-7c0a-48ea-b27d-a8489974377d',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/CurrentPriorities|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/MedicalHistoryCurrentProblems|0.3.0'
            }
          ],
          linkId: '15f83d80-f49a-4852-a20f-18db9b951e53',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/MedicalHistory|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/RegularMedications|0.3.0'
            }
          ],
          linkId: '3a7151ef-d63b-4818-8367-03d394383a61',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/RegularMedications|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/AllergiesAdverseReactions|0.3.0'
            }
          ],
          linkId: '334853dc-88d4-4cb1-a119-bb0ff6ea0516',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/AllergiesAdverseReactions|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/FamilyHistory|0.3.0'
            }
          ],
          linkId: '1ab9b519-85ce-48ee-a408-8f0b9b74d112',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/FamilyHistory|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/SocialAndEmotionalWellbeing|0.3.0'
            }
          ],
          linkId: '228b8d31-21e3-49a6-b802-984135908dca',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/SocialAndEmotionalWellbeing|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/SocialHistoryChild|0.3.0'
            }
          ],
          linkId: 'a43517f9-538e-4a4d-8789-b6c3d44206ba',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/SocialHistoryChild|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/HomeAndFamily|0.3.0'
            }
          ],
          linkId: '8decf7bf-e24c-4d3d-815c-c53e269f004b',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/HomeAndFamily|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/LearningAndDevelopment|0.3.0'
            }
          ],
          linkId: '3f554c37-7d0e-4b14-8f7f-a9ec665cc0a6',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/LearningAndDevelopment|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/LearningAndWork|0.3.0'
            }
          ],
          linkId: '362bf381-23e5-4eee-963a-3de73e584da5',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/LearningAndWork|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Mood|0.3.0'
            }
          ],
          linkId: '51a545fa-907f-40f0-9304-36bcab5a16b8',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Mood|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/MemoryAndThinking|0.3.0'
            }
          ],
          linkId: '4217646d-e8e4-4ac5-baa7-fae28937cda7',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/MemoryAndThinking|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/ChronicDiseaseAgeing|0.3.0'
            }
          ],
          linkId: '070eadcf-9e93-499e-8615-61991ab35b32',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/ChronicDiseaseAgeing|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/ScreeningPrograms|0.3.0'
            }
          ],
          linkId: '56d4bc0b-3bf1-4d47-ac34-5a1de0902de1',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/ScreeningPrograms|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/HealthyEating|0.3.0'
            }
          ],
          linkId: 'e0962739-c506-41d4-afd7-ab1b90db9cb4',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/HealthyEating|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/PhysicalActivityAndScreenTime|0.3.0'
            }
          ],
          linkId: '63cfb279-cd7d-41ed-a54b-0c17b6efe609',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/PhysicalActivityAndScreenTime|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/RedFlagsEarlyIdentificationGuide|0.3.0'
            }
          ],
          linkId: 'db70690e-2199-495a-9919-53697efaf913',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/RedFlagsEarlyIdentificationGuide|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/SubstanceUse|0.3.0'
            }
          ],
          linkId: 'd1f66f56-75fa-4498-9c51-eb98e1644243',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/SubstanceUse|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Gambling|0.3.0'
            }
          ],
          linkId: 'ea748251-bf77-4085-b912-e9002dfa02ca',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Gambling|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/SexualHealth|0.3.0'
            }
          ],
          linkId: '84bd802b-b3e1-4098-aa2c-2133f0e252f4',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/SexualHealth|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/EyeHealth|0.3.0'
            }
          ],
          linkId: '56ad8128-0e12-4779-8ff4-47dcff6b29b5',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/EyeHealth|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/EarHealthAndHearing|0.3.0'
            }
          ],
          linkId: 'a8161e91-7cff-403f-85e6-982a9bc8fca6',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/EarHealthAndHearing|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/OralAndDentalHealth|0.3.0'
            }
          ],
          linkId: 'fe05d868-aaed-4921-9d49-4e7746bbe143',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/OralAndDentalHealth|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Skin|0.3.0'
            }
          ],
          linkId: '64ec4c1c-0824-4b84-8d3f-40f6e066cb80',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Skin|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Immunisation|0.3.0'
            }
          ],
          linkId: '595737cd-3a94-442b-8be6-ab461c3181d2',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Immunisation|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Examination|0.3.0'
            }
          ],
          linkId: '3263611d-5813-4393-a660-d10166acd728',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Examination|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/AbsoluteCVDRiskCalculation|0.3.0'
            }
          ],
          linkId: '3a3b0810-e091-48ad-af50-913b0deaf663',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/AbsoluteCVDRiskCalculation|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical: 'http://www.health.gov.au/assessments/mbs/715/Investigations|0.3.0'
            }
          ],
          linkId: '302d9437-25b9-41e3-9d66-138c352d32a8',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/Investigations|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/HealthPrioritiesSummary|0.3.0'
            }
          ],
          linkId: 'ada45623-5e86-49ea-a00b-be0699364281',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/HealthPrioritiesSummary|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
              valueCanonical:
                'http://www.health.gov.au/assessments/mbs/715/FinalisingHealthCheck|0.3.0'
            }
          ],
          linkId: 'a6395946-872a-4f2e-b697-c74aa1ab9b8d',
          text: 'Sub-questionnaire [http://www.health.gov.au/assessments/mbs/715/FinalisingHealthCheck|0.3.0] not available. Unable to display all questions.',
          type: 'display'
        }
      ]
    }
  ]
};
