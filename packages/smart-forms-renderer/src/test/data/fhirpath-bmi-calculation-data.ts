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

import type { Questionnaire, QuestionnaireResponse, QuestionnaireResponseItem } from 'fhir/r4';
import type { Variables } from '../../interfaces';

export const QBMICalculation: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CalculatedExpressionBMICalculatorPrepop',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
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
    }
  ],
  url: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-1',
  version: '0.1.0',
  name: 'CalculatedExpressionBMICalculatorPrepop',
  title: 'CalculatedExpression BMI Calculator - Pre-population',
  status: 'draft',
  date: '2024-05-15',
  publisher: 'AEHRC CSIRO',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'height',
            language: 'text/fhirpath',
            expression: "item.where(linkId='patient-height').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'weight',
            language: 'text/fhirpath',
            expression: "item.where(linkId='patient-weight').answer.value"
          }
        }
      ],
      linkId: 'bmi-calculation',
      text: 'BMI Calculation',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyHeight.entry.resource.value.value'
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
          ],
          linkId: 'patient-height',
          text: 'Height',
          type: 'decimal',
          repeats: false,
          readOnly: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsBodyWeight.entry.resource.value.value'
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
          ],
          linkId: 'patient-weight',
          text: 'Weight',
          type: 'decimal',
          repeats: false,
          readOnly: false
        },
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
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationExtract',
              valueBoolean: true
            }
          ],
          linkId: 'bmi-result',
          code: [
            {
              system: 'http://snomed.info/sct',
              code: '60621009',
              display: 'Body mass index'
            }
          ],
          text: 'Value',
          type: 'quantity',
          repeats: false,
          readOnly: true
        }
      ]
    }
  ]
};

export const QRBMICalculation: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-1|0.1.0',
  item: [
    {
      linkId: 'bmi-calculation',
      text: 'BMI Calculation',
      item: [
        {
          linkId: 'patient-height',
          text: 'Height',
          answer: [
            {
              valueDecimal: 163
            }
          ]
        },
        {
          linkId: 'patient-weight',
          text: 'Weight',
          answer: [
            {
              valueDecimal: 77.3
            }
          ]
        },
        {
          linkId: 'bmi-result',
          text: 'Value',
          answer: [
            {
              valueQuantity: {
                value: 29.1,
                unit: 'kg/m2',
                system: 'http://unitsofmeasure.org',
                code: 'kg/m2'
              }
            }
          ]
        }
      ]
    }
  ],
  subject: {
    type: 'Patient',
    reference: 'Patient/pat-repop',
    display: 'Kimberly Repop'
  },
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};

export const BMICalculationItemMap: Record<string, QuestionnaireResponseItem[]> = {
  'patient-height': [
    {
      linkId: 'patient-height',
      text: 'Height',
      answer: [
        {
          valueDecimal: 163
        }
      ]
    }
  ],
  'patient-weight': [
    {
      linkId: 'patient-weight',
      text: 'Weight',
      answer: [
        {
          valueDecimal: 77.3
        }
      ]
    }
  ],
  'bmi-result': [
    {
      linkId: 'bmi-result',
      text: 'Value',
      answer: [
        {
          valueQuantity: {
            value: 29.1,
            unit: 'kg/m2',
            system: 'http://unitsofmeasure.org',
            code: 'kg/m2'
          }
        }
      ]
    }
  ],
  'bmi-calculation': [
    {
      linkId: 'bmi-calculation',
      text: 'BMI Calculation',
      item: [
        {
          linkId: 'patient-height',
          text: 'Height',
          answer: [
            {
              valueDecimal: 163
            }
          ]
        },
        {
          linkId: 'patient-weight',
          text: 'Weight',
          answer: [
            {
              valueDecimal: 77.3
            }
          ]
        },
        {
          linkId: 'bmi-result',
          text: 'Value',
          answer: [
            {
              valueQuantity: {
                value: 29.1,
                unit: 'kg/m2',
                system: 'http://unitsofmeasure.org',
                code: 'kg/m2'
              }
            }
          ]
        }
      ]
    }
  ]
};

