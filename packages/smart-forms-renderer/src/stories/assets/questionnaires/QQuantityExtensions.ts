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

export const qQuantityExtensionsBasic: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QuantityExtensionsBasic',
  name: 'QuantityExtensionsBasic',
  title: 'Quantity Extensions - Basic Example',
  version: '1.0.0-alpha.12',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-10',
  url: 'https://smartforms.csiro.au/docs/sdc/quantity-extensions/basic',
  item: [
    {
      linkId: 'weight',
      text: 'Weight (kg)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 20,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 200,
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback',
          valueString: 'Weight must be at least 20 kg'
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback',
          valueString: 'Weight cannot exceed 200 kg'
        }
      ]
    },
    {
      linkId: 'height',
      text: 'Height (cm)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 50,
            unit: 'cm',
            system: 'http://unitsofmeasure.org',
            code: 'cm'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 250,
            unit: 'cm',
            system: 'http://unitsofmeasure.org',
            code: 'cm'
          }
        }
      ]
    }
  ]
};

export const qQuantityExtensionsMedical: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QuantityExtensionsMedical',
  name: 'QuantityExtensionsMedical',
  title: 'Quantity Extensions - Medical Example',
  version: '1.0.0-alpha.12',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-10',
  url: 'https://smartforms.csiro.au/docs/sdc/quantity-extensions/medical',
  item: [
    {
      linkId: 'temperature',
      text: 'Body Temperature (°C)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 30,
            unit: '°C',
            system: 'http://unitsofmeasure.org',
            code: 'Cel'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 45,
            unit: '°C',
            system: 'http://unitsofmeasure.org',
            code: 'Cel'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback',
          valueString: 'Temperature below 30°C is not physiologically possible'
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback',
          valueString: 'Temperature above 45°C is not physiologically possible'
        }
      ]
    },
    {
      linkId: 'blood-pressure-systolic',
      text: 'Systolic Blood Pressure (mmHg)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 50,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 300,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        }
      ]
    },
    {
      linkId: 'blood-pressure-diastolic',
      text: 'Diastolic Blood Pressure (mmHg)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 30,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 200,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        }
      ]
    },
    {
      linkId: 'heart-rate',
      text: 'Heart Rate (beats per minute)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 30,
            unit: '/min',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 220,
            unit: '/min',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback',
          valueString: 'Heart rate below 30 bpm is not physiologically normal'
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback',
          valueString: 'Heart rate above 220 bpm is not physiologically normal'
        }
      ]
    }
  ]
};

export const qQuantityExtensionsLabValues: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'QuantityExtensionsLabValues',
  name: 'QuantityExtensionsLabValues',
  title: 'Quantity Extensions - Lab Values Example',
  version: '1.0.0-alpha.12',
  status: 'draft',
  publisher: 'AEHRC CSIRO',
  date: '2025-02-10',
  url: 'https://smartforms.csiro.au/docs/sdc/quantity-extensions/lab-values',
  item: [
    {
      linkId: 'glucose',
      text: 'Blood Glucose (mg/dL)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 20,
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 1000,
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback',
          valueString: 'Glucose levels below 20 mg/dL are not physiologically possible'
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback',
          valueString: 'Glucose levels above 1000 mg/dL are not physiologically possible'
        }
      ]
    },
    {
      linkId: 'cholesterol-total',
      text: 'Total Cholesterol (mg/dL)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 50,
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 800,
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL'
          }
        }
      ]
    },
    {
      linkId: 'hemoglobin',
      text: 'Hemoglobin (g/dL)',
      type: 'quantity',
      required: true,
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-minQuantity',
          valueQuantity: {
            value: 5,
            unit: 'g/dL',
            system: 'http://unitsofmeasure.org',
            code: 'g/dL'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-maxQuantity',
          valueQuantity: {
            value: 25,
            unit: 'g/dL',
            system: 'http://unitsofmeasure.org',
            code: 'g/dL'
          }
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/minQuantityValue-feedback',
          valueString: 'Hemoglobin below 5 g/dL indicates severe anemia'
        },
        {
          url: 'https://smartforms.csiro.au/docs/custom-extension/maxQuantityValue-feedback',
          valueString: 'Hemoglobin above 25 g/dL is not physiologically normal'
        }
      ]
    }
  ]
};
