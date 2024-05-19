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

export const qInitialExpressionBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'InitialExpressionBasic',
  name: 'InitialExpressionBasic',
  title: 'Initial Expression Basic',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-15',
  url: 'https://smartforms.csiro.au/docs/sdc/population/initial-expression-1',
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
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              'iif(today().toString().select(substring(5,2) & substring(8,2)).toInteger() > %patient.birthDate.toString().select(substring(5,2) & substring(8,2)).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger() - 1)'
          }
        }
      ],
      linkId: 'e2a16e4d-2765-4b61-b286-82cfc6356b30',
      text: 'Age',
      type: 'integer',
      repeats: false,
      readOnly: false
    }
  ]
};

export const qCalculatedExpressionBMICalculatorPrepop: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CalculatedExpressionBMICalculatorPrepop',
  name: 'CalculatedExpressionBMICalculatorPrepop',
  title: 'CalculatedExpression BMI Calculator - Pre-population',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-15',
  url: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-1',
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
  item: [
    {
      linkId: 'bmi-calculation',
      text: 'BMI Calculation',
      type: 'group',
      repeats: false,
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
            }
          ],
          linkId: 'bmi-result',
          text: 'Value',
          type: 'decimal',
          repeats: false,
          readOnly: true
        }
      ]
    }
  ]
};

