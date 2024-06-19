export const QRadiologyScenariosPoc = {
  resourceType: 'Questionnaire',
  id: 'RadiologyScenariosPoc',
  url: 'https://smartforms.csiro.au/docs/radiology-scenarios',
  version: '0.1.0',
  name: 'RadiologyScenarios',
  title: 'Radiology Scenarios',
  status: 'draft',
  date: '2024-05-01',
  publisher: 'AEHRC CSIRO',
  item: [
    {
      linkId: 'Disclaimer',
      text: 'This is a proof-of-concept of dynamic terminology usage. The logic might not be fully reliable, and visual elements like loading indicators and error messages are not finalized.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    <em>This is a proof-of-concept of dynamic terminology usage. The logic might not be fully reliable, and visual elements like loading indicators and error messages are not finalized.</em>\r\n    </div>'
          }
        ]
      },
      type: 'display'
    },
    {
      linkId: 'scenario-1',
      text: "1. Request for Procedure + Site as 'Single item'",
      type: 'group',
      item: [
        {
          linkId: 'Guidance1',
          text: 'Example: X-ray of left hand',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    Example: <b>X-ray of right foot</b>\r\n    </div>'
              }
            ]
          },
          type: 'display'
        },
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
          linkId: 'scenario-1-procedure',
          text: 'Procedure',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/imaging-procedure-1'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'procedureCode2',
            language: 'text/fhirpath',
            expression: "item.where(linkId='scenario-2-procedure').answer.value.code"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'associatedSiteOptions2',
            language: 'text/fhirpath',
            expression:
              "iif(%procedureCode2.exists(), %terminologies.expand('http://snomed.info/sct?fhir_vs%3Decl%2F' + %procedureCode2 + '.%3C%3C363704007').expansion.contains, '' )"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'associatedSitePrepop2',
            language: 'text/fhirpath',
            expression:
              "iif(%procedureCode2.exists(), %terminologies.expand('http://snomed.info/sct?fhir_vs%3Decl%2F' + %procedureCode2 + '.%3C%3C363704007').expansion.contains[0], '' )"
          }
        }
      ],
      linkId: 'scenario-2',
      text: '2. Request for Procedure - populate Site if present',
      type: 'group',
      item: [
        {
          linkId: 'Guidance2',
          text: 'Example with Site: X-ray of right foot, Example without site: X-ray',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    Example with site: <b>X-ray of right foot</b>\r\n<br/>Example without site: <b>X-ray</b>    </div>'
              }
            ]
          },
          type: 'display'
        },
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
          linkId: 'scenario-2-procedure',
          text: 'Procedure',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/imaging-procedure-1'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%associatedSitePrepop2.code'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%associatedSiteOptions2'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%procedureCode2 and %associatedSiteOptions2.exists()'
              }
            }
          ],
          linkId: 'scenario-2-associated-site',
          text: 'Associated site',
          type: 'choice'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'procedureCode3',
            language: 'text/fhirpath',
            expression: "item.where(linkId='scenario-3-procedure').answer.value.code"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'associatedSiteOptions3',
            language: 'text/fhirpath',
            expression:
              "iif(%procedureCode3.exists(), %terminologies.expand('http://snomed.info/sct?fhir_vs%3Decl%2F%3C' + %procedureCode3 + '.%3C%3C363704007').expansion.contains, '' )"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'procedureHasSiteBoolean3',
            language: 'text/fhirpath',
            expression:
              "iif(%procedureCode3.exists(), expand('http://snomed.info/sct?fhir_vs%3Decl%2F' + %procedureCode3 + '.%3C%3C363704007').expansion.contains.count() > 0, false )"
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'enableSiteSelection3',
            language: 'text/fhirpath',
            expression:
              '%procedureCode3.exists() and %associatedSiteOptions3.exists() and %procedureHasSiteBoolean3 = false'
          }
        },
        {
          url: 'http://hl7.org/fhir/StructureDefinition/variable',
          valueExpression: {
            name: 'noSitesAvailable',
            language: 'text/fhirpath',
            expression:
              '%procedureCode3.exists() and %associatedSiteOptions3.exists() = false and %procedureHasSiteBoolean3 = false'
          }
        }
      ],
      linkId: 'scenario-3',
      text: '3. Request for Procedure - allow further site refinement if site not specified in term',
      type: 'group',
      item: [
        {
          linkId: 'Guidance3',
          text: 'Example with specified Site: Magnetic resonance imaging of chest, Example without specified Site: Magnetic resonance imaging',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n    Example with specified Site: <b>Magnetic resonance imaging</b>\r\n<br/>Example without specified Site: <b>Magnetic resonance imaging of chest</b>    </div>'
              }
            ]
          },
          type: 'display'
        },
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
          linkId: 'scenario-3-procedure',
          text: 'Procedure',
          type: 'choice',
          answerValueSet: 'https://healthterminologies.gov.au/fhir/ValueSet/imaging-procedure-1'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%enableSiteSelection3'
              }
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-answerExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%associatedSiteOptions3'
              }
            }
          ],
          linkId: 'scenario-3-associated-site',
          text: 'Associated site',
          type: 'choice'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%noSitesAvailable'
              }
            }
          ],
          linkId: 'scenario-3-no-sites-available',
          text: 'No sites available to choose from',
          type: 'display'
        }
      ]
    }
  ]
};
