import type { Questionnaire } from 'fhir/r4';

export const QSepsisRisk: Questionnaire = {
  resourceType: 'Questionnaire',
  contained: [
    {
      resourceType: 'ServiceRequest',
      id: 'patient-transfer-001',
      status: 'active',
      intent: 'order',
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '3457005',
              display: 'Patient referral'
            }
          ]
        }
      ],
      priority: 'urgent',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '107724000',
            display: 'Patient transfer'
          }
        ],
        text: 'Transfer to acute care hospital'
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
      _authoredOn: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authoredOn'
          }
        ]
      },
      requester: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author.reference'
            }
          ]
        }
      },
      reasonReference: [
        {
          reference: '#suspected-sepsis-001',
          display: 'Suspected sepsis'
        }
      ]
    },
    {
      resourceType: 'Condition',
      id: 'suspected-sepsis-001',
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active'
          }
        ]
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'provisional',
            display: 'Provisional'
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis'
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '91302008',
            display: 'Sepsis'
          }
        ],
        text: 'Suspected sepsis'
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
      _recordedDate: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authored'
          }
        ]
      },
      recorder: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author.reference'
            }
          ]
        }
      },
      asserter: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author.reference'
            }
          ]
        }
      },
      evidence: [
        {
          detail: [
            {
              _reference: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString: '%resource.id'
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    {
      resourceType: 'ServiceRequest',
      id: 'oxygen-administration-001',
      status: 'active',
      intent: 'order',
      category: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '277132007',
              display: 'Therapeutic procedure'
            }
          ]
        }
      ],
      priority: 'urgent',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '371907003',
            display: 'Oxygen administration'
          }
        ],
        text: 'Administration of oxygen'
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
      _authoredOn: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: '%resource.authoredOn'
          }
        ]
      },
      requester: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.author.reference'
            }
          ]
        }
      },
      reasonReference: [
        {
          reference: '#suspected-sepsis-001',
          display: 'Suspected sepsis'
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
            code: 'user'
          }
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner that is to be used to pre-populate the form.'
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
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsRespRate',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=9279-1&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsTemperature',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=8310-5&_count=1&_sort=-date&patient={{%patient.id}}'
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
        description: 'Contains both systolic and diastolic BP',
        name: 'ObsBloodPressure',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=85354-9&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'ObsOxygenSaturation',
        language: 'application/x-fhir-query',
        expression: 'Observation?code=2708-6&_count=1&_sort=-date&patient={{%patient.id}}'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'patientAge',
        language: 'text/fhirpath',
        expression:
          'iif(today().toString().select(substring(5,2) & substring(8,2)).toInteger() > %patient.birthDate.toString().select(substring(5,2) & substring(8,2)).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger(), today().toString().substring(0,4).toInteger() - %patient.birthDate.toString().substring(0,4).toInteger() - 1)'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'piGroup',
        language: 'text/fhirpath',
        expression: "%resource.item.where(linkId='pi-group')"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'atLeastOnePiFilled',
        language: 'text/fhirpath',
        expression:
          "%piGroup.item.where(linkId='pi-lookssick').answer.value.exists() or %piGroup.item.where(linkId='pi-fever').answer.value.exists() or %piGroup.item.where(linkId='pi-representation').answer.value.exists() or %piGroup.item.where(linkId='pi-immuno').answer.value.exists() or %piGroup.item.where(linkId='pi-malnourished').answer.value.exists() or %piGroup.item.where(linkId='pi-device').answer.value.exists() or %piGroup.item.where(linkId='pi-ageover65').answer.value.exists() or %piGroup.item.where(linkId='pi-atsi').answer.value.exists()"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'piScore',
        language: 'text/fhirpath',
        expression:
          "iif(%piGroup.item.where(linkId='pi-lookssick').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-fever').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-representation').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-immuno').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-malnourished').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-device').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-ageover65').answer.value=true, 1, 0) + iif(%piGroup.item.where(linkId='pi-atsi').answer.value.where(system='https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1' and (code='1' or code='2' or code='3')).exists(), 1, 0)"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'redFlagGroup',
        language: 'text/fhirpath',
        expression: "%resource.item.where(linkId='redflag-group')"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'atLeastOneRedFlagFilled',
        language: 'text/fhirpath',
        expression:
          "%redFlagGroup.item.where(linkId='redflag-rr').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-temp').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-hr').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-sbp').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-urine').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-o2').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-rash').answer.value.exists() or %redFlagGroup.item.where(linkId='redflag-mental').answer.value.exists()"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'redFlagScore',
        language: 'text/fhirpath',
        expression:
          "iif(%redFlagGroup.item.where(linkId='redflag-rr').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-temp').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-hr').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-sbp').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-urine').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-o2').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-rash').answer.value = true, 1, 0) + iif(%redFlagGroup.item.where(linkId='redflag-mental').answer.value = true, 1, 0)"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'amberFlagGroup',
        language: 'text/fhirpath',
        expression: "%resource.item.where(linkId='amberflag-group')"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'atLeastOneAmberFlagFilled',
        language: 'text/fhirpath',
        expression:
          "%amberFlagGroup.item.where(linkId='amberflag-rr').answer.value.exists() or %amberFlagGroup.item.where(linkId='amberflag-hr').answer.value.exists() or %amberFlagGroup.item.where(linkId='amberflag-sbp').answer.value.exists() or %amberFlagGroup.item.where(linkId='amberflag-urine').answer.value.exists() or %amberFlagGroup.item.where(linkId='amberflag-fever').answer.value.exists() or %amberFlagGroup.item.where(linkId='amberflag-function').answer.value.exists() or %amberFlagGroup.item.where(linkId='amberflag-trauma').answer.value.exists()"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'amberFlagScore',
        language: 'text/fhirpath',
        expression:
          "iif(%amberFlagGroup.item.where(linkId='amberflag-rr').answer.value = true, 1, 0) + iif(%amberFlagGroup.item.where(linkId='amberflag-hr').answer.value = true, 1, 0) + iif(%amberFlagGroup.item.where(linkId='amberflag-sbp').answer.value = true, 1, 0) + iif(%amberFlagGroup.item.where(linkId='amberflag-urine').answer.value = true, 1, 0) + iif(%amberFlagGroup.item.where(linkId='amberflag-fever').answer.value = true, 1, 0) + iif(%amberFlagGroup.item.where(linkId='amberflag-function').answer.value = true, 1, 0) + iif(%amberFlagGroup.item.where(linkId='amberflag-trauma').answer.value = true, 1, 0)"
      }
    }
  ],
  url: 'https://example.com/questionnaires/adult-sepsis-screening',
  version: '0.1.0',
  name: 'Adult Sepsis Primary Healthcare Screening Tool With Extraction',
  title: 'Adult Sepsis Primary Healthcare Screening Tool With Extraction',
  status: 'draft',
  date: '2024-05-15',
  item: [
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        }
      ],
      linkId: 'patient-info',
      text: 'Patient Information',
      type: 'group',
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patientAge'
              }
            }
          ],
          linkId: 'patient-age',
          text: 'Age',
          type: 'integer',
          readOnly: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsRespRate.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: '/min',
                display: 'breaths/min'
              }
            }
          ],
          linkId: 'patient-respiratory-rate',
          text: 'Respiratory rate',
          type: 'decimal',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsTemperature.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'Cel',
                display: '°C'
              }
            }
          ],
          linkId: 'patient-temperature',
          text: 'Body temperature',
          type: 'decimal',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsHeartRate.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: '/min',
                display: 'beats/min'
              }
            }
          ],
          linkId: 'patient-heart-rate',
          text: 'Heart rate',
          type: 'decimal',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObsBloodPressure.entry.resource.component.where(code.coding.where(code = '8480-6')).value.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]',
                display: 'mmHg'
              }
            }
          ],
          linkId: 'patient-bp-systolic',
          text: 'Systolic BP',
          type: 'decimal',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObsBloodPressure.entry.resource.component.where(code.coding.where(code = '8462-4')).value.value"
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: 'mm[Hg]',
                display: 'mmHg'
              }
            }
          ],
          linkId: 'patient-bp-diastolic',
          text: 'Diastolic BP',
          type: 'decimal',
          readOnly: true
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsOxygenSaturation.entry.resource.value.value'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit',
              valueCoding: {
                system: 'http://unitsofmeasure.org',
                code: '%',
                display: '%'
              }
            }
          ],
          linkId: 'patient-spo2',
          text: 'Oxygen saturation',
          type: 'decimal',
          readOnly: true
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        }
      ],
      linkId: 'pi-group',
      text: 'In the context of presumed infection, are any of the following true?',
      type: 'group',
      item: [
        {
          linkId: 'pi-note',
          text: 'Note: Some fields might be pre-filled if results are available from the patient record. Clinicians should always verify the accuracy of pre-filled values before making decisions.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml"><div style="font-weight: 600">Note: Some fields might be pre-filled if results are available from the patient record. Clinicians should always verify the accuracy of pre-filled values before making decisions.</em></div></div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'pi-lookssick',
          text: 'Looks sick',
          type: 'boolean'
        },
        {
          linkId: 'pi-fever',
          text: 'Fever (hot or cold) rigors or general malaise',
          type: 'boolean'
        },
        {
          linkId: 'pi-representation',
          text: 'Re-presentation within 48 hours',
          type: 'boolean'
        },
        {
          linkId: 'pi-immuno',
          text: 'Immuno compromised',
          type: 'boolean'
        },
        {
          linkId: 'pi-malnourished',
          text: 'Malnourished or frail',
          type: 'boolean'
        },
        {
          linkId: 'pi-device',
          text: 'Indwelling medical device',
          type: 'boolean'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%patientAge > 65'
              }
            }
          ],
          linkId: 'pi-ageover65',
          text: '65 years or older',
          type: 'boolean'
        },
        {
          linkId: 'pi-atsi',
          text: 'Aboriginal or Torres Strait Islander peoples',
          type: 'choice',
          answerValueSet:
            'https://healthterminologies.gov.au/fhir/ValueSet/australian-indigenous-status-1'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%atLeastOnePiFilled and %piScore >= 1'
          }
        }
      ],
      linkId: 'redflag-group',
      text: 'Is ONE Red Flag present?',
      type: 'group',
      item: [
        {
          linkId: 'redflag-note',
          text: 'Note: Some fields might be pre-filled if results are available from the patient record. Clinicians should always verify the accuracy of pre-filled values before making decisions.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml"><div style="font-weight: 600">Note: Some fields might be pre-filled if results are available from the patient record. Clinicians should always verify the accuracy of pre-filled values before making decisions.</em></div></div>'
              }
            ]
          },
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsRespRate.entry.resource.value.value > 25'
              }
            }
          ],
          linkId: 'redflag-rr',
          text: 'Respiratory rate >25 BPM',
          type: 'boolean'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%ObsTemperature.entry.resource.value.value < 35.5 or %ObsTemperature.entry.resource.value.value > 38'
              }
            }
          ],
          linkId: 'redflag-temp',
          text: 'Temperature <35.5 or >38',
          type: 'boolean'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%ObsHeartRate.entry.resource.value.value >= 130'
              }
            }
          ],
          linkId: 'redflag-hr',
          text: 'Heart rate >=130 BPM',
          type: 'boolean'
        },
        {
          linkId: 'redflag-sbp',
          text: 'Systolic BP <90 or drop of >=40 from baseline',
          type: 'boolean'
        },
        {
          linkId: 'redflag-urine',
          text: 'Not passed urine last 18 hours',
          type: 'boolean'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%ObsOxygenSaturation.entry.resource.where($this is Observation).first().value.value < 92'
              }
            }
          ],
          linkId: 'redflag-o2',
          text: 'New O2 requirement to keep oxygen saturation >=92%',
          type: 'boolean'
        },
        {
          linkId: 'redflag-rash',
          text: 'Non-blanching rash or mottled/ashen skin',
          type: 'boolean'
        },
        {
          linkId: 'redflag-mental',
          text: 'New or altered mental state',
          type: 'boolean'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-collapsible',
          valueCode: 'default-open'
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%atLeastOneRedFlagFilled and %piScore >= 1 and %redFlagScore = 0'
          }
        }
      ],
      linkId: 'amberflag-group',
      text: 'Is an AMBER Flag present?',
      type: 'group',
      item: [
        {
          linkId: 'amberflag-note',
          text: 'Note: Some fields might be pre-filled if results are available from the patient record. Clinicians should always verify the accuracy of pre-filled values before making decisions.',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml"><div style="font-weight: 600">Note: Some fields might be pre-filled if results are available from the patient record. Clinicians should always verify the accuracy of pre-filled values before making decisions.</em></div></div>'
              }
            ]
          },
          type: 'display'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%ObsRespRate.entry.resource.value.value >= 21 and %ObsRespRate.entry.resource.value.value <= 24'
              }
            }
          ],
          linkId: 'amberflag-rr',
          text: 'Respiratory rate 21-24 BPM',
          type: 'boolean'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%ObsHeartRate.entry.resource.value.value >= 90 and %ObsHeartRate.entry.resource.value.value <= 120'
              }
            }
          ],
          linkId: 'amberflag-hr',
          text: 'Heart rate 90-120 BPM',
          type: 'boolean'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  "%ObsBloodPressure.entry.resource.component.where(code.coding.where(code = '8480-6')).value.value >= 90 and %ObsBloodPressure.entry.resource.component.where(code.coding.where(code = '8480-6')).value.value <= 99"
              }
            }
          ],
          linkId: 'amberflag-sbp',
          text: 'Systolic BP 90-99',
          type: 'boolean'
        },
        {
          linkId: 'amberflag-urine',
          text: 'Not passed urine last 12 hours',
          type: 'boolean'
        },
        {
          linkId: 'amberflag-fever',
          text: 'Fever (hot/cold), rigors or general malaise',
          type: 'boolean'
        },
        {
          linkId: 'amberflag-function',
          text: 'Acute deterioration in functional ability',
          type: 'boolean'
        },
        {
          linkId: 'amberflag-trauma',
          text: 'Recent trauma or surgery',
          type: 'boolean'
        }
      ]
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression: '%atLeastOnePiFilled and %piScore = 0'
          }
        }
      ],
      linkId: 'low-risk-outcome',
      text: 'Screening outcome: Low risk of sepsis, consider other diagnosis.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml"><div style="padding: 16px; margin-bottom: 1rem; color: #334155; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; word-break: break-all; line-height: 1.5;"><div><u>Screening outcome:</u></div> <b>Low risk of sepsis</b>, consider other diagnosis.</div></div>'
          }
        ]
      },
      type: 'display'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              '%atLeastOnePiFilled and %piScore >= 1 and %atLeastOneRedFlagFilled and %redFlagScore >= 1'
          }
        }
      ],
      linkId: 'red-flag-outcome',
      text: 'Screening outcome: Red Flag Sepsis; arrange immediate hospital transfer; administer O2; alert QAS and advise in handover that sepsis is suspected.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml"><div style="padding: 16px; margin-bottom: 1rem; color: #334155; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; word-break: break-all; line-height: 1.5;"><div style="margin-bottom: 4px;"><u>Screening outcome:</u></div><div><b style="color:red">Red Flag Sepsis</b></div><ul style="margin-top: 0px; padding-left: 20px;"><li>Arrange immediate hospital transfer</li><li>Administer O2</li><li>Alert QAS and advise in handover that sepsis is suspected</li></ul></div></div>'
          }
        ]
      },
      type: 'display'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              '%atLeastOnePiFilled and %piScore >= 1 and %atLeastOneRedFlagFilled and %redFlagScore >= 1'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-calculatedExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              '%atLeastOnePiFilled and %piScore >= 1 and %atLeastOneRedFlagFilled and %redFlagScore >= 1'
          }
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#suspected-sepsis-001'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#patient-transfer-001'
              }
            }
          ]
        },
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
          extension: [
            {
              url: 'template',
              valueReference: {
                reference: '#oxygen-administration-001'
              }
            }
          ]
        }
      ],
      linkId: 'extract-red-flag-oxygen',
      text: 'Request administration of O2 for patient',
      type: 'boolean',
      readOnly: true
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              '%atLeastOnePiFilled and %piScore >= 1 and %atLeastOneRedFlagFilled and %redFlagScore = 0 and %atLeastOneAmberFlagFilled and %amberFlagScore >= 1'
          }
        }
      ],
      linkId: 'high-risk-outcome',
      text: 'High risk for sepsis: Use clinical judgement to determine if they can stay in a community, if unsure contact the Virtual Emergency Care Service on 1300 847 833 (clinicians only). If treating in the community, consider: planned follow up in 12 hours; provide sepsis information to patient/family; if deterioration, arrange urgent transfer to hospital.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml"><div style="padding: 16px; margin-bottom: 1rem; color: #334155; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; word-break: break-all; line-height: 1.5;"><div style="margin-bottom: 4px;"><u>Screening outcome:</u></div><div><b style="color:red">High risk for sepsis</b></div><p style="margin: 4px 0;">Use clinical judgement to determine if they can stay in a community, if unsure contact the Virtual Emergency Care Service on 1300 847 833 (clinicians only).</p><div style="margin: 4px 0;">If treating in the community, consider:</div><ul style="margin-top: 0px; padding-left: 20px;"><li>Planned follow up in 12 hours</li><li>Provide sepsis information to patient/family</li><li>If deterioration, arrange urgent transfer to hospital</li></ul></div></div>'
          }
        ]
      },
      type: 'display'
    },
    {
      extension: [
        {
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
          valueExpression: {
            language: 'text/fhirpath',
            expression:
              '%atLeastOnePiFilled and %piScore >= 1 and %atLeastOneRedFlagFilled and %redFlagScore = 0 and %atLeastOneAmberFlagFilled and %amberFlagScore = 0'
          }
        }
      ],
      linkId: 'safety-advice-outcome',
      text: 'Give safety net advice and consider follow up within 12 hours. If deterioration, arrange transfer to hospital.',
      _text: {
        extension: [
          {
            url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
            valueString:
              '<div xmlns="http://www.w3.org/1999/xhtml"><div style="padding: 16px; margin-bottom: 1rem; color: #334155; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; word-break: break-all; line-height: 1.5;"><div><u>Advice:</u></div> <b>Give safety net advice and consider follow up within 12 hours.</b> <div>If deterioration, arrange transfer to hospital.</div></div></div>'
          }
        ]
      },
      type: 'display'
    }
  ]
};