export const qCalculatedExpressionCvdRiskCalculatorPrepop: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CalculatedExpressionCvdRiskCalculatorPrepop',
  name: 'CalculatedExpressionCvdRiskCalculatorPrepop',
  title: 'Calculated Expression CVD Risk Calculator - Pre-population',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/sdc/population/calculated-expression-2',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTobaccoSmokingStatus',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=72166-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
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
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsHeadCircumference',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=9843-4&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsWaistCircumference',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8280-0&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsBloodPressure',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=85354-9&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsHeartRate',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8867-4&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTotalCholesterol',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=14647-2&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsHDLCholesterol',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=14646-4&_count=1&_sort=-date&patient={{%patient.id}}'
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
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'female',
            language: 'text/fhirpath',
            expression: "iif(item.where(linkId='gender').answer.value.code='female', 1, 0)"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'age',
            language: 'text/fhirpath',
            expression: "item.where(linkId='patient-age').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cvdAge',
            language: 'text/fhirpath',
            expression: 'iif(%age > 74, 74, iif(%age < 35, 35, %age))'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'systolicBP',
            language: 'text/fhirpath',
            expression: "item.where(linkId='systolic-blood-pressure').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'smoker',
            language: 'text/fhirpath',
            expression:
              "iif(item.where(linkId='smoking-status').answer.value.code='77176002', 1, 0)"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'totalCh',
            language: 'text/fhirpath',
            expression: "item.where(linkId='total-cholesterol').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'hdl',
            language: 'text/fhirpath',
            expression: "item.where(linkId='hdl-cholesterol').answer.value"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'diabetes',
            language: 'text/fhirpath',
            expression: "iif(item.where(linkId='has-diabetes').answer.value = true,1,0)"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'ecgLvh',
            language: 'text/fhirpath',
            expression: "iif(item.where(linkId='ecg-lvh').answer.value = true,1,0)"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cBase',
            language: 'text/fhirpath',
            expression: '18.8144'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cFemale',
            language: 'text/fhirpath',
            expression: '%female * -1.2146'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cAge',
            language: 'text/fhirpath',
            expression: '%cvdAge.ln() * -1.8443'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cAgeFemale',
            language: 'text/fhirpath',
            expression: '%female * %cvdAge.ln() * 0.3668'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cSBP',
            language: 'text/fhirpath',
            expression: '%systolicBP.ln() * -1.4032'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cSmoker',
            language: 'text/fhirpath',
            expression: '%smoker * -0.3899'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cTcHdl',
            language: 'text/fhirpath',
            expression: '(%totalCh / %hdl).ln() * -0.539'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cDiabetes',
            language: 'text/fhirpath',
            expression: '%diabetes * -0.3036'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cDiabetesFemale',
            language: 'text/fhirpath',
            expression: '%female * %diabetes * -0.1697'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cEcgLvh',
            language: 'text/fhirpath',
            expression: '%ecgLvh * -0.3362'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'sumOfCoeffs',
            language: 'text/fhirpath',
            expression:
              '%cBase + %cFemale + %cAge + %cAgeFemale + %cSBP + %cSmoker + %cTcHdl + %cDiabetes + %cDiabetesFemale + %cEcgLvh'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cvdScale',
            language: 'text/fhirpath',
            expression: '(0.6536 + (%sumOfCoeffs * -0.2402)).exp()'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cvdU',
            language: 'text/fhirpath',
            expression: '(5.ln()-%sumOfCoeffs)/%cvdScale'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'cvdScore',
            language: 'text/fhirpath',
            expression: '(1 - (%cvdU.exp()*-1).exp()) * 100'
          }
        }
      ],
      linkId: 'absolute-cvd-risk-calculation',
      text: 'Absolute Cardiovascular Risk Calculation ',
      type: 'group',
      item: [
        {
          linkId: 'instruction-use-updated-cvd-risk-calculator',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n        <b><p style="font-size:0.875em">NOTE: The Australian guideline for assessing and managing cardiovascular disease risk recommends the use of the online <a href="https://www.cvdcheck.org.au/calculator" target="_blank">Australian CVD risk calculator</a>.</p></b>\r\n        <p style="font-size:0.875em">The calculator below should only be used for technology demonstration purposes.</p>\r\n</div>'
              }
            ]
          },
          text: 'NOTE: The Australian guideline for assessing and managing cardiovascular disease risk recommends the use of the online Australian CVD risk calculator (https://www.cvdcheck.org.au/calculator). The calculator below should only be used for technology demonstration purposes.',
          type: 'display',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  'iif(today().toString().select(substring(5,2) & substring(8,2)).toInteger() > %patient.birthDate.toString().select(substring(5,2) & substring(8,2)).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger() - 1)'
              }
            }
          ],
          linkId: 'patient-age',
          text: 'Age',
          type: 'integer',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patient.gender'
              }
            },
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
          linkId: 'gender',
          text: 'Gender',
          type: 'choice',
          repeats: false,
          answerValueSet: 'http://hl7.org/fhir/ValueSet/administrative-gender'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsTobaccoSmokingStatus.entry.resource.valueCodeableConcept.coding'
              }
            },
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
                display: 'Ex-Smoker'
              }
            },
            {
              valueCoding: {
                system: 'http://snomed.info/sct',
                code: '16090371000119103',
                display: 'Environmental exposure to tobacco smoke (home, car, etc)'
              }
            },
            {
              valueString: 'Wants to quit'
            },
            {
              valueString: 'Other tobacco use'
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
                  "%ObsBloodPressure.entry.resource.component.where(code.coding.where(code='8480-6')).value.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]',
                display: 'mm Hg'
              }
            }
          ],
          linkId: 'systolic-blood-pressure',
          text: 'Systolic Blood Pressure',
          type: 'decimal',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: 'prompt'
                      }
                    ]
                  }
                }
              ],
              linkId: 'systolic-blood-pressure-prompt',
              text: '75 or more',
              type: 'display'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsTotalCholesterol.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mmol/L',
                display: 'mmol/L'
              }
            }
          ],
          linkId: 'total-cholesterol',
          text: 'Total Cholesterol',
          type: 'decimal',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: 'prompt'
                      }
                    ]
                  }
                }
              ],
              linkId: 'total-cholesterol-prompt',
              text: '2 or more',
              type: 'display'
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsHDLCholesterol.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mmol/L',
                display: 'mmol/L'
              }
            }
          ],
          linkId: 'hdl-cholesterol',
          text: 'HDL Cholesterol',
          type: 'decimal',
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                  valueCodeableConcept: {
                    coding: [
                      {
                        system: 'http://hl7.org/fhir/questionnaire-item-control',
                        code: 'prompt'
                      }
                    ]
                  }
                }
              ],
              linkId: 'hdl-cholesterol-prompt',
              text: 'Between 0.2 - 5',
              type: 'display'
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
                  "%Condition.entry.resource.code.coding.where(system='http://snomed.info/sct' and code='44054006').exists()"
              }
            }
          ],
          linkId: 'has-diabetes',
          text: 'Diabetes',
          type: 'boolean',
          repeats: false
        },
        {
          linkId: 'ecg-lvh',
          text: 'ECG LVH',
          type: 'boolean',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                description: 'CVD Risk Score',
                language: 'text/fhirpath',
                expression: '%cvdScore.round(0)'
              }
            }
          ],
          linkId: 'cvd-result',
          text: 'Cardiovascular disease risk calculated result',
          type: 'integer',
          repeats: false,
          readOnly: true
        }
      ]
    }
  ]
};

