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

export const qObservationBasedExtract: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
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

export const qTemplateBasedExtract: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'draft',
  contained: [
    {
      resourceType: 'Observation',
      id: 'bmi-obs',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '39156-5',
            display: 'Body mass index'
          }
        ]
      },
      subject: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.subject.reference'
            }
          ]
        }
      },
      effectiveDateTime: '1900-01-01',
      _effectiveDateTime: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'now()'
          }
        ]
      },
      valueQuantity: {
        // @ts-ignore - TS2741: Property value is missing in type. This is a template so we can get away with no "value" field
        _value: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'answer.value.value'
            }
          ]
        },
        unit: 'kg/m2',
        system: 'http://unitsofmeasure.org',
        code: 'kg/m2'
      }
    }
  ],
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
          valueString: 'The patient that is to be used to pre-populate the form.'
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
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
              extension: [
                {
                  url: 'template',
                  valueReference: {
                    reference: '#bmi-obs'
                  }
                }
              ]
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
