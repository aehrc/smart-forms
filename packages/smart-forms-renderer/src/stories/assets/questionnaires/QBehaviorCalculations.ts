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

export const qLaunchContext: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'LaunchContext',
  name: 'LaunchContext',
  title: 'Launch Context',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/calculations/launch-context',
  item: [
    {
      linkId: 'launch-context-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Form Population</strong> section for the usage of launch context.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Form Population section for the usage of launch context.',
      type: 'display',
      repeats: false
    }
  ]
};

export const qVariable: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'Variable',
  name: 'Variable',
  title: 'Variable',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/calculations/variable',
  item: [
    {
      linkId: 'variables-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Calculated Expression</strong> examples above or the <strong>Form Population</strong> section for the usage of variables.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Calculated Expression examples above or the Form Population section for the usage of variables.',
      type: 'display',
      repeats: false
    }
  ]
};

export const qInitialExpression: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'InitialExpression',
  name: 'InitialExpression',
  title: 'Initial Expression',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/initial-expression',
  item: [
    {
      linkId: 'initial-expression-instructions',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n <p>Please refer to the <strong>Form Population</strong> section for the usage of initial expressions.</p></div>'
          }
        ]
      },
      text: 'Please refer to the Form Population section for the usage of initial expressions.',
      type: 'display',
      repeats: false
    }
  ]
};

export const qCalculatedExpressionCvdRiskCalculator: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'CalculatedExpressionCvdRiskCalculator',
  name: 'CalculatedExpressionCvdRiskCalculator',
  title: 'Calculated Expression CVD Risk Calculator',
  version: '0.1.0',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2024-05-01',
  url: 'https://smartforms.csiro.au/docs/behavior/choice-restrictions/calculated-expression-2',
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
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n        <b><p>NOTE: The Australian guideline for assessing and managing cardiovascular disease risk recommends the use of the online <a href="https://www.cvdcheck.org.au/calculator" target="_blank">Australian CVD risk calculator</a>.</p></b>\r\n    The calculator below should only be used for technology demonstration purposes.</p>\r\n</div>'
              }
            ]
          },
          text: 'NOTE: The Australian guideline for assessing and managing cardiovascular disease risk recommends the use of the online Australian CVD risk calculator (https://www.cvdcheck.org.au/calculator). The calculator below should only be used for technology demonstration purposes.',
          type: 'display',
          repeats: false
        },
        {
          linkId: 'patient-age',
          text: 'Age',
          type: 'integer',
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