export const BMICalculationVariables: Variables = {
  fhirPathVariables: {
    QuestionnaireLevel: [],
    'patient-height': [],
    'patient-weight': [],
    'bmi-result': [],
    'bmi-calculation': [
      {
        name: 'height',
        language: 'text/fhirpath',
        expression: "item.where(linkId='patient-height').answer.value"
      },
      {
        name: 'weight',
        language: 'text/fhirpath',
        expression: "item.where(linkId='patient-weight').answer.value"
      }
    ]
  },
  xFhirQueryVariables: {
    ObsBodyHeight: {
      valueExpression: {
        name: 'ObsBodyHeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    ObsBodyWeight: {
      valueExpression: {
        name: 'ObsBodyWeight',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    }
  }
};

export const BMICalculationExistingFhirPathContext: Record<string, any> = {
  resource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  },
  rootResource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress'
  },
  patient: {
    resourceType: 'Patient',
    id: 'pat-repop',
    meta: {
      versionId: '1',
      lastUpdated: '2025-07-14T22:39:39.645+00:00',
      profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-patient']
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml"><p style="border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;"><b>Kimberly Repop</b> female, DoB: 1968-10-11 ( Medicare Number/69514496771 (period: (?) --&gt; 2024-08))</p><hr/><table class="grid"><tr><td style="background-color: #f3f5da" title="Other Ids (see the one above)">Other Id:</td><td colspan="3">IHI/8003608833357361</td></tr><tr><td style="background-color: #f3f5da" title="Alternate names (see the one above)">Alt. Name:</td><td colspan="3">Kimberly Repop(OFFICIAL)</td></tr><tr><td style="background-color: #f3f5da" title="Ways to contact the Patient">Contact Details:</td><td colspan="3"><ul><li>ph: 0491 572 665(MOBILE)</li><li>ph: 0123456879(HOME)</li><li>4 Brisbane Street Brisbane QLD 4112 AU (HOME)</li><li>PO Box Number Brisbane QLD 4112 AU (TEMP)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Languages spoken">Language:</td><td colspan="3"><span title="Codes: {urn:ietf:bcp:47 yub}">Yugambal</span></td></tr><tr><td style="background-color: #f3f5da" title="Nominated Contact: Emergency Contact">Emergency Contact:</td><td colspan="3"><ul><li>Ms Phone A Friend</li><li>0987654321</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29520-6}">they/them/their/theirs/themselves</span></li><li>period: 2018-02 --&gt; 2022-06</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29519-8}">she/her/her/hers/herself</span></li><li>period: 2022-06 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Recorded sex or gender (RSG) information includes the various sex and gender concepts that are often used in existing systems but are known NOT to represent a gender identity, sex parameter for clinical use, or attributes related to sexuality, such as sexual orientation, sexual activity, or sexual attraction. Examples of recorded sex or gender concepts include administrative gender, administrative sex, and sex assigned at birth.  When exchanging this concept, refer to the guidance in the [Gender Harmony Implementation Guide](http://hl7.org/xprod/ig/uv/gender-harmony/).\n\nThis extension is published in this guide to meet the short-term needs of implementers. This extension may be deprecated in a future version of this guide when there are alternative approaches available (e.g. R6 Patient resource, clinical reasoning, etc.).">Recorded sex or gender:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://hl7.org/fhir/administrative-gender female}">female</span></li><li>type: <span title="Codes: {http://loinc.org 76689-9}">Sex assigned at birth</span></li></ul></td></tr></table></div>'
    },
    extension: [
      {
        url: 'http://hl7.org.au/fhir/StructureDefinition/closing-the-gap-registration',
        valueBoolean: true
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
        extension: [
          {
            url: 'value',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'LA29520-6',
                  display: 'they/them/their/theirs/themselves'
                }
              ]
            }
          },
          {
            url: 'period',
            valuePeriod: {
              start: '2018-02',
              end: '2022-06'
            }
          }
        ]
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
        extension: [
          {
            url: 'value',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'LA29519-8',
                  display: 'she/her/her/hers/herself'
                }
              ]
            }
          },
          {
            url: 'period',
            valuePeriod: {
              start: '2022-06'
            }
          }
        ]
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender',
        extension: [
          {
            url: 'value',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/administrative-gender',
                  code: 'female'
                }
              ]
            }
          },
          {
            url: 'type',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '76689-9',
                  display: 'Sex assigned at birth'
                }
              ]
            }
          }
        ]
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MC',
              display: "Patient's Medicare Number"
            }
          ],
          text: 'Medicare Number'
        },
        system: 'http://ns.electronichealth.net.au/id/medicare-number',
        value: '69514496771',
        period: {
          end: '2024-08'
        }
      },
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'NI',
              display: 'National unique individual identifier'
            }
          ],
          text: 'IHI'
        },
        system: 'http://ns.electronichealth.net.au/id/hi/ihi/1.0',
        value: '8003608833357361'
      }
    ],
    name: [
      {
        use: 'usual',
        text: 'Kimberly Repop',
        family: 'Repop',
        given: ['Kimberly']
      }
    ],
    telecom: [
      {
        system: 'phone',
        value: '0491 572 665',
        use: 'mobile'
      },
      {
        system: 'phone',
        value: '0123456879',
        use: 'home'
      }
    ],
    gender: 'female',
    birthDate: '1968-10-11',
    address: [
      {
        use: 'home',
        line: ['4 Brisbane Street'],
        city: 'Brisbane',
        state: 'QLD',
        postalCode: '4112',
        country: 'AU'
      },
      {
        use: 'temp',
        line: ['PO Box Number'],
        city: 'Brisbane',
        state: 'QLD',
        postalCode: '4112',
        country: 'AU'
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'C',
                display: 'Emergency Contact'
              }
            ]
          }
        ],
        name: {
          text: 'Ms Phone A Friend'
        },
        telecom: [
          {
            system: 'phone',
            value: '0987654321'
          }
        ]
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: 'urn:ietf:bcp:47',
              code: 'yub',
              display: 'Yugambal'
            }
          ],
          text: 'Yugambal'
        }
      }
    ]
  },
  ObsBodyHeight: {
    resourceType: 'Bundle',
    id: '373d81d4-7a23-4354-b6cc-87ca4d3edeff',
    meta: {
      lastUpdated: '2025-07-28T07:57:48.602+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_count=1&_sort=-date&code=8302-2&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bodyheight-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'bodyheight-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-14T22:39:39.645+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bodyheight',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyheight-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyheight-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bodyheight.html">AU Core Body Height</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: height <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8302-2 &quot;Body height&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#50373000)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 163 cm<span style="background: LightGoldenRodYellow"> (Details: UCUM code cm = \'cm\')</span></p></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ],
              text: 'Vital Signs'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8302-2',
                display: 'Body height'
              },
              {
                system: 'http://snomed.info/sct',
                code: '50373000'
              }
            ],
            text: 'height'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          encounter: {
            reference: 'Encounter/annualvisit-2'
          },
          effectiveDateTime: '2022-02-10',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp'
            }
          ],
          valueQuantity: {
            value: 163,
            unit: 'cm',
            system: 'http://unitsofmeasure.org',
            code: 'cm'
          }
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsBodyWeight: {
    resourceType: 'Bundle',
    id: '00d7a1eb-801e-482c-81d7-126e489f2cf5',
    meta: {
      lastUpdated: '2025-07-28T07:57:48.604+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_count=1&_sort=-date&code=29463-7&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bodyweight-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'bodyweight-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-14T22:39:39.645+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bodyweight',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyweight-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyweight-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bodyweight.html">AU Core Body Weight</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: weight <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#29463-7 &quot;Body weight&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#27113001)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 77.3 kg<span style="background: LightGoldenRodYellow"> (Details: UCUM code kg = \'kg\')</span></p></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ],
              text: 'Vital Signs'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '29463-7',
                display: 'Body weight'
              },
              {
                system: 'http://snomed.info/sct',
                code: '27113001'
              }
            ],
            text: 'weight'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          encounter: {
            reference: 'Encounter/annualvisit-2'
          },
          effectiveDateTime: '2022-02-10',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp'
            }
          ],
          valueQuantity: {
            value: 77.3,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  height: [],
  weight: []
};

