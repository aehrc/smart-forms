import type { QuestionnaireResponse } from 'fhir/r4';

export const QRSepsisRisk: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'in-progress',
  questionnaire: 'https://example.com/questionnaires/adult-sepsis-screening|0.1.0',
  item: [
    {
      linkId: 'patient-info',
      text: 'Patient Information',
      item: [
        {
          linkId: 'patient-age',
          text: 'Age',
          answer: [
            {
              valueInteger: 57
            }
          ]
        },
        {
          linkId: 'patient-heart-rate',
          text: 'Heart rate',
          answer: [
            {
              valueDecimal: 80
            }
          ]
        },
        {
          linkId: 'patient-bp-systolic',
          text: 'Systolic BP',
          answer: [
            {
              valueDecimal: 165
            }
          ]
        },
        {
          linkId: 'patient-bp-diastolic',
          text: 'Diastolic BP',
          answer: [
            {
              valueDecimal: 95
            }
          ]
        }
      ]
    },
    {
      linkId: 'pi-group',
      text: 'In the context of presumed infection, are any of the following true?',
      item: [
        {
          linkId: 'pi-lookssick',
          text: 'Looks sick',
          answer: [
            {
              valueBoolean: true
            }
          ]
        },
        {
          linkId: 'pi-ageover65',
          text: '65 years or older',
          answer: [
            {
              valueBoolean: false
            }
          ]
        }
      ]
    },
    {
      linkId: 'redflag-group',
      text: 'Is ONE Red Flag present?',
      item: [
        {
          linkId: 'redflag-rr',
          text: 'Respiratory rate >25 BPM',
          answer: [
            {
              valueBoolean: true
            }
          ]
        },
        {
          linkId: 'redflag-hr',
          text: 'Heart rate >=130 BPM',
          answer: [
            {
              valueBoolean: false
            }
          ]
        }
      ]
    },
    {
      linkId: 'amberflag-group',
      text: 'Is an AMBER Flag present?',
      item: [
        {
          linkId: 'amberflag-hr',
          text: 'Heart rate 90-120 BPM',
          answer: [
            {
              valueBoolean: false
            }
          ]
        },
        {
          linkId: 'amberflag-sbp',
          text: 'Systolic BP 90-99',
          answer: [
            {
              valueBoolean: false
            }
          ]
        }
      ]
    },
    {
      linkId: 'extract-red-flag-oxygen',
      text: 'Request administration of O2 for patient',
      answer: [
        {
          id: 'extract-red-flag-oxygen-calculatedExpression-sGqQ0ZNxOZ0yeLRCBdDat',
          valueBoolean: true
        }
      ]
    }
  ],
  subject: {
    type: 'Patient',
    reference: 'Patient/pat-repop',
    display: 'Kimberly Repop'
  },
  author: {
    type: 'Practitioner',
    reference: 'Practitioner/sandyson-sandy',
    display: 'Ms. Sandy Sandyson'
  },
  authored: '2025-10-20T00:23:39.740Z',
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
