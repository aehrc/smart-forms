import type { Encounter } from 'fhir/r4';

export const encounterHealthCheck: Encounter = {
  resourceType: 'Encounter',
  id: 'health-check-pat-sf',
  meta: {
    versionId: '1',
    lastUpdated: '2025-07-30T04:53:53.420+00:00',
    profile: ['http://hl7.org.au/fhir/core/StructureDefinition/au-core-encounter']
  },
  status: 'in-progress',
  class: {
    system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
    code: 'AMB',
    display: 'ambulatory'
  },
  serviceType: {
    coding: [
      {
        system: 'http://snomed.info/sct',
        code: '788007007',
        display: 'General practice service'
      }
    ]
  },
  subject: {
    reference: 'Patient/pat-sf',
    identifier: {
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
      value: '69514496771'
    }
  },
  participant: [
    {
      type: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
              code: 'PPRF',
              display: 'primary performer'
            }
          ]
        }
      ],
      individual: {
        identifier: {
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                code: 'EI',
                display: 'Employee number'
              }
            ],
            text: 'Employee Number'
          },
          system: 'http://example.org/SomeOrganization/practitioners',
          value: '23'
        }
      }
    }
  ],
  period: {
    start: '2024-02-10T09:20:00+10:00'
  },
  serviceProvider: {
    display: 'GP Medical Center'
  }
};