export const BMICalculationResultingFhirPathContext: Record<string, any> = {
  resource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    questionnaire: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-1|0.1.0',
    item: [
      {
        linkId: 'bmi-calculation',
        text: 'BMI Calculation',
        item: [
          {
            linkId: 'patient-height',
            text: 'Height',
            answer: [
              {
                valueDecimal: 163
              }
            ]
          },
          {
            linkId: 'patient-weight',
            text: 'Weight',
            answer: [
              {
                valueDecimal: 77.3
              }
            ]
          },
          {
            linkId: 'bmi-result',
            text: 'Value',
            answer: [
              {
                valueQuantity: {
                  value: 29.1,
                  unit: 'kg/m2',
                  system: 'http://unitsofmeasure.org',
                  code: 'kg/m2'
                }
              }
            ]
          }
        ]
      }
    ],
    subject: {
      type: 'Patient',
      reference: 'Patient/pat-repop',
      display: 'Kimberly Repop'
    },
    meta: {
      source: 'https://smartforms.csiro.au'
    }
  },
  rootResource: {
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    questionnaire: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-1|0.1.0',
    item: [
      {
        linkId: 'bmi-calculation',
        text: 'BMI Calculation',
        item: [
          {
            linkId: 'patient-height',
            text: 'Height',
            answer: [
              {
                valueDecimal: 163
              }
            ]
          },
          {
            linkId: 'patient-weight',
            text: 'Weight',
            answer: [
              {
                valueDecimal: 77.3
              }
            ]
          },
          {
            linkId: 'bmi-result',
            text: 'Value',
            answer: [
              {
                valueQuantity: {
                  value: 29.1,
                  unit: 'kg/m2',
                  system: 'http://unitsofmeasure.org',
                  code: 'kg/m2'
                }
              }
            ]
          }
        ]
      }
    ],
    subject: {
      type: 'Patient',
      reference: 'Patient/pat-repop',
      display: 'Kimberly Repop'
    },
    meta: {
      source: 'https://smartforms.csiro.au'
    }
  },
  patient: {
    resourceType: 'Patient',
    id: 'pat-repop',
    meta: {
      versionId: '1',
      lastUpdated: '2025-07-14T22:39:39.645+00:00',
      profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-patient']
    },
    text: {
      status: 'generated',
      div: '<div xmlns="http://www.w3.org/1999/xhtml"><p style="border: 1px #661aff solid; background-color: #e6e6ff; padding: 10px;"><b>Kimberly Repop</b> female, DoB: 1968-10-11 ( Medicare Number/69514496771 (period: (?) --&gt; 2024-08))</p><hr/><table class="grid"><tr><td style="background-color: #f3f5da" title="Other Ids (see the one above)">Other Id:</td><td colspan="3">IHI/8003608833357361</td></tr><tr><td style="background-color: #f3f5da" title="Alternate names (see the one above)">Alt. Name:</td><td colspan="3">Kimberly Repop(OFFICIAL)</td></tr><tr><td style="background-color: #f3f5da" title="Ways to contact the Patient">Contact Details:</td><td colspan="3"><ul><li>ph: 0491 572 665(MOBILE)</li><li>ph: 0123456879(HOME)</li><li>4 Brisbane Street Brisbane QLD 4112 AU (HOME)</li><li>PO Box Number Brisbane QLD 4112 AU (TEMP)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Languages spoken">Language:</td><td colspan="3"><span title="Codes: {urn:ietf:bcp:47 yub}">Yugambal</span></td></tr><tr><td style="background-color: #f3f5da" title="Nominated Contact: Emergency Contact">Emergency Contact:</td><td colspan="3"><ul><li>Ms Phone A Friend</li><li>0987654321</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29520-6}">they/them/their/theirs/themselves</span></li><li>period: 2018-02 --&gt; 2022-06</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="The pronouns to use when referring to an individual in verbal or written communication.">Individual Pronouns:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://loinc.org LA29519-8}">she/her/her/hers/herself</span></li><li>period: 2022-06 --&gt; (ongoing)</li></ul></td></tr><tr><td style="background-color: #f3f5da" title="Recorded sex or gender (RSG) information includes the various sex and gender concepts that are often used in existing systems but are known NOT to represent a gender identity, sex parameter for clinical use, or attributes related to sexuality, such as sexual orientation, sexual activity, or sexual attraction. Examples of recorded sex or gender concepts include administrative gender, administrative sex, and sex assigned at birth.  When exchanging this concept, refer to the guidance in the [Gender Harmony Implementation Guide](http://hl7.org/xprod/ig/uv/gender-harmony/).\n\nThis extension is published in this guide to meet the short-term needs of implementers. This extension may be deprecated in a future version of this guide when there are alternative approaches available (e.g. R6 Patient resource, clinical reasoning, etc.).">Recorded sex or gender:</td><td colspan="3"><ul><li>value: <span title="Codes: {http://hl7.org/fhir/administrative-gender female}">female</span></li><li>type: <span title="Codes: {http://loinc.org 76689-9}">Sex assigned at birth</span></li></ul></td></tr></table></div>'
    },
    extension: [
      {
        url: 'http://hl7.org.au/fhir/StructureDefinition/closing-the-gap-registration',
        valueBoolean: true
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
        extension: [
          {
            url: 'value',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'LA29520-6',
                  display: 'they/them/their/theirs/themselves'
                }
              ]
            }
          },
          {
            url: 'period',
            valuePeriod: {
              start: '2018-02',
              end: '2022-06'
            }
          }
        ]
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/individual-pronouns',
        extension: [
          {
            url: 'value',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: 'LA29519-8',
                  display: 'she/her/her/hers/herself'
                }
              ]
            }
          },
          {
            url: 'period',
            valuePeriod: {
              start: '2022-06'
            }
          }
        ]
      },
      {
        url: 'http://hl7.org/fhir/StructureDefinition/individual-recordedSexOrGender',
        extension: [
          {
            url: 'value',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://hl7.org/fhir/administrative-gender',
                  code: 'female'
                }
              ]
            }
          },
          {
            url: 'type',
            valueCodeableConcept: {
              coding: [
                {
                  system: 'http://loinc.org',
                  code: '76689-9',
                  display: 'Sex assigned at birth'
                }
              ]
            }
          }
        ]
      }
    ],
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MC',
              display: "Patient's Medicare Number"
            }
          ],
          text: 'Medicare Number'
        },
        system: 'http://ns.electronichealth.net.au/id/medicare-number',
        value: '69514496771',
        period: {
          end: '2024-08'
        }
      },
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'NI',
              display: 'National unique individual identifier'
            }
          ],
          text: 'IHI'
        },
        system: 'http://ns.electronichealth.net.au/id/hi/ihi/1.0',
        value: '8003608833357361'
      }
    ],
    name: [
      {
        use: 'usual',
        text: 'Kimberly Repop',
        family: 'Repop',
        given: ['Kimberly']
      }
    ],
    telecom: [
      {
        system: 'phone',
        value: '0491 572 665',
        use: 'mobile'
      },
      {
        system: 'phone',
        value: '0123456879',
        use: 'home'
      }
    ],
    gender: 'female',
    birthDate: '1968-10-11',
    address: [
      {
        use: 'home',
        line: ['4 Brisbane Street'],
        city: 'Brisbane',
        state: 'QLD',
        postalCode: '4112',
        country: 'AU'
      },
      {
        use: 'temp',
        line: ['PO Box Number'],
        city: 'Brisbane',
        state: 'QLD',
        postalCode: '4112',
        country: 'AU'
      }
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                code: 'C',
                display: 'Emergency Contact'
              }
            ]
          }
        ],
        name: {
          text: 'Ms Phone A Friend'
        },
        telecom: [
          {
            system: 'phone',
            value: '0987654321'
          }
        ]
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: 'urn:ietf:bcp:47',
              code: 'yub',
              display: 'Yugambal'
            }
          ],
          text: 'Yugambal'
        }
      }
    ]
  },
  ObsBodyHeight: {
    resourceType: 'Bundle',
    id: '373d81d4-7a23-4354-b6cc-87ca4d3edeff',
    meta: {
      lastUpdated: '2025-07-28T07:57:48.602+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_count=1&_sort=-date&code=8302-2&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bodyheight-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'bodyheight-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-14T22:39:39.645+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bodyheight',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyheight-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyheight-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bodyheight.html">AU Core Body Height</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: height <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#8302-2 &quot;Body height&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#50373000)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 163 cm<span style="background: LightGoldenRodYellow"> (Details: UCUM code cm = \'cm\')</span></p></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ],
              text: 'Vital Signs'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '8302-2',
                display: 'Body height'
              },
              {
                system: 'http://snomed.info/sct',
                code: '50373000'
              }
            ],
            text: 'height'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          encounter: {
            reference: 'Encounter/annualvisit-2'
          },
          effectiveDateTime: '2022-02-10',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp'
            }
          ],
          valueQuantity: {
            value: 163,
            unit: 'cm',
            system: 'http://unitsofmeasure.org',
            code: 'cm'
          }
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  ObsBodyWeight: {
    resourceType: 'Bundle',
    id: '00d7a1eb-801e-482c-81d7-126e489f2cf5',
    meta: {
      lastUpdated: '2025-07-28T07:57:48.604+00:00'
    },
    type: 'searchset',
    total: 1,
    link: [
      {
        relation: 'self',
        url: 'http://proxy.smartforms.io/fhir/Observation?_count=1&_sort=-date&code=29463-7&patient=pat-repop'
      }
    ],
    entry: [
      {
        fullUrl: 'http://proxy.smartforms.io/fhir/Observation/bodyweight-pat-repop',
        resource: {
          resourceType: 'Observation',
          id: 'bodyweight-pat-repop',
          meta: {
            versionId: '1',
            lastUpdated: '2025-07-14T22:39:39.645+00:00',
            profile: [
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-bodyweight',
              'http://hl7.org.au/fhir/core/StructureDefinition/au-core-observation'
            ]
          },
          text: {
            status: 'generated',
            div: '<div xmlns="http://www.w3.org/1999/xhtml"><p><b>Generated Narrative: Observation</b><a name="bodyweight-pat-sf"> </a></p><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px">Resource Observation &quot;bodyweight-pat-sf&quot; </p><p style="margin-bottom: 0px">Profiles: <a href="StructureDefinition-au-core-bodyweight.html">AU Core Body Weight</a>, <a href="StructureDefinition-au-core-observation.html">AU Core Observation</a></p></div><p><b>status</b>: final</p><p><b>category</b>: Vital Signs <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="http://terminology.hl7.org/5.3.0/CodeSystem-observation-category.html">Observation Category Codes</a>#vital-signs)</span></p><p><b>code</b>: weight <span style="background: LightGoldenRodYellow; margin: 4px; border: 1px solid khaki"> (<a href="https://loinc.org/">LOINC</a>#29463-7 &quot;Body weight&quot;; <a href="https://browser.ihtsdotools.org/">SNOMED CT</a>#27113001)</span></p><p><b>subject</b>: <a href="Patient-pat-sf.html">Patient/pat-sf</a> &quot; FORM&quot;</p><p><b>encounter</b>: <a href="Encounter-annualvisit-2.html">Encounter/annualvisit-2</a></p><p><b>effective</b>: 2022-02-10</p><p><b>performer</b>: <a href="PractitionerRole-bobrester-bob-gp.html">PractitionerRole/bobrester-bob-gp</a></p><p><b>value</b>: 77.3 kg<span style="background: LightGoldenRodYellow"> (Details: UCUM code kg = \'kg\')</span></p></div>'
          },
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ],
              text: 'Vital Signs'
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '29463-7',
                display: 'Body weight'
              },
              {
                system: 'http://snomed.info/sct',
                code: '27113001'
              }
            ],
            text: 'weight'
          },
          subject: {
            reference: 'Patient/pat-repop'
          },
          encounter: {
            reference: 'Encounter/annualvisit-2'
          },
          effectiveDateTime: '2022-02-10',
          performer: [
            {
              reference: 'PractitionerRole/bobrester-bob-gp'
            }
          ],
          valueQuantity: {
            value: 77.3,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        search: {
          mode: 'match'
        }
      }
    ]
  },
  height: [163],
  weight: [77.3]
};
