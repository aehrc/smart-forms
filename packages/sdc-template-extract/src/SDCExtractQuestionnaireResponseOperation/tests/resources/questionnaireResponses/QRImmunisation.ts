import type { QuestionnaireResponse } from 'fhir/r4';

export const QRImmunisation: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'QR-1748412484376-1-a4eba970bccc48',
  status: 'in-progress',
  questionnaire: 'http://www.health.gov.au/assessments/mbs/715/Immunisation',
  item: [
    {
      linkId: '205677d6-17c7-4285-a7c4-61aa02b6c816',
      text: 'Immunisation',
      item: [
        {
          linkId: 'vaccinesprevious',
          text: 'Vaccines previously given',
          item: [
            {
              linkId: 'vaccinesprevious-vaccine',
              text: 'Vaccine',
              answer: [
                {
                  valueCoding: {
                    system:
                      'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                    code: 'COVAST',
                    display: 'AstraZeneca Vaxzevria'
                  }
                }
              ]
            },
            {
              linkId: 'vaccinesprevious-date',
              text: 'Administration date',
              answer: [
                {
                  valueDateTime: '2025-01-15'
                }
              ]
            },
            {
              linkId: 'vaccinesprevious-comment',
              text: 'Comment',
              answer: [
                {
                  valueString: 'comment'
                }
              ]
            }
          ]
        },
        {
          linkId: 'vaccinesprevious',
          text: 'Vaccines previously given',
          item: [
            {
              linkId: 'vaccinesprevious-vaccine',
              text: 'Vaccine',
              answer: [
                {
                  valueCoding: {
                    system:
                      'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                    code: 'COVAST',
                    display: 'AstraZeneca Vaxzevria'
                  }
                }
              ]
            },
            {
              linkId: 'vaccinesprevious-date',
              text: 'Administration date',
              answer: [
                {
                  valueDateTime: '2020-12-15'
                }
              ]
            },
            {
              linkId: 'vaccinesprevious-comment',
              text: 'Comment',
              answer: [
                {
                  valueString: 'first one'
                }
              ]
            }
          ]
        },
        {
          linkId: 'vaccinesprevious',
          text: 'Vaccines previously given',
          item: [
            {
              linkId: 'vaccinesprevious-vaccine',
              text: 'Vaccine',
              answer: [
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '837621000168102',
                    display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
                  }
                }
              ]
            },
            {
              linkId: 'vaccinesprevious-comment',
              text: 'Comment',
              answer: [
                {
                  valueString: 'test'
                }
              ]
            }
          ]
        },
        {
          linkId: 'vaccinestoday',
          text: 'Vaccines given today',
          item: [
            {
              linkId: 'vaccinestoday-vaccine',
              text: 'Vaccine',
              answer: [
                {
                  valueCoding: {
                    system:
                      'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                    code: 'COVAST',
                    display: 'AstraZeneca Vaxzevria'
                  }
                }
              ]
            },
            {
              linkId: 'vaccinestoday-batch',
              text: 'Batch number',
              answer: [
                {
                  valueString: '123'
                }
              ]
            },
            {
              linkId: 'vaccinestoday-date',
              text: 'Administration date',
              answer: [
                {
                  valueDateTime: '2025-01-15'
                }
              ]
            },
            {
              linkId: 'vaccinestoday-comment',
              text: 'Comment',
              answer: [
                {
                  valueString: 'comment'
                }
              ]
            }
          ]
        },
        {
          linkId: 'vaccinestoday',
          text: 'Vaccines given today',
          item: [
            {
              linkId: 'vaccinestoday-vaccine',
              text: 'Vaccine',
              answer: [
                {
                  valueCoding: {
                    system:
                      'https://www.humanservices.gov.au/organisations/health-professionals/enablers/air-vaccine-code-formats',
                    code: 'COVAST',
                    display: 'AstraZeneca Vaxzevria'
                  }
                }
              ]
            },
            {
              linkId: 'vaccinestoday-date',
              text: 'Administration date',
              answer: [
                {
                  valueDateTime: '2020-12-15'
                }
              ]
            },
            {
              linkId: 'vaccinestoday-comment',
              text: 'Comment',
              answer: [
                {
                  valueString: 'first one'
                }
              ]
            }
          ]
        },
        {
          linkId: 'vaccinestoday',
          text: 'Vaccines given today',
          item: [
            {
              linkId: 'vaccinestoday-vaccine',
              text: 'Vaccine',
              answer: [
                {
                  valueCoding: {
                    system: 'http://snomed.info/sct',
                    code: '837621000168102',
                    display: 'Diphtheria + tetanus + pertussis 3 component vaccine'
                  }
                }
              ]
            },
            {
              linkId: 'vaccinestoday-comment',
              text: 'Comment',
              answer: [
                {
                  valueString: 'test'
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  subject: {
    type: 'Patient',
    reference: 'Patient/pat-sf'
  },
  authored: '2025-05-28T06:29:32.454Z',
  author: {
    reference: 'Practitioner/bobrester-bob'
  },
  meta: {
    source: 'https://smartforms.csiro.au'
  }
};