export const qItemPopulationContextHomeAddress: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemPopulationContextHomeAddress',
  name: 'ItemPopulationContextHomeAddress',
  title: 'ItemPopulationContext - Home Address',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/sdc/population/item-population-context-1',
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
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
          valueExpression: {
            name: 'HomeAddressRepeat',
            language: 'text/fhirpath',
            expression: "%patient.address.where(use='home' and (type.empty() or type!='postal'))"
          }
        }
      ],
      linkId: 'home-address-container',
      text: 'Home address',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%HomeAddressRepeat.extension('http://hl7.org.au/fhir/StructureDefinition/no-fixed-address').value"
              }
            },
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
          linkId: 'no-fixed-address-boolean',
          definition:
            'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.extension:noFixedAddress',
          text: 'No fixed address',
          type: 'boolean',
          repeats: false
        },
        {
          linkId: 'home-address-repeat-group',
          type: 'group',
          enableWhen: [
            {
              question: 'no-fixed-address-boolean',
              operator: '!=',
              answerBoolean: true
            }
          ],
          repeats: true,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: "%HomeAddressRepeat.select(line.join(', '))"
                  }
                }
              ],
              linkId: 'street-address',
              definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.line',
              text: 'Street address',
              type: 'string',
              repeats: false
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%HomeAddressRepeat.city'
                  }
                }
              ],
              linkId: 'city',
              definition: 'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.city',
              text: 'City',
              type: 'string',
              repeats: false
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%HomeAddressRepeat.state'
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
              linkId: 'state',
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
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                  valueExpression: {
                    language: 'text/fhirpath',
                    expression: '%HomeAddressRepeat.postalCode'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/regex',
                  valueString: "matches('^[0-9]{4}$')"
                },
                {
                  url: 'http://hl7.org/fhir/StructureDefinition/entryFormat',
                  valueString: '####'
                }
              ],
              linkId: 'postcode',
              definition:
                'http://hl7.org.au/fhir/StructureDefinition/au-address#Address.postalCode',
              text: 'Postcode',
              type: 'string',
              repeats: false
            }
          ]
        }
      ]
    }
  ]
};

export const qItemPopulationContextMedicalHistory: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'ItemPopulationContextMedicalHistory',
  name: 'ItemPopulationContextMedicalHistory',
  title: 'ItemPopulationContext - Medical History',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/sdc/population/item-population-context-2',
  extension: [
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'Condition',
        language: 'application/x-fhir-query',
        expression: 'Condition?patient={{%patient.id}}'
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
              "%Condition.entry.resource.where(category.coding.exists(code='problem-list-item'))"
          }
        }
      ],
      linkId: 'medical-history-gtable',
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
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.clinicalStatus.coding'
              }
            }
          ],
          linkId: 'medical-history-clinical-status',
          text: 'Clinical Status',
          type: 'choice',
          answerValueSet: 'http://hl7.org/fhir/ValueSet/condition-clinical'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.onset.ofType(dateTime)'
              }
            }
          ],
          linkId: 'medical-history-onset',
          text: 'Onset Date',
          type: 'date'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ConditionRepeat.recordedDate'
              }
            }
          ],
          linkId: 'medical-history-recorded',
          text: 'Recorded Date',
          type: 'date'
        }
      ]
    }
  ]
};

export const qSourceQueriesBMICalculator: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'SourceQueriesBMICalculator',
  name: 'SourceQueriesBMICalculator',
  title: 'SourceQueries BMI Calculator',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-15',
  url: 'https://smartforms.csiro.au/docs/sdc/population/source-queries',
  contained: [
    {
      resourceType: 'Bundle',
      id: 'PrePopQuery',
      type: 'batch',
      entry: [
        {
          fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52553',
          request: {
            method: 'GET',
            url: 'Observation?code=8302-2&_count=1&_sort=-date&patient={{%patient.id}}'
          }
        },
        {
          fullUrl: 'urn:uuid:38a25157-b8e4-42e4-9525-7954fed52554',
          request: {
            method: 'GET',
            url: 'Observation?code=29463-7&_count=1&_sort=-date&patient={{%patient.id}}'
          }
        }
      ]
    }
  ],
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
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-sourceQueries',
      valueReference: {
        reference: '#PrePopQuery'
      }
    }
  ],
  item: [
    {
      linkId: 'bmi-calculation',
      text: 'BMI Calculation',
      type: 'group',
      repeats: false,
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
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%PrePopQuery.entry[0].resource.entry.resource.value.value'
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
                expression: '%PrePopQuery.entry[1].resource.entry.resource.value.value'
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
            }
          ],
          linkId: 'bmi-result',
          text: 'Value',
          type: 'decimal',
          repeats: false,
          readOnly: true
        }
      ]
    }
  ]
};
